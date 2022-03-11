import React from 'react'
import { ErrorView, OneColumnCentered } from '@glif/react-components'
import SafePage from '../../components/SafePage'

const NotSupportedMsig = () => {
  return (
    <SafePage>
      <OneColumnCentered>
        <ErrorView
          title='Unsupported multisig actor!'
          description='We only support single signer multisigs at the moment. Tweet at us if you want us to support multsigners!'
        />
      </OneColumnCentered>
    </SafePage>
  )
}

export default NotSupportedMsig
