import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { RequireWallet } from '@glif/wallet-provider-react'
import { AddSigner } from '../../components/Msig'
import { MsigPageWrapper } from '../../components/Msig/Shared'
import { navigate } from '../../utils/urlParams'
import { PAGE } from '../../constants'

const Add = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <RequireWallet gatekeep={gatekeep}>
      <MsigPageWrapper hideNav>
        <AddSigner />
      </MsigPageWrapper>
    </RequireWallet>
  )
}

export default Add
