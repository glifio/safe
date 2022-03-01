import React from 'react'
import {
  Box,
  MessageHistoryTable,
  MessageDetail,
  ButtonClose
} from '@glif/react-components'
import { useRouter } from 'next/router'

import { generateRouteWithRequiredUrlParams } from '../../../utils/urlParams'
import { MsigPageWrapper } from '../Shared'
import { useMsig } from '../../../MsigProvider'
import { PAGE } from '../../../constants'

const MessageHistory = () => {
  const { Address } = useMsig()
  const router = useRouter()
  return (
    <MsigPageWrapper>
      <Box
        display='flex'
        flexWrap='wrap'
        justifyContent='center'
        width='100%'
        maxWidth={18}
        margin='0 auto'
      >
        {router.query.cid ? (
          <Box display='flex' flexDirection='row'>
            <MessageDetail
              cid={router.query.cid as string}
              height={Number(router.query?.height) || null}
              addressHref={(address: string) =>
                `${process.env.NEXT_PUBLIC_EXPLORER_URL}/actor/?address=${address}`
              }
            />
            <ButtonClose
              alignSelf='flex-start'
              ml={7}
              pt={4}
              onClick={router.back}
            />
          </Box>
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
    </MsigPageWrapper>
  )
}

export default MessageHistory
