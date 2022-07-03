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
  return cid ? (
    <MessageDetail cid={cid} />
  ) : (
    <MessageHistoryTable
      address={Address}
      cidHref={(cid: string) => appendQueryParams(PAGE.MSIG_HISTORY, { cid })}
    />
  )
}

export default MessageHistory
