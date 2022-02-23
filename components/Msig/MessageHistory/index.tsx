import React from 'react'
import {
  Box,
  MessageHistoryTable,
  MessageDetail,
  ButtonClose
} from '@glif/react-components'
import { useRouter } from 'next/router'

import { MsigPageWrapper } from '../Shared'
import { useMsig } from '../../../MsigProvider'

const MessageHistory = () => {
  const { Address } = useMsig()
  const router = useRouter()
  return (
    <MsigPageWrapper>
      <Box>
        {router.query.cid ? (
          <Box display='flex' flexDirection='row'>
            <MessageDetail
              cid={router.query.cid as string}
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
            cidHref={(cid: string) =>
              `${process.env.NEXT_PUBLIC_EXPLORER_URL}/message/?cid=${cid}`
            }
          />
        )}
      </Box>
    </MsigPageWrapper>
  )
}

export default MessageHistory
