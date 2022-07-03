import styled from 'styled-components'
import PropTypes from 'prop-types'
import {
  IconEdit,
  IconClose,
  AddressLink,
  Address,
  GRAPHQL_ADDRESS_PROP_TYPE
} from '@glif/react-components'

const SignerEl = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75em 1em 0.75em 0.75em;
  color: var(--gray-dark);
  background-color: var(--blue-gray);
  border-radius: 4px;

  div:last-child {
    display: flex;
    align-items: center;

    > span {
      display: block;
      cursor: pointer;
      line-height: 0;
      margin-left: 0.5em;
      transition: transform 0.1s ease-out;

      &:hover {
        transform: scale(1.2);
      }
    }
  }
`

export const Signer = ({ address, onRemove, onChange }: SignerProps) => (
  <SignerEl>
    <AddressLink
      id={address.id}
      address={address.robust}
      hideCopyText={false}
      hideCopy={false}
    />
    <div>
      {onChange && (
        <span role='button' aria-label='edit-signer' onClick={onChange}>
          <IconEdit stroke='var(--gray-dark)' />
        </span>
      )}
      {onRemove && (
        <span role='button' aria-label='remove-signer' onClick={onRemove}>
          <IconClose fill='var(--gray-dark)' />
        </span>
      )}
    </div>
  </SignerEl>
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
