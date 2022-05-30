import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { OneColumnCentered, RequireWallet } from '@glif/react-components'

import SafePageLoggedIn from '../components/SafePageLoggedIn'
import { Withdraw } from '../components/Msig/Withdraw'
import { navigate } from '../utils/urlParams'
import { PAGE } from '../constants'

const WithdrawPage = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <SafePageLoggedIn>
      <OneColumnCentered>
        <RequireWallet gatekeep={gatekeep}>
          <Withdraw />
        </RequireWallet>
      </OneColumnCentered>
    </SafePageLoggedIn>
  )
}

export default WithdrawPage
