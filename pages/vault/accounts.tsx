import { CoinType } from '@glif/filecoin-address'
import { AccountSelector } from '@glif/wallet-provider-react'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { PAGE } from '../../constants'
import RenderChildrenIfWalletConnected from '../../lib/RequireWallet'
import useDesktopBrowser from '../../lib/useDesktopBrowser'
import { navigate } from '../../utils/urlParams'

const COIN_TYPE = process.env.COIN_TYPE! as CoinType
const nWalletsToShow = 10

const Accounts = () => {
  useDesktopBrowser()
  const router = useRouter()
  const onSelectAccount = useCallback(
    () => navigate(router, { pageUrl: PAGE.MSIG_CHOOSE }),
    [router]
  )
  return (
    <RenderChildrenIfWalletConnected>
      <AccountSelector
        title='Select Account'
        helperText={`Your connected wallet creates hundreds of individual accounts. We're showing you the first ${nWalletsToShow}.`}
        onSelectAccount={onSelectAccount}
        nWalletsToLoad={nWalletsToShow}
        coinType={COIN_TYPE}
        showSelectedAccount
      />
    </RenderChildrenIfWalletConnected>
  )
}

export default Accounts
