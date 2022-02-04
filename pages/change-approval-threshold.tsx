import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { RequireWallet } from '@glif/wallet-provider-react'
import MsigChangeApprovalThreshold from '../components/Msig/ChangeApprovalThreshold'
import { MsigPageWrapper } from '../components/Msig/Shared'
import { navigate } from '../utils/urlParams'
import { PAGE } from '../constants'

const ChangeApprovalThreshold = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <RequireWallet gatekeep={gatekeep}>
      <MsigPageWrapper hideNav>
        <MsigChangeApprovalThreshold />
      </MsigPageWrapper>
    </RequireWallet>
  )
}

export default ChangeApprovalThreshold
