import { useCallback } from 'react'
import { ConnectLedger as ConnectLedgerComponent } from '@glif/wallet-provider-react'
import { Page, OneColumnCentered, useChromeDesktopBrowser } from '@glif/react-components'
import { useRouter } from 'next/router'
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
    <Page
      back={back}
      homeUrl={process.env.NEXT_PUBLIC_HOME_URL}
      blogUrl={process.env.NEXT_PUBLIC_BLOG_URL}
      walletUrl={process.env.NEXT_PUBLIC_WALLET_URL}
      explorerUrl={process.env.NEXT_PUBLIC_EXPLORER_URL}
    >
      <OneColumnCentered>
        <ConnectLedgerComponent back={back} next={next} />
      </OneColumnCentered>
    </Page>
  )
}
