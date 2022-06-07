import { useCallback } from 'react'
import {
  navigate,
  OneColumnCentered,
  RequireWallet
} from '@glif/react-components'
import { useRouter } from 'next/router'

import SafePageLoggedIn from '../components/SafePageLoggedIn'
import MsigHome from '../components/Msig/Home'
import { PAGE } from '../constants'

const Home = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <SafePageLoggedIn>
      <OneColumnCentered>
        <RequireWallet gatekeep={gatekeep}>
          <MsigHome />
        </RequireWallet>
      </OneColumnCentered>
    </SafePageLoggedIn>
  )
}

export default Home
