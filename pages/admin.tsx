import { useCallback } from 'react'
import { useRouter } from 'next/router'
import { navigate, OneColumn, RequireWallet } from '@glif/react-components'

import SafePageLoggedIn from '../components/SafePageLoggedIn'
import MsigAdmin from '../components/Admin'
import { PAGE } from '../constants'

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
