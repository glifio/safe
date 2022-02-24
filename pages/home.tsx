import { useCallback } from 'react'
import { RequireWallet } from '@glif/wallet-provider-react'
import { OneColumn } from '@glif/react-components'
import { useRouter } from 'next/router'

import MsigHome from '../components/Msig/Home'
import { navigate } from '../utils/urlParams'
import { PAGE } from '../constants'
import SafePageLoggedIn from '../components/SafePageLoggedIn'

const Home = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <SafePageLoggedIn>
      <OneColumn>
        <RequireWallet gatekeep={gatekeep}>
          <MsigHome />
        </RequireWallet>
      </OneColumn>
    </SafePageLoggedIn>
  )
}

export default Home
