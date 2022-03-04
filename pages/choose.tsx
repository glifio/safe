import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { RequireWallet } from '@glif/wallet-provider-react'
import { OneColumnCentered } from '@glif/react-components'

import EnterOrCreateActor from '../components/Msig/EnterOrCreateActor'
import SafePage from '../components/SafePage'
import { navigate } from '../utils/urlParams'
import { PAGE } from '../constants'

const Choose = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <SafePage>
      <OneColumnCentered>
        <RequireWallet gatekeep={gatekeep}>
          <EnterOrCreateActor />
        </RequireWallet>
      </OneColumnCentered>
    </SafePage>
  )
}

export default Choose
