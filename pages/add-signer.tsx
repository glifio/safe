import { useCallback } from 'react'
import { useRouter } from 'next/router'
import {
  navigate,
  OneColumnCentered,
  RequireWallet
} from '@glif/react-components'

import SafePageLoggedIn from '../components/SafePageLoggedIn'
import { AddSigner } from '../components/AddSigner'
import { PAGE } from '../constants'

const AddSignerPage = () => {
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

export default AddSignerPage
