import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { RequireWallet } from '@glif/wallet-provider-react'
import { Page, OneColumnCentered } from '@glif/react-components'
import CreateMsig from '../../components/Msig/Create'
import { navigate } from '../../utils/urlParams'
import { PAGE } from '../../constants'

const Create = () => {
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
      <OneColumnCentered>
        <RequireWallet gatekeep={gatekeep}>
          <CreateMsig />
        </RequireWallet>
      </OneColumnCentered>
    </Page>
  )
}

export default Create
