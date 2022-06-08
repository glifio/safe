import {
  Box,
  MessageHistoryTable,
  MessageDetail,
  generateRouteWithRequiredUrlParams
} from '@glif/react-components'
import { useRouter } from 'next/router'

import { PAGE } from '../../../constants'
import { useMsig } from '../../../MsigProvider'

const MessageHistory = () => {
  const { Address } = useMsig()
  const router = useRouter()
  return (
    <Box>
      {router.query.cid ? (
        <MessageDetail
          cid={router.query.cid as string}
          height={Number(router?.query?.height) || null}
        />
      ) : (
        <MessageHistoryTable
          address={Address}
          cidHref={(cid: string, height?: string) =>
            generateRouteWithRequiredUrlParams({
              pageUrl: PAGE.MSIG_HISTORY,
              newQueryParams: { height, cid },
              existingQParams: { ...router.query } as Record<string, string>
            })
          }
        />
      )}
    </Box>
  )
}

export default MessageHistory
