import {
  getQueryParam,
  navigate,
  appendQueryParams,
  ProposalDetail,
  ProposalHistoryTable,
  MsigTransaction,
  useWallet
} from '@glif/react-components'
import { useRouter } from 'next/router'
import cloneDeep from 'lodash.clonedeep'

import { useMsig } from '../../MsigProvider'
import { PAGE } from '../../constants'

const getProposalParam = (proposal: MsigTransaction): string => {
  const clone = cloneDeep(proposal)
  delete clone.__typename
  delete clone.to.__typename
  clone.approved.forEach((a) => delete a.__typename)
  return encodeURI(JSON.stringify(clone))
}

const ProposalHistory = () => {
  const { Address } = useMsig()
  const wallet = useWallet()
  const router = useRouter()
  const id = getQueryParam.number(router, 'id')
  
  const approve = (proposal: MsigTransaction) => {
    navigate(router, {
      pageUrl: PAGE.MSIG_APPROVE,
      params: {
        proposal: getProposalParam(proposal)
      }
    })
  }

  const cancel = (proposal: MsigTransaction) => {
    navigate(router, {
      pageUrl: PAGE.MSIG_CANCEL,
      params: {
        proposal: getProposalParam(proposal)
      }
    })
  }
  
  return !isNaN(id) && id >= 0 ? (
    <ProposalDetail
      id={id}
      msigAddress={Address}
      walletAddress={wallet}
      approve={approve}
      cancel={cancel}
    />
  ) : (
    <ProposalHistoryTable
      msigAddress={Address}
      walletAddress={wallet}
      idHref={(id: number) => appendQueryParams(PAGE.MSIG_PROPOSAL, { id })}
      approve={approve}
      cancel={cancel}
    />
  )
}

export default ProposalHistory
