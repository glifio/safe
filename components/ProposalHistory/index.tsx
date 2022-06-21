import {
  navigate,
  ProposalDetail,
  ProposalHistoryTable,
  MsigTransaction,
  useWallet,
  Address
} from '@glif/react-components'
import { useRouter } from 'next/router'

import { useMsig } from '../../MsigProvider'
import { PAGE } from '../../constants'

const getProposalParam = (proposal: MsigTransaction): string => {
  const enncodingJson: Omit<MsigTransaction, '__typename'> = {
    id: proposal.id,
    method: proposal.method,
    to: {
      id: proposal.to.id,
      robust: proposal.to.robust
    } as Omit<Address, '__typename'>,
    value: proposal.value,
    proposalHash: proposal.proposalHash
  }
  if (proposal.approved) {
    enncodingJson.approved = proposal.approved
  }
  if (proposal.params) {
    enncodingJson.params = proposal.params
  }
  return encodeURI(JSON.stringify(enncodingJson))
}

const ProposalHistory = () => {
  const { Address } = useMsig()
  const wallet = useWallet()
  const router = useRouter()
  return router.query.id && router.query.address ? (
    <ProposalDetail
      id={Number(router.query.id)}
      address={Address}
      walletAddress={wallet.address}
      accept={(proposal: MsigTransaction, approvalsLeft: number) => {
        navigate(router, {
          pageUrl: PAGE.MSIG_APPROVE,
          newQueryParams: {
            proposal: getProposalParam(proposal),
            approvalsLeft
          }
        })
      }}
      cancel={(proposal: MsigTransaction, approvalsLeft: number) => {
        navigate(router, {
          pageUrl: PAGE.MSIG_CANCEL,
          newQueryParams: {
            proposal: getProposalParam(proposal),
            approvalsLeft
          }
        })
      }}
    />
  ) : (
    <ProposalHistoryTable
      address={Address}
      idHref={(id: number) =>
        `${PAGE.MSIG_PROPOSAL}?id=${id}&address=${Address}`
      }
      walletAddr={wallet.address}
    />
  )
}

export default ProposalHistory
