import React from 'react'
import { ErrorView, OneColumnCentered } from '@glif/react-components'
import SafePage from '../../components/SafePage'

const NodeDisconnected = () => {
  return (
    <SafePage>
      <OneColumnCentered>
        <ErrorView
          title='Disconnected!'
          description='We had trouble connecting to our Filecoin nodes. Sorry for the inconvenience, please try again in a few hours!'
        />
      </OneColumnCentered>
    </SafePage>
  )
}

export default NodeDisconnected
