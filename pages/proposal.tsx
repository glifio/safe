import { useCallback } from 'react'
import { useRouter } from 'next/router'
import { OneColumn, RequireWallet } from '@glif/react-components'
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
      <OneColumn>
        <RequireWallet gatekeep={gatekeep}>
          <ProposalHistory />
        </RequireWallet>
      </OneColumn>
    </SafePageLoggedIn>
  )
}

export default Proposals
