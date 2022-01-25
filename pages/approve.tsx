import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { RequireWallet } from '@glif/wallet-provider-react'
import ApproveReject from '../components/Msig/ApproveReject'
import { navigate } from '../utils/urlParams'
import { PAGE } from '../constants'

const Approve = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )

  return (
    <RequireWallet gatekeep={gatekeep}>
      <ApproveReject />
    </RequireWallet>
  )
}

export default Approve
