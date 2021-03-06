import { useCallback } from 'react'
import { useRouter } from 'next/router'
import {
  navigate,
  MsigMethod,
  OneColumnCentered,
  RequireWallet
} from '@glif/react-components'

import SafePageLoggedIn from '../components/SafePageLoggedIn'
import { ApproveCancel } from '../components/ApproveCancel'
import { PAGE } from '../constants'

const ApprovePage = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <SafePageLoggedIn>
      <OneColumnCentered>
        <RequireWallet gatekeep={gatekeep}>
          <ApproveCancel method={MsigMethod.APPROVE} />
        </RequireWallet>
      </OneColumnCentered>
    </SafePageLoggedIn>
  )
}

export default ApprovePage
