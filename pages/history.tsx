import { useCallback } from 'react'
import { useRouter } from 'next/router'
import { navigate, OneColumn, RequireWallet } from '@glif/react-components'

import SafePageLoggedIn from '../components/SafePageLoggedIn'
import MsigHistory from '../components/MessageHistory'
import { PAGE } from '../constants'

const History = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <SafePageLoggedIn>
      <OneColumn>
        <RequireWallet gatekeep={gatekeep}>
          <MsigHistory />
        </RequireWallet>
      </OneColumn>
    </SafePageLoggedIn>
  )
}

export default History
