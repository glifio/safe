import { useCallback } from 'react'
import { useRouter } from 'next/router'
import { OneColumnCentered, RequireWallet } from '@glif/react-components'

import SafePageLoggedIn from '../components/SafePageLoggedIn'
import { ChangeApprovalThreshold } from '../components/Msig/ChangeApprovalThreshold'
import { navigate } from '../utils/urlParams'
import { PAGE } from '../constants'

const ChangeApprovalThresholdPage = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <SafePageLoggedIn>
      <OneColumnCentered>
        <RequireWallet gatekeep={gatekeep}>
          <ChangeApprovalThreshold />
        </RequireWallet>
      </OneColumnCentered>
    </SafePageLoggedIn>
  )
}

export default ChangeApprovalThresholdPage
