import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { RequireWallet } from '@glif/wallet-provider-react'
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
    <RequireWallet gatekeep={gatekeep}>
      <ApproveCancel />
    </RequireWallet>
  )
}

export default Cancel
