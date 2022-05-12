import { useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import { Message } from '@glif/filecoin-message'
import { FilecoinNumber, BigNumber } from '@glif/filecoin-number'
import { useWallet, useWalletProvider } from '@glif/wallet-provider-react'
import {
  getMaxGasFee,
  useGetGasParams,
  useSubmittedMessages,
  InputV2,
  Dialog,
  ShadowBox,
  Transaction,
  LoginOption,
  MessagePending,
  MsigMethod,
  TxState
} from '@glif/react-components'

import { useMsig } from '../../MsigProvider'
import { useWasm } from '../../lib/WasmLoader'
import { navigate } from '../../utils/urlParams'
import { PAGE } from '../../constants'
import { logger } from '../../logger'

interface WithdrawParams {
  to: string
  value: string
  method: MsigMethod
  params: string
}

export const Withdraw = () => {
  const router = useRouter()
  const wallet = useWallet()
  // @ts-expect-error
  const { serializeParams } = useWasm()
  const { Address, AvailableBalance } = useMsig()
  const { pushPendingMessage } = useSubmittedMessages()
  const { loginOption, walletProvider, walletError, getProvider } =
    useWalletProvider()

  // Input states
  const [toAddress, setToAddress] = useState<string>('')
  const [value, setValue] = useState<FilecoinNumber | null>(null)
  const [isToAddressValid, setIsToAddressValid] = useState<boolean>(false)
  const [isValueValid, setIsValueValid] = useState<boolean>(false)

  // Transaction states
  const [txState, setTxState] = useState<TxState>(TxState.FillingForm)
  const [txError, setTxError] = useState<Error | null>(null)

  // Params to pass with the withdraw message
  const [params, setParams] = useState<WithdrawParams | null>(null)

  // Prevent redundant updates to params so that we don't
  // invoke the useGetGasParams hook more than necessary
  const setParamsIfChanged = () => {
    if (!isToAddressValid || !isValueValid) {
      setParams(null)
      return
    }
    if (
      !params ||
      params.to !== toAddress ||
      params.value !== value.toAttoFil()
    )
      setParams({
        to: toAddress,
        value: value.toAttoFil(),
        method: MsigMethod.WITHDRAW,
        params: ''
      })
  }

  // Placeholder message for getting gas params
  const message = useMemo<Message | null>(
    () =>
      params
        ? new Message({
            to: Address,
            from: wallet.address,
            nonce: 0,
            value: '0',
            method: 2,
            params: Buffer.from(serializeParams(params), 'hex').toString(
              'base64'
            ),
            gasPremium: 0,
            gasFeeCap: 0,
            gasLimit: 0
          })
        : null,
    [params, Address, wallet.address, serializeParams]
  )

  // Max transaction fee used for getting gas params. Will be
  // null until the user manually changes the transaction fee.
  const [maxFee, setMaxFee] = useState<FilecoinNumber | null>(null)

  // Load gas parameters when message or max fee changes
  const {
    gasParams,
    loading: gasParamsLoading,
    error: gasParamsError
  } = useGetGasParams(walletProvider, message, maxFee)

  // Calculate maximum transaction fee (fee cap times limit)
  const calculatedFee = useMemo<FilecoinNumber | null>(() => {
    return gasParams
      ? getMaxGasFee(gasParams.gasFeeCap, gasParams.gasLimit)
      : null
  }, [gasParams])

  // Attempt sending message
  const onSend = async () => {
    setTxState(TxState.LoadingTxDetails)
    setTxError(null)
    const provider = await getProvider()
    const newMessage = new Message({
      to: message.to,
      from: message.from,
      nonce: await provider.getNonce(wallet.address),
      value: message.value,
      method: message.method,
      params: message.params,
      gasPremium: gasParams.gasPremium.toAttoFil(),
      gasFeeCap: gasParams.gasFeeCap.toAttoFil(),
      gasLimit: new BigNumber(gasParams.gasLimit.toAttoFil()).toNumber()
    })
    try {
      setTxState(TxState.AwaitingConfirmation)
      const lotusMessage = newMessage.toLotusType()
      const signedMessage = await provider.wallet.sign(
        wallet.address,
        lotusMessage
      )
      setTxState(TxState.MPoolPushing)
      const msgValid = await provider.simulateMessage(lotusMessage)
      if (!msgValid) {
        throw new Error('Filecoin message invalid. No gas or fees were spent.')
      }
      const msgCid = await provider.sendMessage(signedMessage)
      pushPendingMessage(
        newMessage.toPendingMessage(msgCid['/']) as MessagePending
      )
      navigate(router, { pageUrl: PAGE.MSIG_HISTORY })
    } catch (e: any) {
      logger.error(e)
      setTxState(TxState.FillingForm)
      setTxError(e)
    }
  }

  return (
    <Dialog>
      <Transaction.Header
        txState={txState}
        title='Withdraw Filecoin'
        description='Please enter the message details below'
        loginOption={loginOption as LoginOption}
        msig={true}
        method={MsigMethod.WITHDRAW}
        errorMessage={
          gasParamsError?.message || txError?.message || walletError() || ''
        }
      />
      <ShadowBox>
        <Transaction.Balance
          address={Address}
          balance={wallet.balance}
          msigBalance={AvailableBalance}
        />
        <form>
          <InputV2.Address
            label='Recipient'
            autofocus={true}
            value={toAddress}
            onBlur={setParamsIfChanged}
            onChange={setToAddress}
            setIsValid={setIsToAddressValid}
            disabled={gasParamsLoading || txState !== TxState.FillingForm}
          />
          <InputV2.Filecoin
            label='Amount'
            max={AvailableBalance}
            value={value}
            denom='fil'
            onBlur={setParamsIfChanged}
            onChange={setValue}
            setIsValid={setIsValueValid}
            disabled={gasParamsLoading || txState !== TxState.FillingForm}
          />
          <Transaction.Fee
            maxFee={maxFee}
            setMaxFee={setMaxFee}
            affordableFee={wallet.balance}
            calculatedFee={calculatedFee}
            gasLoading={gasParamsLoading}
            disabled={gasParamsLoading || txState !== TxState.FillingForm}
          />
        </form>
        {(gasParamsLoading || calculatedFee) && (
          <Transaction.Total total={value} />
        )}
      </ShadowBox>
      <Transaction.Buttons
        cancelDisabled={txState !== TxState.FillingForm}
        sendDisabled={
          txState !== TxState.FillingForm || gasParamsLoading || !calculatedFee
        }
        onClickSend={onSend}
      />
    </Dialog>
  )
}
