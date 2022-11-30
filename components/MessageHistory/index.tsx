import {
  getQueryParam,
  MessageHistoryTable,
  MessageDetail,
  appendQueryParams,
  useEnvironment,
  Network
} from '@glif/react-components'
import { useRouter } from 'next/router'

import { PAGE } from '../../constants'
import { useMsig } from '../../MsigProvider'

const MessageHistory = () => {
  const { Address } = useMsig()
  const router = useRouter()
  const { networkName } = useEnvironment()
  const cid = getQueryParam.string(router, 'cid')
  return cid ? (
    <MessageDetail txID={cid} />
  ) : (
    <MessageHistoryTable
      address={Address}
      txIDHref={(cid: string) => appendQueryParams(PAGE.MSIG_HISTORY, { cid })}
      warnMissingData={networkName === Network.MAINNET}
    />
  )
}

export default MessageHistory
