import {
  Box,
  ProposalDetail,
  ProposalHistoryTable,
  MsigTransaction,
  useWallet
} from '@glif/react-components'
import { useRouter } from 'next/router'

import { useMsig } from '../../../MsigProvider'
import { navigate } from '../../../utils/urlParams'
import { PAGE } from '../../../constants'

const ProposalHistory = () => {
  const { Address } = useMsig()
  const wallet = useWallet()
  const router = useRouter()
  return (
    <Box>
      {router.query.id && router.query.address ? (
        <ProposalDetail
          id={Number(router.query.id)}
          address={Address}
          walletAddress={wallet.address}
          accept={(
            proposal: MsigTransaction,
            approvalsUntilExecution: number
          ) => {
            const clone = { ...proposal, approvalsUntilExecution }
            delete clone.__typename
            navigate(router, {
              pageUrl: PAGE.MSIG_APPROVE,
              newQueryParams: {
                proposal: encodeURI(JSON.stringify(clone))
              }
            })
          }}
          cancel={(
            proposal: MsigTransaction,
            approvalsUntilExecution: number
          ) => {
            const clone = { ...proposal, approvalsUntilExecution }
            delete clone.__typename
            navigate(router, {
              pageUrl: PAGE.MSIG_CANCEL,
              newQueryParams: {
                proposal: encodeURI(JSON.stringify(clone))
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
      )}
    </Box>
  )
}

export default ProposalHistory
