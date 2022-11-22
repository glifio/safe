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
  const txID = getQueryParam.string(router, 'txID')
  return txID ? (
    <MessageDetail txID={txID} />
  ) : (
    <MessageHistoryTable
      address={Address}
      txIDHref={(txID: string) => appendQueryParams(PAGE.MSIG_HISTORY, { txID })}
      warnMissingData={networkName === Network.MAINNET}
    />
  )
}

export default MessageHistory
