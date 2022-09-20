import PropTypes from 'prop-types'
import { useState, useMemo, Context, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Message } from '@glif/filecoin-message'
import { FilecoinNumber } from '@glif/filecoin-number'
import { getActorName } from '@glif/filecoin-actor-utils'
import {
  getQueryParam,
  navigate,
  convertAddrToPrefix,
  useActorQuery,
  useWallet,
  Transaction,
  Line,
  MsigMethod,
  TxState,
  WalletProviderOpts,
  PendingMsgContextType,
  MsigTransaction,
  useLogger,
  useEnvironment,
  AddressLine,
  MethodLine,
  FilecoinLine,
  LinesParams
} from '@glif/react-components'

import { useMsig } from '../../MsigProvider'
import { useWasm } from '../../lib/WasmLoader'
import { PAGE } from '../../constants'
import { useMsigPendingQuery } from '@glif/react-components'

export const ApproveCancel = ({
  method,
  walletProviderOpts,
  pendingMsgContext
}: ApproveCancelProps) => {
  const logger = useLogger()
  const { coinType, networkName } = useEnvironment()
  const router = useRouter()
  const wallet = useWallet()
  // @ts-expect-error
  const { serializeParams } = useWasm()
  const { Address, AvailableBalance, NumApprovalsThreshold } = useMsig()

  // Transaction states
  const [txState, setTxState] = useState<TxState>(TxState.LoadingMessage)
  const [txFee, setTxFee] = useState<FilecoinNumber | null>(null)

  // Get safe proposals
  const { data: proposals, error: proposalsError } = useMsigPendingQuery({
    variables: { address: Address },
    pollInterval: 0
  })

  // Find current proposal
  const proposalId = getQueryParam.number(router, 'id')
  const proposal = useMemo<MsigTransaction | null>(
    () => proposals?.msigPending.find((p) => p.id === proposalId) || null,
    [proposals, proposalId]
  )

  // Get proposal approvals left count
  const approvalsLeft = useMemo<number | null>(() => {
    if (!NumApprovalsThreshold || !proposal?.approved) return null
    return NumApprovalsThreshold - proposal.approved.length
  }, [NumApprovalsThreshold, proposal?.approved])

  // Create message from input
  const message = useMemo<Message | null>(() => {
    try {
      return proposal
        ? new Message({
            to: Address,
            from: wallet.robust,
            nonce: 0,
            value: 0,
            method,
            params: Buffer.from(
              serializeParams({
                ID: proposal.id,
                ProposalHash: proposal.proposalHash
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
  }, [Address, wallet.robust, method, proposal, serializeParams, logger])

  // Get actor data from proposal
  const { data: actorData, error: actorError } = useActorQuery({
    variables: {
      address: convertAddrToPrefix(
        proposal?.to.robust || proposal?.to.id,
        coinType
      )
    },
    skip: !(proposal?.to.robust || proposal?.to.id)
  })

  // Get actor name from actor data
  const actorName = useMemo<string>(() => {
    if (!actorData) return ''
    try {
      return getActorName(actorData.actor.Code, networkName)
    } catch (e) {
      logger.error(e)
      return ''
    }
  }, [actorData, networkName, logger])

  // Set TxState.FillingForm when actor name has loaded
  useEffect(() => actorName && setTxState(TxState.FillingForm), [actorName])

  // Set TxState.LoadingFailed when actor name failed to load
  useEffect(() => {
    if (actorError) {
      logger.error(actorError)
      setTxState(TxState.LoadingFailed)
    }
  }, [actorError, logger])

  // Set TxState.LoadingFailed when proposals failed to load
  useEffect(() => {
    if (proposalsError) {
      logger.error(proposalsError)
      setTxState(TxState.LoadingFailed)
    }
  }, [proposalsError, logger])

  // Set TxState.LoadingFailed when proposals id is not found
  useEffect(() => {
    if (proposals && !proposal) {
      logger.error(`Proposal id ${proposalId} not found for actor ${Address}`)
      setTxState(TxState.LoadingFailed)
    }
  }, [proposals, proposal, proposalId, logger, Address])

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
      approvalsLeft={approvalsLeft}
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
      {proposal && actorName && (
        <>
          <Line label='Proposal ID'>{proposal.id}</Line>
          <AddressLine label='Proposer' value={proposal.approved[0]} />
          {proposal.approved.map((approver, index) => (
            <AddressLine
              key={approver.robust || approver.id}
              label={
                index === 0 ? `Approvers (${proposal.approved.length})` : ''
              }
              value={approver}
            />
          ))}
          <Line label='Approvals until execution'>{approvalsLeft}</Line>
          <hr />
          <AddressLine label='To' value={proposal.to} />
          <MethodLine
            label='Method'
            actorName={actorName}
            methodNum={proposal.method}
          />
          <FilecoinLine
            label='Value'
            value={new FilecoinNumber(proposal.value, 'attofil')}
          />
          <LinesParams
            address={proposal.to.robust || proposal.to.id}
            method={proposal.method}
            params={proposal.params}
          />
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
