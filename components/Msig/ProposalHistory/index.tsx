import {
  navigate,
  ProposalDetail,
  ProposalHistoryTable,
  MsigTransaction,
  useWallet
} from '@glif/react-components'
import { useRouter } from 'next/router'

import { useMsig } from '../../../MsigProvider'
import { PAGE } from '../../../constants'

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
        const clone = { ...proposal }
        delete clone.__typename
        navigate(router, {
          pageUrl: PAGE.MSIG_APPROVE,
          newQueryParams: {
            proposal: encodeURI(JSON.stringify(clone)),
            approvalsLeft
          }
        })
      }}
      cancel={(proposal: MsigTransaction, approvalsLeft: number) => {
        const clone = { ...proposal }
        delete clone.__typename
        navigate(router, {
          pageUrl: PAGE.MSIG_CANCEL,
          newQueryParams: {
            proposal: encodeURI(JSON.stringify(clone)),
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
