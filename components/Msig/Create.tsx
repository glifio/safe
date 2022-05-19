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
        epoch: epoch,
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
      />
      <ShadowBox>
        <Transaction.Balance
          address={wallet.address}
          balance={wallet.balance}
        />
        <form>
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
