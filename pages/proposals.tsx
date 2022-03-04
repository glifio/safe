import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { RequireWallet } from '@glif/wallet-provider-react'
import { OneColumn } from '@glif/react-components'
import ProposalHistory from '../components/Msig/ProposalHistory'
import { navigate } from '../utils/urlParams'
import { PAGE } from '../constants'
import SafePageLoggedIn from '../components/SafePageLoggedIn'

const Proposals = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <SafePageLoggedIn>
      <OneColumn>
        <RequireWallet gatekeep={gatekeep}>
          <ProposalHistory />
        </RequireWallet>
      </OneColumn>
    </SafePageLoggedIn>
  )
}

export default Proposals
