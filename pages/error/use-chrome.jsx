import React from 'react'
import { ErrorView } from '@glif/react-components'
import { OneColumnCentered } from '@glif/react-components'
import SafePage from '../../components/SafePage'

const UseChrome = () => {
  return (
    <SafePage>
      <OneColumnCentered>
        <ErrorView
          title='Only Chrome has Ledger support'
          description='Please install Google Chrome to continue using your Ledger device, or choose an alternative setup option'
          linkDisplay='Install Google Chrome.'
          linkhref='https://www.google.com/chrome'
        />
      </OneColumnCentered>
    </SafePage>
  )
}

export default UseChrome
