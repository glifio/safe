import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { RequireWallet } from '@glif/wallet-provider-react'
import { OneColumnCentered } from '@glif/react-components'

import SafePageLoggedIn from '../components/SafePageLoggedIn'
import MsigWithdraw from '../components/Msig/Withdraw'
import { navigate } from '../utils/urlParams'
import { PAGE } from '../constants'

const Withdraw = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <SafePageLoggedIn>
      <OneColumnCentered>
        <RequireWallet gatekeep={gatekeep}>
          <MsigWithdraw />
        </RequireWallet>
      </OneColumnCentered>
    </SafePageLoggedIn>
  )
}

export default Withdraw
