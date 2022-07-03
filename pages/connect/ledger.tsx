import { useCallback } from 'react'
import {
  navigate,
  ConnectWallet,
  OneColumnCentered,
  useChromeDesktopBrowser,
  useWalletProvider
} from '@glif/react-components'
import { useRouter } from 'next/router'

import SafePage from '../../components/SafePage'
import { PAGE } from '../../constants'

export default function ConnectLedger() {
  useChromeDesktopBrowser()
  const router = useRouter()
  const { resetState } = useWalletProvider()
  const back = useCallback(() => {
    router.replace('/')
    resetState()
  }, [router, resetState])

  const next = useCallback(() => {
    navigate(router, { pageUrl: PAGE.MSIG_CHOOSE_ACCOUNTS, retainParams: true })
  }, [router])

  return (
    <SafePage>
      <OneColumnCentered>
        <ConnectWallet.Ledger back={back} next={next} />
      </OneColumnCentered>
    </SafePage>
  )
}
