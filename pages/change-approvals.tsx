import { useCallback } from 'react'
import { useRouter } from 'next/router'
import {
  navigate,
  OneColumnCentered,
  RequireWallet
} from '@glif/react-components'

import SafePageLoggedIn from '../components/SafePageLoggedIn'
import { ChangeApprovals } from '../components/Msig/ChangeApprovals'
import { PAGE } from '../constants'

const ChangeApprovalsPage = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <SafePageLoggedIn>
      <OneColumnCentered>
        <RequireWallet gatekeep={gatekeep}>
          <ChangeApprovals />
        </RequireWallet>
      </OneColumnCentered>
    </SafePageLoggedIn>
  )
}

export default ChangeApprovalsPage
