import { useCallback } from 'react'
import {
  ConnectWallet,
  OneColumnCentered,
  useChromeDesktopBrowser
} from '@glif/react-components'
import { useRouter } from 'next/router'
import SafePage from '../../components/SafePage'
import useReset from '../../utils/useReset'
import { navigate } from '../../utils/urlParams'
import { PAGE } from '../../constants'

export default function ConnectLedger() {
  useChromeDesktopBrowser()
  const router = useRouter()
  const resetState = useReset()
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
        <ConnectWallet.Ledger back={back} next={next} />
      </OneColumnCentered>
    </SafePage>
  )
}
