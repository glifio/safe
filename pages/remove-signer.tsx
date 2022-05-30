import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { OneColumnCentered, RequireWallet } from '@glif/react-components'
import SafePageLoggedIn from '../components/SafePageLoggedIn'
import RemoveSigner from '../components/Msig/AddRmSigners/RemoveSigner'
import { navigate } from '../utils/urlParams'
import { PAGE } from '../constants'

const Remove = () => {
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
          <RemoveSigner signerAddress={address} />
        </RequireWallet>
      </OneColumnCentered>
    </SafePageLoggedIn>
  )
}

export default Remove
