import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { OneColumnCentered, RequireWallet } from '@glif/react-components'
import CreateMsig from '../../components/Msig/Create'
import SafePage from '../../components/SafePage'
import { navigate } from '../../utils/urlParams'
import { PAGE } from '../../constants'

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
