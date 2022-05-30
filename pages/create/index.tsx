import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { RequireWallet } from '@glif/wallet-provider-react'
import { OneColumnCentered } from '@glif/react-components'

import SafePage from '../../components/SafePage'
import { Create } from '../../components/Msig/Create'
import { navigate } from '../../utils/urlParams'
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
