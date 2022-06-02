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

export const ChangeSigner = ({
  oldSignerAddress,
  walletProviderOpts,
  pendingMsgContext
}: ChangeSignerProps) => {
  const router = useRouter()
  const wallet = useWallet()
  // @ts-expect-error
  const { serializeParams } = useWasm()
  const { Address, AvailableBalance, Signers } = useMsig()

  // Input states
  const [oldSigner, setOldSigner] = useState<string>(oldSignerAddress)
  const [newSigner, setNewSigner] = useState<string>('')
  const [isNewSignerValid, setIsNewSignerValid] = useState<boolean>(false)

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
    () =>
      isNewSignerValid
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
                method: MsigMethod.SWAP_SIGNER,
                params: Buffer.from(
                  serializeParams({
                    to: newSigner,
                    from: oldSigner
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
        : null,
    [
      isNewSignerValid,
      oldSigner,
      newSigner,
      Address,
      wallet.address,
      serializeParams
    ]
  )

  return (
    <Transaction.Form
      title='Change a signer'
      description='Please update the signer address below'
      warning="You're about to change a signer address of your Safe. Please make sure you know and trust the new owner as they will be able to withdraw funds from your Safe."
      msig
      method={MsigMethod.WITHDRAW}
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
        address={Address}
        balance={wallet.balance}
        msigBalance={AvailableBalance}
      />
      <InputV2.Select
        label='Old Signer'
        address
        options={signers}
        value={oldSigner}
        onChange={setOldSigner}
        disabled={txState !== TxState.FillingForm}
      />
      <InputV2.Address
        label='New Signer'
        autoFocus
        value={newSigner}
        onChange={setNewSigner}
        setIsValid={setIsNewSignerValid}
        disabled={txState !== TxState.FillingForm}
      />
    </Transaction.Form>
  )
}

interface ChangeSignerProps {
  oldSignerAddress: string
  walletProviderOpts?: WalletProviderOpts
  pendingMsgContext?: Context<PendingMsgContextType>
}

ChangeSigner.propTypes = {
  oldSignerAddress: PropTypes.string.isRequired,
  walletProviderOpts: PropTypes.object,
  pendingMsgContext: PropTypes.object
}
