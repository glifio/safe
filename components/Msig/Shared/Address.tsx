import React from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  CopyAddress,
  ButtonClose,
  ButtonEdit
} from '@glif/react-components'
import { ADDRESS_PROPTYPE } from '../../../customPropTypes'

const Address = ({
  address,
  onRemoveSigner,
  onChangeSigner
}: {
  address: string
  onRemoveSigner?: () => void
  onChangeSigner?: () => void
}) => {
  return (
    <Box
      display='flex'
      alignItems='center'
      color='core.darkgray'
      bg='background.messageHistory'
      height={6}
      px={3}
      my={2}
      borderRadius={2}
    >
      <Box flexGrow='1'>
        <CopyAddress color='core.nearblack' address={address} />
      </Box>
      {onChangeSigner && (
        <ButtonEdit
          role='button'
          type='button'
          onClick={onChangeSigner}
          stroke='core.darkgray'
          aria-label='edit-signer'
        />
      )}
      {onRemoveSigner && (
        <ButtonClose
          fill='core.darkgray'
          role='button'
          type='button'
          onClick={onRemoveSigner}
          aria-label='remove-signer'
        />
      )}
    </Box>
  )
}

Address.propTypes = {
  address: ADDRESS_PROPTYPE,
  onRemoveSigner: PropTypes.func,
  onChangeSigner: PropTypes.func
}

export default Address
