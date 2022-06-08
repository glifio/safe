import { useCallback } from 'react'
import {
  navigate,
  ConnectWallet,
  OneColumnCentered,
  useDesktopBrowser,
  useWalletProvider
} from '@glif/react-components'
import { useRouter } from 'next/router'

import SafePage from '../../components/SafePage'
import { PAGE } from '../../constants'

export default function ConnectMetaMask() {
  useDesktopBrowser()
  const router = useRouter()
  const { resetState } = useWalletProvider()
  const back = useCallback(() => {
    router.replace('/')
    resetState()
  }, [router, resetState])

  const next = useCallback(() => {
    navigate(router, { pageUrl: PAGE.MSIG_CHOOSE_ACCOUNTS })
  }, [router])
  return (
    <SafePage>
      <OneColumnCentered>
        <ConnectWallet.MetaMask next={next} back={back} />
      </OneColumnCentered>
    </SafePage>
  )
}
