import PropTypes from 'prop-types'
import { useState, useMemo, Context, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Message } from '@glif/filecoin-message'
import { FilecoinNumber } from '@glif/filecoin-number'
import { validateAddressString } from '@glif/filecoin-address'
import {
  navigate,
  useWallet,
  InputV2,
  Transaction,
  MsigMethod,
  TxState,
  WalletProviderOpts,
  PendingMsgContextType
} from '@glif/react-components'

import { useWasm } from '../../lib/WasmLoader'
import { PAGE, EXEC_ACTOR } from '../../constants'
import { logger } from '../../logger'

const IS_PROD = process.env.NEXT_PUBLIC_IS_PROD

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

  // Ignore trailing signer inputs that are empty
  const acceptedSigners = useMemo<Array<string>>(() => {
    const accepted = [...signers]
    while (accepted[accepted.length - 1] === '') accepted.pop()
    return accepted
  }, [signers])

  // Transaction states
  const [txState, setTxState] = useState<TxState>(TxState.FillingForm)
  const [txFee, setTxFee] = useState<FilecoinNumber | null>(null)

  // Reset epoch when vest is "0"
  useEffect(() => {
    if (vest === 0) {
      setEpoch(0)
      setIsEpochValid(true)
    }
  }, [vest, setEpoch, setIsEpochValid])

  // Update a signer address
  const onChangeSigner = (index: number, value: string) => {
    const newSigners = [...signers]
    newSigners[index] = value
    setSigners(newSigners)
  }

  // Delete a signer
  const onDeleteSigner = (index: number) => {
    const newSigners = [...signers]
    newSigners.splice(index, 1)
    setSigners(newSigners)
  }

  // Add a signer
  const onAddSigner = () => {
    const newSigners = [...signers]
    newSigners.push('')
    setSigners(newSigners)
  }

  // Placeholder message for getting gas params
  const message = useMemo<Message | null>(() => {
    try {
      return isVestValid &&
        isEpochValid &&
        isValueValid &&
        // Manually check signer validity to prevent passing invalid addresses to createMultisig.
        // This can happen due to multiple rerenders when using setIsValid from InputV2.Address.
        !acceptedSigners.some((signer) => !validateAddressString(signer)) &&
        // For the same reason, check whether value is a FileCoinNumber and not null
        value
        ? new Message({
            to: EXEC_ACTOR,
            from: wallet.address,
            nonce: 0,
            value: value.toAttoFil(),
            method: 2,
            params: createMultisig(
              wallet.address,
              [...acceptedSigners],
              value.toAttoFil(),
              approvals,
              0,
              vest.toString(),
              epoch.toString(),
              !!IS_PROD ? 'mainnet' : 'calibrationnet'
            ).Params,
            gasPremium: 0,
            gasFeeCap: 0,
            gasLimit: 0
          })
        : null
    } catch (e) {
      logger.error(e)
      return null
    }
  }, [
    isVestValid,
    isEpochValid,
    isValueValid,
    vest,
    epoch,
    value,
    approvals,
    acceptedSigners,
    wallet.address,
    createMultisig
  ])

  // Calculate max affordable fee (balance minus value)
  const maxFee = useMemo<FilecoinNumber | null>(() => {
    return value ? wallet.balance.minus(value) : null
  }, [value, wallet.balance])

  // Calculate total amount (value plus tx fee)
  const total = useMemo<FilecoinNumber | null>(() => {
    return value && txFee ? value.plus(txFee) : null
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
          params: { cid }
        })
      }
      walletProviderOpts={walletProviderOpts}
      pendingMsgContext={pendingMsgContext}
    >
      <Transaction.Balance address={wallet.address} balance={wallet.balance} />
      {signers.map((signer, index) => (
        <InputV2.Address
          key={index}
          label={`Signer ${index + 1}${index === 0 ? ' (you)' : ''}`}
          value={signer}
          onChange={(value) => onChangeSigner(index, value)}
          disabled={index === 0 || txState !== TxState.FillingForm}
          deletable={index !== 0}
          onDelete={() => onDeleteSigner(index)}
        />
      ))}
      <InputV2.Button
        value='Add Signer'
        onClick={onAddSigner}
        disabled={txState !== TxState.FillingForm}
      />
      <InputV2.SelectRange
        label='Required Approvals'
        info={`The Safe will have ${acceptedSigners.length} owner${
          acceptedSigners.length > 1 ? 's' : ''
        }`}
        min={1}
        max={acceptedSigners.length}
        value={approvals}
        onChange={setApprovals}
        disabled={txState !== TxState.FillingForm}
      />
      <InputV2.Filecoin
        label='Deposit Amount'
        autoFocus
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
