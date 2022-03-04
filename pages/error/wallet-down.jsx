import React from 'react'
import { ErrorView } from '@glif/react-components'
import { OneColumnCentered } from '@glif/react-components'
import SafePage from '../../components/SafePage'

const WalletDown = () => {
  return (
    <SafePage>
      <OneColumnCentered>
        <ErrorView
          title='Oops! Something went wrong.'
          description="We've been notified of the outage and expect to be back up and running again shortly."
        />
      </OneColumnCentered>
    </SafePage>
  )
}

export default WalletDown
