import { useCallback } from 'react'
import { OneColumnCentered, useDesktopBrowser } from '@glif/react-components'
import { ConnectMM } from '@glif/wallet-provider-react'
import { useRouter } from 'next/router'
import SafePage from '../../components/SafePage'
import useReset from '../../utils/useReset'
import { navigate } from '../../utils/urlParams'
import { PAGE } from '../../constants'

export default function ConnectMetaMask() {
  useDesktopBrowser()
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
        <ConnectMM next={next} back={back} />
      </OneColumnCentered>
    </SafePage>
  )
}
