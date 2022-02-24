import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { RequireWallet } from '@glif/wallet-provider-react'
import { OneColumnCentered } from '@glif/react-components'
import CreateMsig from '../../components/Msig/Create'
import { navigate } from '../../utils/urlParams'
import { PAGE } from '../../constants'
import SafePage from '../../components/SafePage'

const Create = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <SafePage>
      <OneColumnCentered>
        <RequireWallet gatekeep={gatekeep}>
          <CreateMsig />
        </RequireWallet>
      </OneColumnCentered>
    </SafePage>
  )
}

export default Create
