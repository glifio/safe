import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { RequireWallet } from '@glif/wallet-provider-react'
import MsigChangeApprovalThreshold from '../components/Msig/ChangeApprovalThreshold'
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
      <MsigChangeApprovalThreshold />
    </RequireWallet>
  )
}

export default ChangeApprovalThreshold
