import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { OneColumnCentered, RequireWallet } from '@glif/react-components'
import SafePageLoggedIn from '../components/SafePageLoggedIn'
import ApproveCancel from '../components/Msig/ApproveCancel'
import { navigate } from '../utils/urlParams'
import { PAGE } from '../constants'

const Cancel = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )

  return (
    <SafePageLoggedIn>
      <OneColumnCentered>
        <RequireWallet gatekeep={gatekeep}>
          <ApproveCancel />
        </RequireWallet>
      </OneColumnCentered>
    </SafePageLoggedIn>
  )
}

export default Cancel
