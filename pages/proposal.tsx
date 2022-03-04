import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { RequireWallet } from '@glif/wallet-provider-react'
import { OneColumnCentered } from '@glif/react-components'
import SafePageLoggedIn from '../components/SafePageLoggedIn'
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
    <SafePageLoggedIn>
      <OneColumnCentered>
        <RequireWallet gatekeep={gatekeep}>
          <ProposalHistory />
        </RequireWallet>
      </OneColumnCentered>
    </SafePageLoggedIn>
  )
}

export default Proposals
