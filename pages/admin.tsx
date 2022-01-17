import React, { useCallback } from 'react'
import { RequireWallet } from '@glif/wallet-provider-react'
import { useRouter } from 'next/router'
import MsigAdmin from '../components/Msig/Admin'
import { navigate } from '../utils/urlParams'
import { PAGE } from '../constants'

const Owners = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <RequireWallet gatekeep={gatekeep}>
      <MsigAdmin />
    </RequireWallet>
  )
}

export default Owners
