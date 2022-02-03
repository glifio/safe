import React, { useCallback, useState, useMemo } from 'react'
import { Message } from '@glif/filecoin-message'
import { BigNumber } from '@glif/filecoin-number'
import { useRouter } from 'next/router'
import {
  Box,
  Button,
  ButtonClose,
  Form,
  Card,
  useSubmittedMessages,
  MessagePending as MessagePendingGQL,
  ErrorCard,
  Input,
  Label
} from '@glif/react-components'
import {
  useWalletProvider,
  useWallet,
  ConfirmationCard,
  CustomizeFee
} from '@glif/wallet-provider-react'

import { logger } from '../../../logger'
import { useMsig } from '../../../MsigProvider'
import { CardHeader, ChangeNumApprovalsHeader } from '../Shared'
import { useWasm } from '../../../lib/WasmLoader'
import { emptyGasInfo, MSIG_METHOD, PAGE } from '../../../constants'
import { navigate } from '../../../utils/urlParams'

const ChangeApprovalThreshold = () => {
  const {
    getProvider,
    walletError,
    resetWalletError,
    loginOption,
    walletProvider
  } = useWalletProvider()
  const { pushPendingMessage } = useSubmittedMessages()
  const {
    Address: address,
    AvailableBalance: balance,
    Signers,
    NumApprovalsThreshold
  } = useMsig()
  const wallet = useWallet()
  // @ts-expect-error
  const { serializeParams } = useWasm()
  const [step, setStep] = useState(1)
  const [attemptingTx, setAttemptingTx] = useState(false)
  const [newThreshold, setNewThreshold] = useState(0)
  const [newThresholdError, setNewThresholdError] = useState('')
  const [uncaughtError, setUncaughtError] = useState('')
  const [fetchingTxDetails, setFetchingTxDetails] = useState(false)
  const [mPoolPushing, setMPoolPushing] = useState(false)
  const [gasError, setGasError] = useState('')
  const [gasInfo, setGasInfo] = useState(emptyGasInfo)
  const [frozen, setFrozen] = useState(false)
  const router = useRouter()

  const onClose = useCallback(() => {
    navigate(router, { pageUrl: PAGE.MSIG_ADMIN })
  }, [router])

  const onComplete = useCallback(() => {
    navigate(router, { pageUrl: PAGE.MSIG_HISTORY })
  }, [router])

  const errorMsg = useMemo(() => {
    if (walletError()) return walletError()
    if (uncaughtError) return uncaughtError
    return ''
  }, [uncaughtError, walletError])

  const constructMsg = useCallback(
    (nonce = 0) => {
      const innerParams = {
        NewTreshold: Number(newThreshold)
      }

      const serializedInnerParams = Buffer.from(
        serializeParams(innerParams),
        'hex'
      ).toString('base64')

      const outerParams = {
        to: address,
        value: '0',
        method: MSIG_METHOD.CHANGE_NUM_APPROVALS_THRESHOLD,
        params: serializedInnerParams
      }

      const serializedOuterParams = Buffer.from(
        serializeParams(outerParams),
        'hex'
      ).toString('base64')

      const message = new Message({
        to: address,
        from: wallet.address,
        value: '0',
        method: MSIG_METHOD.PROPOSE,
        nonce,
        params: serializedOuterParams,
        gasFeeCap: gasInfo.gasFeeCap.toAttoFil(),
        gasLimit: new BigNumber(gasInfo.gasLimit.toAttoFil()).toNumber(),
        gasPremium: gasInfo.gasPremium.toAttoFil()
      })

      return { message }
    },
    [address, wallet.address, gasInfo, newThreshold, serializeParams]
  )

  const sendMsg = async () => {
    setFetchingTxDetails(true)
    const provider = await getProvider()
    if (provider) {
      const nonce = await provider.getNonce(wallet.address)
      const { message } = constructMsg(nonce)
      setFetchingTxDetails(false)
      const messageObj = message.toLotusType()
      const signedMessage = await provider.wallet.sign(
        wallet.address,
        messageObj
      )

      setMPoolPushing(true)
      const validMsg = await provider.simulateMessage(messageObj)
      if (validMsg) {
        const msgCid = await provider.sendMessage(signedMessage)
        return message.toPendingMessage(msgCid['/']) as MessagePendingGQL
      }
      throw new Error('Filecoin message invalid. No gas or fees were spent.')
    }
    throw new Error('There was an issue when sending your message.')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (step === 1 && newThreshold <= 0) {
      setNewThresholdError('New approval threshold must be greater than 0')
    } else if (step === 1 && newThreshold === NumApprovalsThreshold) {
      setNewThresholdError(`Approval threshold is already ${newThreshold}`)
    } else if (step === 1 && newThreshold > Signers.length) {
      setNewThresholdError(
        'New approval threshold cannot be greater than the total number of Safe owners'
      )
    } else if (step === 1) {
      setStep(2)
    } else if (step === 2) {
      setAttemptingTx(true)
      try {
        const msgPending = await sendMsg()
        setAttemptingTx(false)
        if (msgPending) {
          pushPendingMessage(msgPending)
          onComplete()
        }
      } catch (err) {
        if (err.message.includes('19')) {
          setUncaughtError('Insufficient Safe available balance.')
        } else if (err.message.includes('2')) {
          setUncaughtError(
            `${wallet.address} has insufficient funds to pay for the transaction.`
          )
        } else if (err.message.includes('18')) {
          setUncaughtError(
            `${wallet.address} is not a signer of the Safe ${address}.`
          )
        } else if (
          err.message
            .toLowerCase()
            .includes('data is invalid : unexpected method')
        ) {
          setUncaughtError(
            'Please make sure expert mode is enabled on your Ledger Filecoin app.'
          )
        } else {
          logger.error(
            err instanceof Error ? err.message : JSON.stringify(err),
            'ChangeApprovalThreshold'
          )
          setUncaughtError(err.message || err)
        }
        setStep(2)
      } finally {
        setFetchingTxDetails(false)
        setAttemptingTx(false)
        setMPoolPushing(false)
      }
    }
  }

  const isSubmitBtnDisabled = useMemo(() => {
    if (frozen) return true
    if (step === 1) return false
    if (step === 3 && gasError) return true
    if (uncaughtError) return false
    if (attemptingTx) return true
    if (step > 3) return true
  }, [frozen, step, gasError, uncaughtError, attemptingTx])

  const isBackBtnDisabled = useMemo(() => {
    if (frozen) return true
    if (attemptingTx) return true
    if (fetchingTxDetails) return true
    if (mPoolPushing) return true
    return false
  }, [frozen, attemptingTx, fetchingTxDetails, mPoolPushing])

  return (
    <Box display='flex' flexDirection='column' width='100%'>
      <ButtonClose
        role='button'
        type='button'
        justifySelf='flex-end'
        marginLeft='auto'
        onClick={() => {
          setAttemptingTx(false)
          setUncaughtError('')
          resetWalletError()
          onClose()
        }}
      />
      <Form onSubmit={onSubmit}>
        <Box
          maxWidth={13}
          width='100%'
          minWidth={11}
          display='flex'
          flexDirection='column'
          justifyContent='flex-start'
        >
          <Box>
            {!!errorMsg && (
              <ErrorCard
                error={errorMsg}
                reset={() => {
                  setAttemptingTx(false)
                  setUncaughtError('')
                  setGasError('')
                  resetWalletError()
                  setStep(2)
                }}
              />
            )}
            {attemptingTx && (
              <ConfirmationCard
                loading={fetchingTxDetails || mPoolPushing}
                loginOption={loginOption}
                currentStep={3}
                totalSteps={3}
                msig
                method={MSIG_METHOD.CHANGE_NUM_APPROVALS_THRESHOLD}
              />
            )}
            {!attemptingTx && !errorMsg && (
              <Card
                display='flex'
                flexDirection='column'
                justifyContent='space-between'
                border='none'
                width='auto'
                my={2}
                backgroundColor='blue.muted700'
              >
                <ChangeNumApprovalsHeader step={step} />
              </Card>
            )}
            <Box boxShadow={2} borderRadius={4}>
              <>
                <CardHeader
                  msig
                  address={address}
                  msigBalance={balance}
                  signerBalance={wallet.balance}
                />
                <Box width='100%' p={3} border={0} bg='background.screen'>
                  <Input.Number
                    name='numApprovalsThreshold'
                    label='Required approvals'
                    value={newThreshold}
                    onChange={(e) => {
                      setNewThresholdError('')
                      setNewThreshold(e.target.value)
                    }}
                    placeholder={NumApprovalsThreshold}
                    disabled={step > 1}
                    error={newThresholdError}
                  />
                  {newThresholdError && (
                    <Label
                      pt={2}
                      color='status.fail.background'
                      m={0}
                      textAlign='right'
                    >
                      {newThresholdError}
                    </Label>
                  )}
                </Box>
              </>
              {step > 1 && (
                <Box
                  display='flex'
                  flexDirection='row'
                  justifyContent='space-between'
                  width='100%'
                  p={3}
                  border={0}
                  bg='background.screen'
                >
                  <CustomizeFee
                    message={constructMsg().message.toLotusType()}
                    gasInfo={gasInfo}
                    setGasInfo={setGasInfo}
                    setFrozen={setFrozen}
                    setError={setGasError}
                    error={gasError}
                    feeMustBeLessThanThisAmount={wallet.balance}
                    wallet={wallet}
                    gasEstimateMaxFee={walletProvider.gasEstimateMaxFee}
                    gasEstimateMessageGas={walletProvider.gasEstimateMessageGas}
                  />
                </Box>
              )}
            </Box>
          </Box>
          <Box
            display='flex'
            flexDirection='row'
            justifyContent='space-between'
            alignItems='flex-end'
            margin='auto'
            maxWidth={13}
            width='100%'
            minWidth={11}
            maxHeight={12}
            py={4}
          >
            <Button
              title='Back'
              variant='secondary'
              onClick={() => {
                setAttemptingTx(false)
                setUncaughtError('')
                setGasError('')
                resetWalletError()
                if (step === 1) {
                  onClose()
                } else {
                  setStep(step - 1)
                }
              }}
              disabled={isBackBtnDisabled}
            />
            <Button
              variant='primary'
              title='Next'
              disabled={isSubmitBtnDisabled}
              type='submit'
            />
          </Box>
        </Box>
      </Form>
    </Box>
  )
}

export default ChangeApprovalThreshold
