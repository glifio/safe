import { useCallback } from 'react'
import { RequireWallet } from '@glif/wallet-provider-react'
import { Page, OneColumn } from '@glif/react-components'
import { useRouter } from 'next/router'

import MsigHome from '../components/Msig/Home'
import { navigate } from '../utils/urlParams'
import { PAGE } from '../constants'

const Home = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <Page
      back={gatekeep}
      homeUrl={process.env.NEXT_PUBLIC_HOME_URL}
      blogUrl={process.env.NEXT_PUBLIC_BLOG_URL}
      walletUrl={process.env.NEXT_PUBLIC_WALLET_URL}
      explorerUrl={process.env.NEXT_PUBLIC_EXPLORER_URL}
    >
      <OneColumn>
        <RequireWallet gatekeep={gatekeep}>
          <MsigHome />
        </RequireWallet>
      </OneColumn>
    </Page>
  )
}

export default Home
