import { useCallback } from 'react'
import { useRouter } from 'next/router'
import {
  getQueryParam,
  navigate,
  OneColumnCentered,
  RequireWallet
} from '@glif/react-components'

import SafePageLoggedIn from '../components/SafePageLoggedIn'
import { RemoveSigner } from '../components/RemoveSigner'
import { PAGE } from '../constants'

const RemoveSignerPage = () => {
  const router = useRouter()
  const address = getQueryParam.string(router, 'address')
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <SafePageLoggedIn>
      <OneColumnCentered>
        <RequireWallet gatekeep={gatekeep}>
          <RemoveSigner signerAddress={address} />
        </RequireWallet>
      </OneColumnCentered>
    </SafePageLoggedIn>
  )
}

export default RemoveSignerPage
