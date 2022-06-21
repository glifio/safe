import { useCallback } from 'react'
import { useRouter } from 'next/router'
import { navigate, OneColumn, RequireWallet } from '@glif/react-components'

import SafePageLoggedIn from '../components/SafePageLoggedIn'
import ProposalHistory from '../components/ProposalHistory'
import { PAGE } from '../constants'

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
