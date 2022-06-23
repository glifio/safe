import { useCallback } from 'react'
import { CoinType } from '@glif/filecoin-address'
import { useRouter } from 'next/router'
import {
  navigate,
  OneColumn,
  AccountSelector,
  RequireWallet,
  useDesktopBrowser
} from '@glif/react-components'

import SafePage from '../components/SafePage'
import { PAGE } from '../constants'

const COIN_TYPE = process.env.NEXT_PUBLIC_COIN_TYPE! as CoinType
const IS_PROD = process.env.NEXT_PUBLIC_IS_PROD
const nWalletsToShow = 5

const Accounts = () => {
  useDesktopBrowser()
  const router = useRouter()
  const onSelectAccount = useCallback(
    () => navigate(router, { pageUrl: PAGE.MSIG_CHOOSE, retainParams: true }),
    [router]
  )
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <SafePage>
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
    </SafePage>
  )
}

export default Accounts
