import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { RequireWallet } from '@glif/wallet-provider-react'
import MsigChangeSigner from '../components/Msig/ChangeSigner'
import { navigate } from '../utils/urlParams'
import { PAGE } from '../constants'

const ChangeSigner = () => {
  const router = useRouter()
  const address = router.query?.address || ''
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <RequireWallet gatekeep={gatekeep}>
      <MsigChangeSigner oldSignerAddress={address} />
    </RequireWallet>
  )
}

export default ChangeSigner
