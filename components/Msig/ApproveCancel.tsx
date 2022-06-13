import PropTypes from 'prop-types'
import { useState, useMemo, Context, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Message } from '@glif/filecoin-message'
import { FilecoinNumber } from '@glif/filecoin-number'
import {
  navigate,
  convertAddrToPrefix,
  decodeActorCID,
  useActorQuery,
  useWallet,
  Transaction,
  Line,
  Parameters,
  MsigMethod,
  TxState,
  WalletProviderOpts,
  PendingMsgContextType,
  MsigTransaction
} from '@glif/react-components'

import { useMsig } from '../../MsigProvider'
import { useWasm } from '../../lib/WasmLoader'
import { PAGE } from '../../constants'
import { logger } from '../../logger'

type MsigTxWithApprovals = MsigTransaction & { approvalsUntilExecution: number }

export const ApproveCancel = ({
  method,
  walletProviderOpts,
  pendingMsgContext
}: ApproveCancelProps) => {
  const router = useRouter()
  const wallet = useWallet()
  // @ts-expect-error
  const { serializeParams } = useWasm()
  const { Address, AvailableBalance } = useMsig()

  // Transaction states
  const [txState, setTxState] = useState<TxState>(TxState.LoadingMessage)
  const [txFee, setTxFee] = useState<FilecoinNumber | null>(null)

  // Get transaction info from url
  const { proposal } = router.query
  const transaction = useMemo<MsigTxWithApprovals | null>(() => {
    try {
      return JSON.parse(decodeURI(proposal as string))
    } catch (e) {
      setTxState(TxState.LoadingFailed)
      return null
    }
  }, [proposal])

  // Get parameters object to pass to Parameters component
  const parameters = useMemo<Record<string, any> | null>(() => {
    if (!transaction) return null
    const { id, approved, approvalsUntilExecution, proposalHash, ...params } =
      transaction
    return { params }
  }, [transaction])

  // Get approved object to pass to Parameters component
  const approved = useMemo<Record<string, any> | null>(() => {
    if (!transaction) return null
    return { approved: transaction.approved }
  }, [transaction])

  // Create message from input
  const message = useMemo<Message | null>(() => {
    try {
      return transaction
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
        : null
    } catch (e) {
      logger.error(e)
      return null
    }
  }, [Address, wallet.address, method, transaction, serializeParams])

  // Get actor data from transaction
  const { data: actorData, error: actorError } = useActorQuery({
    variables: {
      address: convertAddrToPrefix(transaction?.to.robust || transaction?.to.id)
    },
    skip: !(transaction?.to.robust || transaction?.to.id)
  })

  // Get actor name from actor data
  const actorName = useMemo<string>(
    () => (actorData ? decodeActorCID(actorData.actor.Code) : ''),
    [actorData]
  )

  // Set TxState.FillingForm when actor name has loaded
  useEffect(() => actorName && setTxState(TxState.FillingForm), [actorName])

  // Set TxState.LoadingFailed when actor name failed to load
  useEffect(() => actorError && setTxState(TxState.LoadingFailed), [actorError])

  return (
    <Transaction.Form
      title={
        method === MsigMethod.APPROVE
          ? 'Approve Safe Proposal'
          : 'Cancel Safe Proposal'
      }
      description={
        MsigMethod.APPROVE
          ? 'Please review the transaction to approve below'
          : 'Please review the transaction to cancel below'
      }
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
      {transaction && actorName && (
        <>
          <Line label='Proposal ID'>{transaction.id}</Line>
          <Line label='Approvals until execution'>
            {transaction.approvalsUntilExecution}
          </Line>
          <Parameters params={approved} depth={0} actorName={actorName} />
          <hr />
          <Parameters params={parameters} depth={0} actorName={actorName} />
        </>
      )}
    </Transaction.Form>
  )
}

interface ApproveCancelProps {
  method: MsigMethod.APPROVE | MsigMethod.CANCEL
  walletProviderOpts?: WalletProviderOpts
  pendingMsgContext?: Context<PendingMsgContextType>
}

ApproveCancel.propTypes = {
  method: PropTypes.oneOf([MsigMethod.APPROVE, MsigMethod.CANCEL]),
  walletProviderOpts: PropTypes.object,
  pendingMsgContext: PropTypes.object
}
