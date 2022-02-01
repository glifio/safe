import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { BigNumber, FilecoinNumber } from '@glif/filecoin-number'
import { Address, Message } from '@glif/filecoin-message'
import {
  Box,
  Button,
  ButtonClose,
  StepHeader,
  Form,
  Card,
  ErrorCard,
  useSubmittedMessages,
  MessagePending,
  Text,
  MsigTransaction,
  Label,
  getMethodName,
  Badge
} from '@glif/react-components'
import {
  useWalletProvider,
  useWallet,
  ConfirmationCard,
  CustomizeFee
} from '@glif/wallet-provider-react'

import { useMsig } from '../../../MsigProvider'
import { CardHeader, ApproveCancelHeaderText } from '../Shared'
import { emptyGasInfo, PAGE } from '../../../constants'
import { navigate } from '../../../utils/urlParams'
import { useWasm } from '../../../lib/WasmLoader'
import truncateAddress from '../../../utils/truncateAddress'

const ProposalLineItem = styled(Box).attrs((props) => {
  return {
    width: '100%',
    border: 0,
    px: 4,
    py: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...props
  }
})``

export default function ApproveReject() {
  const {
    getProvider,
    walletError,
    resetWalletError,
    loginOption,
    walletProvider
  } = useWalletProvider()
  const { pushPendingMessage } = useSubmittedMessages()
  const wallet = useWallet()
  // @ts-expect-error
  const { serializeParams } = useWasm()
  const { Address: address, AvailableBalance: balance } = useMsig()
  const [attemptingTx, setAttemptingTx] = useState(false)
  const [uncaughtError, setUncaughtError] = useState('')
  const [gasError, setGasError] = useState('')
  const [gasInfo, setGasInfo] = useState(emptyGasInfo)
  const [frozen, setFrozen] = useState(false)
  const [fetchingTxDetails, setFetchingTxDetails] = useState(false)
  const [mPoolPushing, setMPoolPushing] = useState(false)
  const router = useRouter()

  const proposal = useMemo(
    () => JSON.parse(decodeURI(router.query.proposal as string)),
    [router]
  ) as MsigTransaction & { approvalsUntilExecution: number }

  const method = useMemo(() => {
    if (router.pathname.includes(PAGE.MSIG_APPROVE)) return 3
    if (router.pathname.includes(PAGE.MSIG_CANCEL)) return 4
  }, [router])

  const onClose = useCallback(() => {
    navigate(router, { pageUrl: PAGE.MSIG_HOME })
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
    const params = {
      TxnID: proposal.id,
      ProposalHashData: proposal.proposalHash
    }

    const serializedParams = Buffer.from(serializeParams(params), 'hex')
    return {
      message: new Message({
        to: address,
        from: wallet.address,
        value: '0',
        method,
        nonce,
        params: serializedParams.toString('base64'),
        gasFeeCap: gasInfo.gasFeeCap.toAttoFil(),
        gasLimit: new BigNumber(gasInfo.gasLimit.toAttoFil()).toNumber(),
        gasPremium: gasInfo.gasPremium.toAttoFil()
      })
    }
  }

  const sendMsg = async (): Promise<MessagePending> => {
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
        return message.toPendingMessage(msgCid['/'])
      }
      throw new Error('Filecoin message invalid. No gas or fees were spent.')
    }
    throw new Error('There was an issue when sending your message.')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setAttemptingTx(true)
    try {
      const pendingMsg = await sendMsg()
      setAttemptingTx(false)
      if (pendingMsg) {
        pushPendingMessage(pendingMsg)
        onComplete()
      }
    } catch (err) {
      if (err.message.includes('19')) {
        setUncaughtError('Insufficient Multisig wallet available balance.')
      } else if (err.message.includes('2')) {
        setUncaughtError(
          `${wallet.address} has insufficient funds to pay for the transaction.`
        )
      } else if (err.message.includes('18')) {
        setUncaughtError(
          `${wallet.address} is not a signer of the multisig wallet ${address}.`
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
        // reportError(20, false, err, err.message, err.stack)
        setUncaughtError(err.message || err)
      }
    } finally {
      setFetchingTxDetails(false)
      setAttemptingTx(false)
      setMPoolPushing(false)
    }
  }

  const isSubmitBtnDisabled = useMemo(() => {
    if (frozen) return true
    if (uncaughtError) return true
    if (attemptingTx) return true
    if (gasError) return true
  }, [frozen, uncaughtError, attemptingTx, gasError])

  const isBackBtnDisabled = useMemo(() => {
    if (frozen) return true
    if (attemptingTx) return true
    if (fetchingTxDetails) return true
    if (mPoolPushing) return true
    return false
  }, [frozen, attemptingTx, fetchingTxDetails, mPoolPushing])

  return (
    <>
      <Box display='flex' flexDirection='column' width='100%'>
        <ButtonClose
          role='button'
          type='button'
          justifySelf='flex-end'
          marginLeft='auto'
          onClick={() => {
            setAttemptingTx(false)
            setUncaughtError('')
            setGasError('')
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
                  }}
                />
              )}
              {attemptingTx && (
                <ConfirmationCard
                  loading={fetchingTxDetails || mPoolPushing}
                  loginOption={loginOption}
                  currentStep={5}
                  totalSteps={5}
                  msig
                  method={method}
                  approvalsUntilExecution={proposal.approvalsUntilExecution}
                />
              )}
              {!attemptingTx && !errorMsg && (
                <>
                  <Card
                    display='flex'
                    flexDirection='column'
                    justifyContent='space-between'
                    border='none'
                    width='auto'
                    my={2}
                    backgroundColor='blue.muted700'
                  >
                    <StepHeader
                      title={
                        method === 3
                          ? 'Approving Safe Proposal'
                          : 'Canceling Safe Proposal'
                      }
                      currentStep={attemptingTx ? 2 : 1}
                      totalSteps={2}
                      glyphAcronym='Ap'
                    />
                    <Box mt={3} mb={4}>
                      <ApproveCancelHeaderText step={attemptingTx ? 2 : 1} />
                    </Box>
                  </Card>
                </>
              )}
              <Box boxShadow={2} borderRadius={4}>
                <CardHeader
                  msig
                  address={address}
                  msigBalance={balance}
                  signerBalance={wallet.balance}
                />
                <Box
                  width='100%'
                  p={3}
                  border={0}
                  bg='background.screen'
                  display='flex'
                  flexDirection='column'
                >
                  <Label mb={3} color='core.primary'>
                    Proposal details:
                  </Label>
                  {Object.entries(proposal).map(([key, value]) => {
                    switch (key) {
                      case 'value':
                        return (
                          <ProposalLineItem>
                            <Text m={0}>{key}</Text>
                            <Text m={0}>{`${new FilecoinNumber(
                              value as string,
                              'attofil'
                            ).toFil()} FIL`}</Text>
                          </ProposalLineItem>
                        )
                      case 'id':
                        return (
                          <ProposalLineItem>
                            <Text m={0}>{key}</Text>
                            <Text m={0}>{value}</Text>
                          </ProposalLineItem>
                        )
                      case 'method':
                        return (
                          <ProposalLineItem>
                            <Text m={0}>{key}</Text>
                            <Badge color='purple'>
                              {getMethodName('/multisig', value as number)}
                            </Badge>
                          </ProposalLineItem>
                        )
                      case 'approved':
                        return (
                          <ProposalLineItem>
                            <Text m={0}>approvals</Text>
                            <Text m={0}>{(value as Address[]).length}</Text>
                          </ProposalLineItem>
                        )
                      case 'to': {
                        const toAddr = value as Address
                        let toAddrTxt = ''
                        if (toAddr.id && toAddr.robust) {
                          toAddrTxt = `${truncateAddress(toAddr.robust)} (${
                            toAddr.id
                          })`
                        } else {
                          toAddrTxt = toAddr.robust || toAddr.id
                        }
                        if (toAddr)
                          return (
                            <ProposalLineItem>
                              <Text m={0}>{key}</Text>
                              <Text m={0}>{toAddrTxt}</Text>
                            </ProposalLineItem>
                          )
                      }
                    }
                  })}
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
                    gasEstimateMessageGas={walletProvider.gasEstimateMessageGas}
                    gasEstimateMaxFee={walletProvider.gasEstimateMaxFee}
                  />
                </Box>
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
                  const wasAttemptingTx = attemptingTx
                  setAttemptingTx(false)
                  setUncaughtError('')
                  setGasError('')
                  resetWalletError()

                  if (wasAttemptingTx) {
                    onClose()
                  } else {
                    router.back()
                  }
                }}
                disabled={isBackBtnDisabled}
              />
              <Button
                variant='primary'
                title='Submit'
                disabled={isSubmitBtnDisabled}
                type='submit'
              />
            </Box>
          </Box>
        </Form>
      </Box>
    </>
  )
}
