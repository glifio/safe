import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { OneColumnCentered, RequireWallet } from '@glif/react-components'

import SafePage from '../components/SafePage'
import { Choose } from '../components/Msig/Choose'
import { navigate } from '../utils/urlParams'
import { PAGE } from '../constants'

const ChoosePage = () => {
  const router = useRouter()
  const gatekeep = useCallback(
    () => navigate(router, { pageUrl: PAGE.LANDING }),
    [router]
  )
  return (
    <SafePage>
      <OneColumnCentered>
        <RequireWallet gatekeep={gatekeep}>
          <Choose />
        </RequireWallet>
      </OneColumnCentered>
    </SafePage>
  )
}

export default ChoosePage
