import React from 'react'
import { ErrorView, OneColumnCentered } from '@glif/react-components'
import SafePage from '../../components/SafePage'

const NotAMultisig = () => {
  return (
    <SafePage>
      <OneColumnCentered>
        <ErrorView
          title='Bad actor!'
          description='The actor address you entered does not appear to be a multisig actor.'
        />
      </OneColumnCentered>
    </SafePage>
  )
}

export default NotAMultisig
