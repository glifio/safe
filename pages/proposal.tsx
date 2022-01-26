import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { RequireWallet } from '@glif/wallet-provider-react'
import ProposalHistory from '../components/Msig/ProposalHistory'
import { navigate } from '../utils/urlParams'
import { PAGE } from '../constants'

const Proposals = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <RequireWallet gatekeep={gatekeep}>
      <ProposalHistory />
    </RequireWallet>
  )
}

export default Proposals
