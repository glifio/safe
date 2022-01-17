import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { RequireWallet } from '@glif/wallet-provider-react'
import RemoveSigner from '../components/Msig/AddRmSigners/RemoveSigner'
import { MsigPageWrapper } from '../components/Msig/Shared'
import { navigate } from '../utils/urlParams'
import { PAGE } from '../constants'

const Remove = () => {
  const router = useRouter()
  const address = router.query?.address || ''
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <RequireWallet gatekeep={gatekeep}>
      <MsigPageWrapper hideNav>
        <RemoveSigner signerAddress={address} />
      </MsigPageWrapper>
    </RequireWallet>
  )
}

export default Remove
