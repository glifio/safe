import { useCallback } from 'react'
import { CoinType } from '@glif/filecoin-address'
import { AccountSelector, RequireWallet } from '@glif/wallet-provider-react'
import { useRouter } from 'next/router'
import { Page, OneColumn, useDesktopBrowser } from '@glif/react-components'
import { PAGE } from '../constants'
import { navigate } from '../utils/urlParams'

const COIN_TYPE = process.env.NEXT_PUBLIC_COIN_TYPE! as CoinType
const IS_PROD = process.env.NEXT_PUBLIC_IS_PROD
const nWalletsToShow = 5

const Accounts = () => {
  useDesktopBrowser()
  const router = useRouter()
  const onSelectAccount = useCallback(
    () => navigate(router, { pageUrl: PAGE.MSIG_CHOOSE }),
    [router]
  )
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
          <AccountSelector
            title='Select Account'
            helperText={`Your connected wallet creates hundreds of individual accounts. We're showing you the first ${nWalletsToShow}.`}
            onSelectAccount={onSelectAccount}
            nWalletsToLoad={nWalletsToShow}
            coinType={COIN_TYPE}
            showSelectedAccount
            isProd={!!IS_PROD}
          />
        </RequireWallet>
      </OneColumn>
    </Page>
  )
}

export default Accounts
