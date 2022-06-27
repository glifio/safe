import {
  getQueryParam,
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
  const cid = getQueryParam.string(router, 'cid')
  const height = getQueryParam.number(router, 'height')
  return cid ? (
    <MessageDetail cid={cid} height={height} />
  ) : (
    <MessageHistoryTable
      address={Address}
      cidHref={(cid: string, height?: number) =>
        appendQueryParams(PAGE.MSIG_HISTORY, { height, cid })
      }
    />
  )
}

export default MessageHistory
