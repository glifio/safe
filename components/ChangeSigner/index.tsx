import PropTypes from 'prop-types'
import { useState, useMemo, Context } from 'react'
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
  PendingMsgContextType,
  useLogger,
  isAddrEqual
} from '@glif/react-components'

import { useMsig } from '../../MsigProvider'
import { useWasm } from '../../lib/WasmLoader'
import { PAGE } from '../../constants'

export const ChangeSigner = ({
  oldSignerAddress,
  walletProviderOpts,
  pendingMsgContext
}: ChangeSignerProps) => {
  const logger = useLogger()
  const router = useRouter()
  const wallet = useWallet()
  // @ts-expect-error
  const { serializeParams } = useWasm()
  const { Address, AvailableBalance, Signers } = useMsig()

  // Input states
  const [oldSigner, setOldSigner] = useState<string>(oldSignerAddress)
  const [newSigner, setNewSigner] = useState<string>('')

  // Transaction states
  const [txState, setTxState] = useState<TxState>(TxState.FillingForm)
  const [txFee, setTxFee] = useState<FilecoinNumber | null>(null)

  // Get signer addresses, including current wallet owner
  const signers = useMemo(
    () => Signers.map((signer) => signer.robust || signer.id),
    [Signers]
  )

  // Create message from input
  const message = useMemo<Message | null>(() => {
    try {
      // Manually check signer validity to prevent passing invalid addresses to serializeParams.
      // This can happen due to multiple rerenders when using setIsValid from InputV2.Address or InputV2.Select.
      return signers.includes(oldSigner) && validateAddressString(newSigner)
        ? new Message({
            to: Address,
            from: wallet.robust,
            nonce: 0,
            value: 0,
            method: MsigMethod.PROPOSE,
            params: Buffer.from(
              serializeParams({
                To: Address,
                Value: '0',
                Method: MsigMethod.SWAP_SIGNER,
                Params: Buffer.from(
                  serializeParams({
                    To: newSigner,
                    From: oldSigner
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
  }, [
    signers,
    oldSigner,
    newSigner,
    Address,
    wallet.robust,
    serializeParams,
    logger
  ])

  const warning = useMemo(
    () =>
      isAddrEqual(wallet, oldSigner)
        ? "You're about to remove yourself as a signer on this Safe."
        : "You're about to change a signer address of your Safe. Please make sure you know and trust the new signer.",
    [wallet, oldSigner]
  )

  return (
    <Transaction.Form
      title='Change a signer'
      description='Please update the signer address below'
      warning={warning}
      msig
      method={MsigMethod.SWAP_SIGNER}
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
        address={wallet.robust}
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
        disabled={txState !== TxState.FillingForm}
        truncate={false}
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
