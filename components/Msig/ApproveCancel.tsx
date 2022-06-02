import PropTypes from 'prop-types'
import { useState, useMemo, Context } from 'react'
import { useRouter } from 'next/router'
import { Message } from '@glif/filecoin-message'
import { FilecoinNumber } from '@glif/filecoin-number'
import {
  useWallet,
  Transaction,
  MsigMethod,
  TxState,
  WalletProviderOpts,
  PendingMsgContextType,
  MsigTransaction
} from '@glif/react-components'

import { useMsig } from '../../MsigProvider'
import { useWasm } from '../../lib/WasmLoader'
import { navigate } from '../../utils/urlParams'
import { PAGE } from '../../constants'

type MsigTxWithApprovals = MsigTransaction & { approvalsUntilExecution: number }

export const ApproveCancel = ({
  mode,
  walletProviderOpts,
  pendingMsgContext
}: ApproveCancelProps) => {
  const router = useRouter()
  const wallet = useWallet()
  // @ts-expect-error
  const { serializeParams } = useWasm()
  const { Address, AvailableBalance } = useMsig()

  // Get propperties from mode
  const method =
    mode === ApproveCancelMode.APPROVE ? MsigMethod.APPROVE : MsigMethod.CANCEL
  const title =
    mode === ApproveCancelMode.APPROVE
      ? 'Approve Safe Proposal'
      : 'Cancel Safe Proposal'
  const description =
    mode === ApproveCancelMode.APPROVE
      ? 'Please review the transaction to approve below'
      : 'Please review the transaction to cancel below'

  // Transaction states
  const [txLoadError, setTxLoadError] = useState<string>('')
  const [txState, setTxState] = useState<TxState>(TxState.LoadingMessage)
  const [txFee, setTxFee] = useState<FilecoinNumber | null>(null)

  // Get transaction info from url
  const { proposal } = router.query
  const transaction = useMemo<MsigTxWithApprovals | null>(() => {
    if (!proposal) {
      setTxLoadError('Proposal data not found')
      return null
    }
    try {
      return JSON.parse(decodeURI(proposal as string))
    } catch (e) {
      setTxLoadError('Proposal data invalid')
      return null
    }
  }, [proposal])

  // Create message from input
  const message = useMemo<Message | null>(
    () =>
      transaction
        ? new Message({
            to: Address,
            from: wallet.address,
            nonce: 0,
            value: 0,
            method,
            params: Buffer.from(
              serializeParams({
                TxnID: transaction.id,
                ProposalHashData: transaction.proposalHash
              }),
              'hex'
            ).toString('base64'),
            gasPremium: 0,
            gasFeeCap: 0,
            gasLimit: 0
          })
        : null,
    [Address, wallet.address, method, transaction, serializeParams]
  )

  return (
    <Transaction.Form
      title={title}
      description={description}
      msig
      method={method}
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
    </Transaction.Form>
  )
}

export enum ApproveCancelMode {
  APPROVE = 'APPROVE',
  CANCEL = 'CANCEL'
}

const APPROVE_CANCEL_MODE_PROPTYPE = PropTypes.oneOf(
  Object.values(ApproveCancelMode) as Array<ApproveCancelMode>
)

interface ApproveCancelProps {
  mode: ApproveCancelMode
  walletProviderOpts?: WalletProviderOpts
  pendingMsgContext?: Context<PendingMsgContextType>
}

ApproveCancel.propTypes = {
  mode: APPROVE_CANCEL_MODE_PROPTYPE.isRequired,
  walletProviderOpts: PropTypes.object,
  pendingMsgContext: PropTypes.object
}
