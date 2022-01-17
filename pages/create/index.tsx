import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { RequireWallet } from '@glif/wallet-provider-react'
import CreateMsig from '../../components/Msig/Create'
import { MsigPageWrapper } from '../../components/Msig/Shared'
import { navigate } from '../../utils/urlParams'
import { PAGE } from '../../constants'

const Create = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <RequireWallet gatekeep={gatekeep}>
      <MsigPageWrapper hideNav>
        <CreateMsig />
      </MsigPageWrapper>
    </RequireWallet>
  )
}

export default Create
