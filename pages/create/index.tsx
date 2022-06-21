import { useCallback } from 'react'
import { useRouter } from 'next/router'
import {
  navigate,
  OneColumnCentered,
  RequireWallet
} from '@glif/react-components'

import SafePage from '../../components/SafePage'
import { Create } from '../../components/Create'
import { PAGE } from '../../constants'

const CreatePage = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <SafePage>
      <OneColumnCentered>
        <RequireWallet gatekeep={gatekeep}>
          <Create />
        </RequireWallet>
      </OneColumnCentered>
    </SafePage>
  )
}

export default CreatePage
