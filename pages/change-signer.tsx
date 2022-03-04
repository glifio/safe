import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { RequireWallet } from '@glif/wallet-provider-react'
import { OneColumnCentered } from '@glif/react-components'
import SafePageLoggedIn from '../components/SafePageLoggedIn'
import MsigChangeSigner from '../components/Msig/ChangeSigner'
import { navigate } from '../utils/urlParams'
import { PAGE } from '../constants'

const ChangeSigner = () => {
  const router = useRouter()
  const address = router.query?.address || ''
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <SafePageLoggedIn>
      <OneColumnCentered>
        <RequireWallet gatekeep={gatekeep}>
          <MsigChangeSigner oldSignerAddress={address} />
        </RequireWallet>
      </OneColumnCentered>
    </SafePageLoggedIn>
  )
}

export default ChangeSigner
