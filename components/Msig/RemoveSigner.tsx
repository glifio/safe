import PropTypes from 'prop-types'
import { useState, useMemo, Context } from 'react'
import { useRouter } from 'next/router'
import { Message } from '@glif/filecoin-message'
import { FilecoinNumber } from '@glif/filecoin-number'
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

export const RemoveSigner = ({
  signerAddress,
  walletProviderOpts,
  pendingMsgContext
}: RemoveSignerProps) => {
  const router = useRouter()
  const wallet = useWallet()
  // @ts-expect-error
  const { serializeParams } = useWasm()
  const { Address, AvailableBalance, Signers, NumApprovalsThreshold } = useMsig()

  // Input states
  const [signer, setSigner] = useState<string>(signerAddress)
  const [decrease, setDecrease] = useState<boolean>(Signers.length === NumApprovalsThreshold)

  // Transaction states
  const [txState, setTxState] = useState<TxState>(TxState.FillingForm)
  const [txFee, setTxFee] = useState<FilecoinNumber | null>(null)

  // Get signer addresses without current wallet owner
  const signers = useMemo<Array<string>>(
    () =>
      Signers.map((signer) => signer.robust).filter(
        (signer) => signer !== wallet.address
      ),
    [Signers, wallet.address]
  )

  // Create message from input
  const message = useMemo<Message | null>(
    () => new Message({
            to: Address,
            from: wallet.address,
            nonce: 0,
            value: 0,
            method: MsigMethod.PROPOSE,
            params: Buffer.from(
              serializeParams({
                to: Address,
                value: '0',
                method: MsigMethod.REMOVE_SIGNER,
                params: Buffer.from(
                  serializeParams({
                    signer,
                    decrease
                  }),
                  'hex'
                ).toString('base64')
              }),
              'hex'
            ).toString('base64'),
            gasPremium: 0,
            gasFeeCap: 0,
            gasLimit: 0
          }),
    [
      signer,
      decrease,
      Address,
      wallet.address,
      serializeParams
    ]
  )

  return (
    <Transaction.Form
      title='Remove a signer'
      description='Please select the signer address to remove below'
      warning="You're about to remove an owner from your Safe."
      msig
      method={MsigMethod.REMOVE_SIGNER}
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
      <InputV2.Select
        label='Signer'
        autoFocus
        address
        options={signers}
        value={signer}
        onChange={setSigner}
        disabled={txState !== TxState.FillingForm}
      />
      <InputV2.Toggle
        label='Decrease required approvals'
        info={`From ${NumApprovalsThreshold} to ${NumApprovalsThreshold - 1}`}
        checked={decrease}
        onChange={setDecrease}
        disabled={txState !== TxState.FillingForm || Signers.length === NumApprovalsThreshold}
      />
    </Transaction.Form>
  )
}

interface RemoveSignerProps {
  signerAddress: string
  walletProviderOpts?: WalletProviderOpts
  pendingMsgContext?: Context<PendingMsgContextType>
}

RemoveSigner.propTypes = {
  signerAddress: PropTypes.string.isRequired,
  walletProviderOpts: PropTypes.object,
  pendingMsgContext: PropTypes.object
}
