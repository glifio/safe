import PropTypes from 'prop-types'
import {
  Box,
  ButtonClose,
  ButtonEdit,
  AddressLink,
  Address,
  GRAPHQL_ADDRESS_PROP_TYPE
} from '@glif/react-components'

export const Signer = ({
  address,
  onRemove,
  onChange
}: SignerProps) => (
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
      <AddressLink
        id={address.id}
        address={address.robust}
        hideCopyText={false}
        hideCopy={false}
      />
    </Box>
    {onChange && (
      <ButtonEdit
        role='button'
        type='button'
        onClick={onChange}
        stroke='core.darkgray'
        aria-label='edit-signer'
      />
    )}
    {onRemove && (
      <ButtonClose
        fill='core.darkgray'
        role='button'
        type='button'
        onClick={onRemove}
        aria-label='remove-signer'
      />
    )}
  </Box>
)

interface SignerProps {
  address: Address
  onRemove?: () => void
  onChange?: () => void
}

Signer.propTypes = {
  address: GRAPHQL_ADDRESS_PROP_TYPE.isRequired,
  onRemove: PropTypes.func,
  onChange: PropTypes.func
}
