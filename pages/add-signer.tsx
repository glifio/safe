import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { RequireWallet } from '@glif/wallet-provider-react'
import { OneColumnCentered } from '@glif/react-components'
import SafePageLoggedIn from '../components/SafePageLoggedIn'
import AddSigner from '../components/Msig/AddRmSigners/AddSigner'
import { navigate } from '../utils/urlParams'
import { PAGE } from '../constants'

const Add = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <SafePageLoggedIn>
      <OneColumnCentered>
        <RequireWallet gatekeep={gatekeep}>
          <AddSigner />
        </RequireWallet>
      </OneColumnCentered>
    </SafePageLoggedIn>
  )
}

export default Add
