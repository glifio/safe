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
            <MessageDetail cid={router.query.cid as string} />
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
            cidHref={(cid: string) => `/history?cid=${cid}`}
          />
        )}
      </Box>
    </MsigPageWrapper>
  )
}

export default MessageHistory
