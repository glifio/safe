import {
  MessageHistoryTable,
  MessageDetail,
  appendQueryParams
} from '@glif/react-components'
import { useRouter } from 'next/router'

import { PAGE } from '../../constants'
import { useMsig } from '../../MsigProvider'

const MessageHistory = () => {
  const { Address } = useMsig()
  const router = useRouter()
  return router.query.cid ? (
    <MessageDetail
      cid={router.query.cid as string}
      height={Number(router?.query?.height) || null}
    />
  ) : (
    <MessageHistoryTable
      address={Address}
      cidHref={(cid: string, height?: string) =>
        appendQueryParams(PAGE.MSIG_HISTORY, { height, cid })
      }
    />
  )
}

export default MessageHistory
