import React, { useCallback } from 'react'
import { RequireWallet } from '@glif/wallet-provider-react'
import { OneColumn } from '@glif/react-components'
import { useRouter } from 'next/router'
import MsigAdmin from '../components/Msig/Admin'
import { navigate } from '../utils/urlParams'
import { PAGE } from '../constants'
import SafePageLoggedIn from '../components/SafePageLoggedIn'

const Owners = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <SafePageLoggedIn>
      <OneColumn>
        <RequireWallet gatekeep={gatekeep}>
          <MsigAdmin />
        </RequireWallet>
      </OneColumn>
    </SafePageLoggedIn>
  )
}

export default Owners
