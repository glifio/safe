import { useCallback } from 'react'
import { ConnectLedger as ConnectLedgerComponent } from '@glif/wallet-provider-react'
import { OneColumnCentered, useChromeDesktopBrowser } from '@glif/react-components'
import { useRouter } from 'next/router'
import useReset from '../../utils/useReset'
import { navigate } from '../../utils/urlParams'
import { PAGE } from '../../constants'
import SafePage from '../../components/SafePage'

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
        <ConnectLedgerComponent back={back} next={next} />
      </OneColumnCentered>
    </SafePage>
  )
}
