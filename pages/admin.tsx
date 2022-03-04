import React, { useCallback } from 'react'
import { RequireWallet } from '@glif/wallet-provider-react'
import { OneColumnCentered } from '@glif/react-components'
import { useRouter } from 'next/router'
import SafePageLoggedIn from '../components/SafePageLoggedIn'
import MsigAdmin from '../components/Msig/Admin'
import { navigate } from '../utils/urlParams'
import { PAGE } from '../constants'

const Owners = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <SafePageLoggedIn>
      <OneColumnCentered>
        <RequireWallet gatekeep={gatekeep}>
          <MsigAdmin />
        </RequireWallet>
      </OneColumnCentered>
    </SafePageLoggedIn>
  )
}

export default Owners
