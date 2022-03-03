import { useCallback } from 'react'
import PropTypes from 'prop-types'
import { NetworkConnection } from '@glif/react-components'
import { useWallet } from '@glif/wallet-provider-react'
import { useRouter } from 'next/router'

import {
  resetWallet,
  navigate,
  generateRouteWithRequiredUrlParams
} from '../utils/urlParams'
import { useMsig } from '../MsigProvider'
import { PAGE } from '../constants'
import SafePage from './SafePage'

export default function SafePageLoggedIn(props: SafePageLoggedInProps) {
  const { children, showPhishingBanner } = props
  const router = useRouter()
  const wallet = useWallet()
  const msig = useMsig()
  const getRoute = useCallback(generateRouteWithRequiredUrlParams, [
    router.query
  ])
  const onNodeDisconnect = useCallback(() => {
    navigate(router, { pageUrl: PAGE.NODE_DISCONNECTED })
  }, [router])

  return (
    <SafePage
      showPhishingBanner={showPhishingBanner}
      logout={resetWallet}
      connection={
        <NetworkConnection
          lotusApiAddr={process.env.NEXT_PUBLIC_LOTUS_NODE_JSONRPC}
          apiKey={process.env.NEXT_PUBLIC_NODE_STATUS_API_KEY}
          statusApiAddr={process.env.NEXT_PUBLIC_NODE_STATUS_API_ADDRESS}
          errorCallback={onNodeDisconnect}
        />
      }
      addressLinks={[
        {
          label: 'Safe Address',
          address: msig.Address,
          urlPrefix: `${process.env.NEXT_PUBLIC_EXPLORER_URL}/address/`
        },
        {
          label: 'Wallet Address',
          address: wallet.address,
          urlPrefix: `${process.env.NEXT_PUBLIC_EXPLORER_URL}/address/`
        }
      ]}
      appHeaderLinks={[
        {
          title: 'Assets',
          url: getRoute({
            existingQParams: router.query as Record<string, string>,
            pageUrl: PAGE.MSIG_HOME
          })
        },
        {
          title: 'History',
          url: getRoute({
            existingQParams: router.query as Record<string, string>,
            pageUrl: PAGE.MSIG_HISTORY
          })
        },
        {
          title: 'Proposals',
          url: getRoute({
            existingQParams: router.query as Record<string, string>,
            pageUrl: PAGE.MSIG_PROPOSALS
          })
        },
        {
          title: 'Admin',
          url: getRoute({
            existingQParams: router.query as Record<string, string>,
            pageUrl: PAGE.MSIG_ADMIN
          })
        }
      ]}
    >
      {children}
    </SafePage>
  )
}

type SafePageLoggedInProps = {
  children?: JSX.Element | Array<JSX.Element>
  showPhishingBanner?: boolean
}

SafePageLoggedIn.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  showPhishingBanner: PropTypes.bool
}
