import {
  getQueryParam,
  appendQueryParams,
  ProposalDetail,
  ProposalHistoryTable,
  useWallet
} from '@glif/react-components'
import { useRouter } from 'next/router'

import { useMsig } from '../../MsigProvider'
import { PAGE } from '../../constants'

const ProposalHistory = () => {
  const { Address } = useMsig()
  const wallet = useWallet()
  const router = useRouter()
  const id = getQueryParam.number(router, 'id')

  return !isNaN(id) && id >= 0 ? (
    <ProposalDetail
      id={id}
      msigAddress={Address}
      walletAddress={wallet}
      approveHref={(id: number) => appendQueryParams(PAGE.MSIG_APPROVE, { id })}
      cancelHref={(id: number) => appendQueryParams(PAGE.MSIG_CANCEL, { id })}
    />
  ) : (
    <ProposalHistoryTable
      msigAddress={Address}
      walletAddress={wallet}
      idHref={(id: number) => appendQueryParams(PAGE.MSIG_PROPOSAL, { id })}
      approveHref={(id: number) => appendQueryParams(PAGE.MSIG_APPROVE, { id })}
      cancelHref={(id: number) => appendQueryParams(PAGE.MSIG_CANCEL, { id })}
    />
  )
}

export default ProposalHistory
