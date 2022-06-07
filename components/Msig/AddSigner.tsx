import PropTypes from 'prop-types'
import { useState, useMemo, Context } from 'react'
import { useRouter } from 'next/router'
import { Message } from '@glif/filecoin-message'
import { FilecoinNumber } from '@glif/filecoin-number'
import { validateAddressString } from '@glif/filecoin-address'
import {
  useWallet,
  InputV2,
  Transaction,
  MsigMethod,
  TxState,
  WalletProviderOpts,
  PendingMsgContextType
} from '@glif/react-components'

import { useMsig } from '../../MsigProvider'
import { useWasm } from '../../lib/WasmLoader'
import { navigate } from '../../utils/urlParams'
import { PAGE } from '../../constants'
import { logger } from '../../logger'

export const AddSigner = ({
  walletProviderOpts,
  pendingMsgContext
}: AddSignerProps) => {
  const router = useRouter()
  const wallet = useWallet()
  // @ts-expect-error
  const { serializeParams } = useWasm()
  const { Address, AvailableBalance, Signers, NumApprovalsThreshold } =
    useMsig()

  // Input states
  const [signer, setSigner] = useState<string>('')
  const [increase, setIncrease] = useState<boolean>(false)

  // Transaction states
  const [txState, setTxState] = useState<TxState>(TxState.FillingForm)
  const [txFee, setTxFee] = useState<FilecoinNumber | null>(null)

  // Create message from input
  const message = useMemo<Message | null>(() => {
    try {
      // Manually check signer validity to prevent passing invalid addresses to serializeParams.
      // This can happen due to multiple rerenders when using setIsValid from InputV2.Address.
      return validateAddressString(signer)
        ? new Message({
            to: Address,
            from: wallet.address,
            nonce: 0,
            value: 0,
            method: MsigMethod.PROPOSE,
            params: Buffer.from(
              serializeParams({
                to: Address,
                value: '0',
                method: MsigMethod.ADD_SIGNER,
                params: Buffer.from(
                  serializeParams({
                    signer,
                    increase
                  }),
                  'hex'
                ).toString('base64')
              }),
              'hex'
            ).toString('base64'),
            gasPremium: 0,
            gasFeeCap: 0,
            gasLimit: 0
          })
        : null
    } catch (e) {
      logger.error(e)
      return null
    }
  }, [signer, increase, Address, wallet.address, serializeParams])

  return (
    <Transaction.Form
      title='Add a signer'
      description='Please enter the new signer address below'
      warning="You're about to add another signer to your Safe. Please make sure you know and trust the new owner as they will be able to withdraw funds from your Safe."
      msig
      method={MsigMethod.ADD_SIGNER}
      message={message}
      total={txFee}
      txState={txState}
      setTxState={setTxState}
      maxFee={wallet.balance}
      txFee={txFee}
      setTxFee={setTxFee}
      onComplete={() => navigate(router, { pageUrl: PAGE.MSIG_HISTORY })}
      walletProviderOpts={walletProviderOpts}
      pendingMsgContext={pendingMsgContext}
    >
      <Transaction.Balance
        address={wallet.address}
        balance={wallet.balance}
        msigBalance={AvailableBalance}
      />
      <InputV2.Address
        label='New Signer'
        autoFocus
        value={signer}
        onChange={setSigner}
        disabled={txState !== TxState.FillingForm}
      />
      {txState > TxState.FillingForm ? (
        <InputV2.Info
          label='Required approvals'
          info={`The Safe will have ${Signers.length + 1} owners`}
          value={increase ? NumApprovalsThreshold + 1 : NumApprovalsThreshold}
        />
      ) : (
        <InputV2.Toggle
          label='Increase required approvals'
          info={`From ${NumApprovalsThreshold} to ${NumApprovalsThreshold + 1}`}
          checked={increase}
          onChange={setIncrease}
          disabled={txState !== TxState.FillingForm}
        />
      )}
    </Transaction.Form>
  )
}

interface AddSignerProps {
  walletProviderOpts?: WalletProviderOpts
  pendingMsgContext?: Context<PendingMsgContextType>
}

AddSigner.propTypes = {
  walletProviderOpts: PropTypes.object,
  pendingMsgContext: PropTypes.object
}
