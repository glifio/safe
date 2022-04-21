import React, { useCallback, useMemo, useState } from 'react'
import { Message } from '@glif/filecoin-message'
import { BigNumber } from '@glif/filecoin-number'
import { useRouter } from 'next/router'
import {
  Box,
  Button,
  Form,
  Card,
  ErrorCard,
  useSubmittedMessages,
  MessagePending as MessagePendingGQL
} from '@glif/react-components'
import {
  useWalletProvider,
  useWallet,
  ConfirmationCard,
  CustomizeFee
} from '@glif/wallet-provider-react'

import { CardHeader, AddRmSignerHeader } from '../Shared'
import Preface from './Prefaces'
import { useWasm } from '../../../lib/WasmLoader'
import { emptyGasInfo, PAGE, MSIG_METHOD } from '../../../constants'
import { logger } from '../../../logger'
import { RemoveSignerInput } from './SignerInput'
import { useMsig } from '../../../MsigProvider'
import { ADDRESS_PROPTYPE } from '../../../customPropTypes'
import { navigate } from '../../../utils/urlParams'

const RemoveSigner = ({ signerAddress }) => {
  const {
    getProvider,
    walletError,
    resetWalletError,
    loginOption,
    walletProvider
  } = useWalletProvider()
  const { pushPendingMessage } = useSubmittedMessages()
  const wallet = useWallet()
  const router = useRouter()
  // @ts-expect-error
  const { serializeParams } = useWasm()
  const [step, setStep] = useState(1)
  const [attemptingTx, setAttemptingTx] = useState(false)
  const [uncaughtError, setUncaughtError] = useState('')
  const [fetchingTxDetails, setFetchingTxDetails] = useState(false)
  const [mPoolPushing, setMPoolPushing] = useState(false)
  const [gasError, setGasError] = useState('')
  const [gasInfo, setGasInfo] = useState(emptyGasInfo)
  const [frozen, setFrozen] = useState(false)
  const { Address: address, AvailableBalance: balance } = useMsig()
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

  const constructMsg = (nonce = 0) => {
    const innerParams = {
      Signer: signerAddress,
      Decrease: false
    }

    const serializedInnerParams = Buffer.from(
      serializeParams(innerParams),
      'hex'
    ).toString('base64')

    const outerParams = {
      To: address,
      Value: '0',
      Method: MSIG_METHOD.REMOVE_SIGNER,
      Params: serializedInnerParams
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

    return { message, params: { ...outerParams, params: { ...innerParams } } }
  }

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
    if (step === 1) {
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
            'RemoveSigner'
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
    if (step === 2 && gasError) return true
    if (uncaughtError) return false
    if (attemptingTx) return true
    if (step > 2) return true
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
                currentStep={2}
                totalSteps={2}
                msig
                method={MSIG_METHOD.REMOVE_SIGNER}
              />
            )}
            {!attemptingTx && step > 1 && !errorMsg && (
              <Card
                display='flex'
                flexDirection='column'
                justifyContent='space-between'
                border='none'
                width='auto'
                my={2}
                backgroundColor='blue.muted700'
              >
                <AddRmSignerHeader
                  step={step}
                  method={MSIG_METHOD.REMOVE_SIGNER}
                />
              </Card>
            )}
            {step === 1 && <Preface method={MSIG_METHOD.REMOVE_SIGNER} />}
            <>
              {step >= 2 && (
                <>
                  <Box boxShadow={2} borderRadius={4}>
                    <CardHeader
                      msig
                      address={address}
                      msigBalance={balance}
                      signerBalance={wallet.balance}
                    />
                    <Box width='100%' p={3} border={0} bg='background.screen'>
                      <RemoveSignerInput signerAddress={signerAddress} />
                    </Box>
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
                        gasEstimateMessageGas={
                          walletProvider.gasEstimateMessageGas
                        }
                      />
                    </Box>
                  </Box>
                </>
              )}
            </>
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

RemoveSigner.propTypes = {
  signerAddress: ADDRESS_PROPTYPE
}

RemoveSigner.defaultProps = {
  signerAddress: ''
}

export default RemoveSigner
