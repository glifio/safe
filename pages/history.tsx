import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { OneColumn, RequireWallet } from '@glif/react-components'
import MsigHistory from '../components/Msig/MessageHistory'
import { navigate } from '../utils/urlParams'
import { PAGE } from '../constants'
import SafePageLoggedIn from '../components/SafePageLoggedIn'

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
