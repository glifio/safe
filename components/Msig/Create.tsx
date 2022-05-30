import PropTypes from 'prop-types'
import { useState, useMemo, Context } from 'react'
import { useRouter } from 'next/router'
import { Message } from '@glif/filecoin-message'
import { FilecoinNumber } from '@glif/filecoin-number'
import {
  useWallet,
  getMaxAffordableFee,
  getTotalAmount,
  InputV2,
  Transaction,
  MsigMethod,
  TxState,
  WalletProviderOpts,
  PendingMsgContextType
} from '@glif/react-components'

import { useWasm } from '../../lib/WasmLoader'
import { navigate } from '../../utils/urlParams'
import { PAGE, EXEC_ACTOR } from '../../constants'

export const Create = ({
  walletProviderOpts,
  pendingMsgContext
}: CreateProps) => {
  const router = useRouter()
  const wallet = useWallet()
  // @ts-expect-error
  const { createMultisig } = useWasm()

  // Input states
  const [vest, setVest] = useState<number>(0)
  const [epoch, setEpoch] = useState<number>(0)
  const [value, setValue] = useState<FilecoinNumber | null>(null)
  const [signers, setSigners] = useState<Array<string>>([wallet.address])
  const [approvals, setApprovals] = useState<number>(1)
  const [isVestValid, setIsVestValid] = useState<boolean>(false)
  const [isEpochValid, setIsEpochValid] = useState<boolean>(false)
  const [isValueValid, setIsValueValid] = useState<boolean>(false)
  const [areSignersValid, setAreSignersValid] = useState<Array<boolean>>([false])
  const [isApprovalsValid, setIsApprovalsValid] = useState<boolean>(false)
  const areAllSignersValid = useMemo<boolean>(() => !areSignersValid.includes(false), [areSignersValid])

  // Transaction states
  const [txState, setTxState] = useState<TxState>(TxState.FillingForm)
  const [txFee, setTxFee] = useState<FilecoinNumber | null>(null)

  const onSignerChange = (index: number, value: string) => {

  }

  const setIsSignerValid = (index: number, valid: boolean) => {
    
  }

  const onSignerDelete = (index: number) => {
    
  }

  // Placeholder message for getting gas params
  const message = useMemo<Message | null>(
    () =>
      isVestValid &&
      isEpochValid &&
      isValueValid &&
      isApprovalsValid &&
      areAllSignersValid &&
      value
        ? new Message({
            to: EXEC_ACTOR,
            from: wallet.address,
            nonce: 0,
            value: value.toAttoFil(),
            method: 2,
            params: createMultisig(
              wallet.address,
              [...signers],
              value.toAttoFil(),
              approvals,
              0,
              vest.toString(),
              epoch.toString()
            ).params,
            gasPremium: 0,
            gasFeeCap: 0,
            gasLimit: 0
          })
        : null,
    [
      isVestValid,
      isEpochValid,
      isValueValid,
      isApprovalsValid,
      areAllSignersValid,
      vest,
      epoch,
      value,
      signers,
      approvals,
      wallet.address,
      createMultisig
    ]
  )

  // Calculate max affordable fee (balance minus value)
  const maxFee = useMemo<FilecoinNumber | null>(() => {
    return value ? getMaxAffordableFee(wallet.balance, value) : null
  }, [value, wallet.balance])

  // Calculate total amount (value plus tx fee)
  const total = useMemo<FilecoinNumber | null>(() => {
    return value && txFee ? getTotalAmount(value, txFee) : null
  }, [value, txFee])

  return (
    <Transaction.Form
      title='Create Safe'
      description='Please enter the details for your new Safe below'
      msig
      method={MsigMethod.CONSTRUCTOR}
      message={message}
      total={total}
      txState={txState}
      setTxState={setTxState}
      maxFee={maxFee}
      txFee={txFee}
      setTxFee={setTxFee}
      onComplete={(cid) =>
        navigate(router, {
          pageUrl: PAGE.MSIG_CREATE_CONFIRM,
          newQueryParams: { cid }
        })
      }
      walletProviderOpts={walletProviderOpts}
      pendingMsgContext={pendingMsgContext}
    >
      <Transaction.Balance address={wallet.address} balance={wallet.balance} />
      {signers.map((signer, index) => (
        <InputV2.Address
          key={index}
          label={`Signer #${index}${index === 0 ? ' (you)' : ''}`}
          value={signer}
          onChange={value => onSignerChange(index, value)}
          setIsValid={valid => setIsSignerValid(index, valid)}
          disabled={index === 0 || txState !== TxState.FillingForm}
          deletable={index !== 0}
          onDelete={() => onSignerDelete(index)}
        />
      ))}
      <InputV2.Number
        label='Required Approvals'
        autofocus
        min={1}
        max={signers.length}
        value={approvals}
        onChange={setApprovals}
        setIsValid={setIsApprovalsValid}
        disabled={txState !== TxState.FillingForm}
      />
      <InputV2.Filecoin
        label='Deposit Amount'
        max={wallet.balance}
        value={value}
        denom='fil'
        onChange={setValue}
        setIsValid={setIsValueValid}
        disabled={txState !== TxState.FillingForm}
      />
      <InputV2.Number
        label='Vest (# blocks)'
        min={0}
        value={vest}
        onChange={setVest}
        setIsValid={setIsVestValid}
        disabled={txState !== TxState.FillingForm}
      />
      {vest > 0 && (
        <InputV2.Number
          label='Start Epoch (block #)'
          min={0}
          value={epoch}
          onChange={setEpoch}
          setIsValid={setIsEpochValid}
          disabled={txState !== TxState.FillingForm}
        />
      )}
    </Transaction.Form>
  )
}

interface CreateProps {
  walletProviderOpts?: WalletProviderOpts
  pendingMsgContext?: Context<PendingMsgContextType>
}

Create.propTypes = {
  walletProviderOpts: PropTypes.object,
  pendingMsgContext: PropTypes.object
}
