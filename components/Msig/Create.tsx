import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/router'
import { Message } from '@glif/filecoin-message'
import { FilecoinNumber, BigNumber } from '@glif/filecoin-number'
import {
  getMaxGasFee,
  getTotalAmount,
  useGetGasParams,
  useWallet,
  useWalletProvider,
  InputV2,
  Dialog,
  ShadowBox,
  Transaction,
  LoginOption,
  MsigMethod,
  TxState
} from '@glif/react-components'

interface CreateParams {
  vest: number
  epoch: number
  value: string
  signers: Array<string>
  approvals: number
}

import { useWasm } from '../../lib/WasmLoader'
import { navigate } from '../../utils/urlParams'
import { PAGE, EXEC_ACTOR } from '../../constants'
import { logger } from '../../logger'

export const Create = () => {
  const router = useRouter()
  const wallet = useWallet()
  // @ts-expect-error
  const { createMultisig } = useWasm()
  const { loginOption, walletProvider, walletError, getProvider } =
    useWalletProvider()

  // Input states
  const [vest, setVest] = useState<number>(0)
  const [epoch, setEpoch] = useState<number>(0)
  const [value, setValue] = useState<FilecoinNumber | null>(null)
  const [signers, setSigners] = useState<Array<string>>([wallet.address])
  const [approvals, setApprovals] = useState<number>(1)
  const [isVestValid, setIsVestValid] = useState<boolean>(false)
  const [isEpochValid, setIsEpochValid] = useState<boolean>(false)
  const [isValueValid, setIsValueValid] = useState<boolean>(false)
  const [isSignersValid, setIsSignersValid] = useState<boolean>(false)
  const [isApprovalsValid, setIsApprovalsValid] = useState<boolean>(false)

  // Transaction states
  const [txState, setTxState] = useState<TxState>(TxState.FillingForm)
  const [txError, setTxError] = useState<Error | null>(null)

  // Params to pass with the create message
  const [params, setParams] = useState<CreateParams | null>(null)

  // Serialize params with the given address and nonce
  const serializeParams = useCallback(
    (params: CreateParams, address: string, nonce: number): string =>
      createMultisig(
        address,
        [...params.signers],
        params.value,
        params.approvals,
        nonce,
        params.vest.toString(),
        params.epoch.toString()
      ),
    [createMultisig]
  )

  // Prevent redundant updates to params so that we don't
  // invoke the useGetGasParams hook more than necessary
  const setParamsIfChanged = () => {
    if (
      !isVestValid ||
      !isEpochValid ||
      !isValueValid ||
      !isSignersValid ||
      !isApprovalsValid
    ) {
      setParams(null)
      return
    }
    if (
      !params ||
      params.vest !== vest ||
      params.epoch !== epoch ||
      params.value !== value.toAttoFil() ||
      JSON.stringify(params.signers) !== JSON.stringify(signers) ||
      params.approvals !== approvals
    )
      setParams({
        vest: vest,
        epoch: vest > 0 ? epoch : 0,
        value: value.toAttoFil(),
        signers: [...signers],
        approvals: approvals
      })
  }

  // Placeholder message for getting gas params
  const message = useMemo<Message | null>(
    () =>
      params
        ? new Message({
            to: EXEC_ACTOR,
            from: wallet.address,
            nonce: 0,
            value: params.value,
            method: 2,
            params: serializeParams(params, wallet.address, 0),
            gasPremium: 0,
            gasFeeCap: 0,
            gasLimit: 0
          })
        : null,
    [params, wallet.address, serializeParams]
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

  // Calculate total amount (value plus max fee)
  const total = useMemo<FilecoinNumber | null>(() => {
    return value && calculatedFee ? getTotalAmount(value, calculatedFee) : null
  }, [value, calculatedFee])

  // Attempt sending message
  const onSend = async () => {
    setTxState(TxState.LoadingTxDetails)
    setTxError(null)
    const provider = await getProvider()
    const nonce = await provider.getNonce(wallet.address)
    const newMessage = new Message({
      to: message.to,
      from: message.from,
      nonce,
      value: message.value,
      method: message.method,
      params: serializeParams(params, wallet.address, nonce),
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
      navigate(router, {
        pageUrl: PAGE.MSIG_CREATE_CONFIRM,
        newQueryParams: { cid: msgCid['/'] }
      })
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
        title='Create Safe'
        description='Please enter the details for your new Safe below'
        loginOption={loginOption as LoginOption}
        msig={true}
        method={MsigMethod.CONSTRUCTOR}
        errorMessage={
          gasParamsError?.message || txError?.message || walletError() || ''
        }
      />
      <ShadowBox>
        <Transaction.Balance
          address={wallet.address}
          balance={wallet.balance}
        />
        <form>
          <InputV2.Number
            label='Required Approvals'
            min={1}
            max={signers.length}
            value={approvals}
            onBlur={setParamsIfChanged}
            onEnter={setParamsIfChanged}
            onChange={setApprovals}
            setIsValid={setIsApprovalsValid}
            disabled={gasParamsLoading || txState !== TxState.FillingForm}
          />
          <InputV2.Filecoin
            label='Deposit Amount'
            max={wallet.balance}
            value={value}
            denom='fil'
            onBlur={setParamsIfChanged}
            onEnter={setParamsIfChanged}
            onChange={setValue}
            setIsValid={setIsValueValid}
            disabled={gasParamsLoading || txState !== TxState.FillingForm}
          />
          <InputV2.Number
            label='Vest (# blocks)'
            min={0}
            value={vest}
            onBlur={setParamsIfChanged}
            onEnter={setParamsIfChanged}
            onChange={setVest}
            setIsValid={setIsVestValid}
            disabled={gasParamsLoading || txState !== TxState.FillingForm}
          />
        </form>
        {total && <Transaction.Total total={total} />}
      </ShadowBox>
      <Transaction.Buttons
        cancelDisabled={txState !== TxState.FillingForm}
        sendDisabled={txState !== TxState.FillingForm || !total}
        onClickSend={onSend}
      />
    </Dialog>
  )
}
