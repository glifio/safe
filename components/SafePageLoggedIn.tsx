import { useCallback } from 'react'
import PropTypes from 'prop-types'
import {
  NetworkSelector,
  useWallet,
  resetWallet,
  navigate
} from '@glif/react-components'
import { useRouter } from 'next/router'

import { useMsig } from '../MsigProvider'
import { PAGE } from '../constants'
import SafePage from './SafePage'

export default function SafePageLoggedIn({ children }: SafePageLoggedInProps) {
  const router = useRouter()
  const wallet = useWallet()
  const msig = useMsig()
  const onNodeDisconnect = useCallback(() => {
    navigate(router, { pageUrl: PAGE.NODE_DISCONNECTED })
  }, [router])

  return (
    <SafePage
      logout={resetWallet}
      connection={
        <NetworkSelector
          errorCallback={onNodeDisconnect}
          enableSwitching={false}
        />
      }
      addressLinks={[
        {
          label: 'Safe Address',
          address: msig.Address,
          disableLink: false,
          hideCopy: false,
          hideCopyText: true
        },
        {
          label: 'Wallet Address',
          address: wallet.robust,
          disableLink: false,
          hideCopy: false,
          hideCopyText: true
        }
      ]}
      appHeaderLinks={[
        {
          title: 'Assets',
          url: PAGE.MSIG_HOME
        },
        {
          title: 'History',
          url: PAGE.MSIG_HISTORY
        },
        {
          title: 'Proposals',
          url: PAGE.MSIG_PROPOSALS
        },
        {
          title: 'Admin',
          url: PAGE.MSIG_ADMIN
        }
      ]}
    >
      {children}
    </SafePage>
  )
}

type SafePageLoggedInProps = {
  children?: JSX.Element | Array<JSX.Element>
}

SafePageLoggedIn.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ])
}
