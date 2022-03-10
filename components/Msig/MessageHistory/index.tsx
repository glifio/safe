import React from 'react'
import { Box, MessageHistoryTable, MessageDetail } from '@glif/react-components'
import { useRouter } from 'next/router'

import { generateRouteWithRequiredUrlParams } from '../../../utils/urlParams'
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
          addressHref={(address: string) =>
            `${process.env.NEXT_PUBLIC_EXPLORER_URL}/actor/?address=${address}`
          }
          height={Number(router?.query?.height) || null}
        />
      ) : (
        <MessageHistoryTable
          address={Address}
          addressHref={(address: string) =>
            `${process.env.NEXT_PUBLIC_EXPLORER_URL}/actor/?address=${address}`
          }
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
