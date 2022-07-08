import PropTypes from 'prop-types'
import { useState, useMemo, Context, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Message } from '@glif/filecoin-message'
import { FilecoinNumber } from '@glif/filecoin-number'
import {
  navigate,
  useWallet,
  InputV2,
  Transaction,
  MsigMethod,
  TxState,
  WalletProviderOpts,
  PendingMsgContextType,
  isAddrEqual
} from '@glif/react-components'

import { useMsig } from '../../MsigProvider'
import { useWasm } from '../../lib/WasmLoader'
import { PAGE } from '../../constants'
import { logger } from '../../logger'

export const RemoveSigner = ({
  signerAddress,
  walletProviderOpts,
  pendingMsgContext
}: RemoveSignerProps) => {
  const router = useRouter()
  const wallet = useWallet()
  // @ts-expect-error
  const { serializeParams } = useWasm()
  const { Address, AvailableBalance, Signers, NumApprovalsThreshold } =
    useMsig()

  // Input states
  const [signer, setSigner] = useState<string>(signerAddress)
  const [decrease, setDecrease] = useState<boolean>(false)

  // force a decrease if necessary
  useEffect(() => {
    if (
      Signers.length > 1 &&
      Signers.length === NumApprovalsThreshold &&
      !decrease
    ) {
      setDecrease(true)
    }
  }, [Signers.length, NumApprovalsThreshold, decrease])

  // Transaction states
  const [txState, setTxState] = useState<TxState>(TxState.FillingForm)
  const [txFee, setTxFee] = useState<FilecoinNumber | null>(null)

  // Get signer addresses without current wallet owner
  const signers = useMemo(
    () =>
      Signers.filter((signer) => !isAddrEqual(wallet, signer)).map(
        (signer) => signer.robust || signer.id
      ),
    [Signers, wallet]
  )

  // Create message from input
  const message = useMemo<Message | null>(() => {
    try {
      // Manually check signer validity to prevent passing invalid addresses to serializeParams.
      // This can happen due to multiple rerenders when using setIsValid from InputV2.Select.
      return signers.includes(signer)
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
                Method: MsigMethod.REMOVE_SIGNER,
                Params: Buffer.from(
                  serializeParams({
                    Signer: signer,
                    Decrease: decrease
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
  }, [signers, signer, decrease, Address, wallet.robust, serializeParams])

  return (
    <Transaction.Form
      title='Remove a signer'
      description='Please select the signer address to remove below'
      warning="You're about to remove a signer from your Safe."
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
        address={wallet.robust}
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
      {txState > TxState.FillingForm ? (
        <InputV2.Info
          label='Required approvals'
          info={`The Safe will have ${Signers.length - 1} owners`}
          value={decrease ? NumApprovalsThreshold - 1 : NumApprovalsThreshold}
        />
      ) : (
        <>
          {NumApprovalsThreshold > 1 && (
            <InputV2.Toggle
              label='Decrease required approvals'
              info={`From ${NumApprovalsThreshold} to ${
                NumApprovalsThreshold - 1
              }`}
              checked={decrease}
              onChange={setDecrease}
              disabled={
                txState !== TxState.FillingForm ||
                Signers.length === NumApprovalsThreshold
              }
            />
          )}
        </>
      )}
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
