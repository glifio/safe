import {
  Address,
  AddressLink,
  GRAPHQL_ADDRESS_PROP_TYPE,
  IconClose,
  IconEdit,
  isAddrEqual,
  StatusIcon,
  Wallet,
  WALLET_PROPTYPE
} from '@glif/react-components'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { SIGNER_PROPTYPE } from '../../MsigProvider/types'

const IconsWrapper = styled.div`
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
`

const SignerRow = ({
  signer,
  userIsSigner,
  onChange,
  onRemove
}: SignerRowProps) => {
  return (
    <tr>
      <td>
        {userIsSigner && <StatusIcon color='purple' margin='4px 0 0 1em' />}
      </td>
      <td>
        <AddressLink
          address={signer.robust || signer.id}
          shouldTruncate={false}
          hideCopyText={false}
        />
      </td>
      <td>
        <IconsWrapper>
          <span
            role='button'
            aria-label='edit-signer'
            onClick={() => onChange(signer.robust || signer.id)}
          >
            <IconEdit stroke='var(--gray-dark)' />
          </span>
          <span
            role='button'
            aria-label='remove-signer'
            onClick={() => onRemove(signer.robust || signer.id)}
          >
            <IconClose fill='var(--gray-dark)' />
          </span>
        </IconsWrapper>
      </td>
    </tr>
  )
}

type SignerRowProps = {
  signer: Address
  userIsSigner: boolean
  onRemove: (address: string) => void
  onChange: (address: string) => void
}

SignerRow.propTypes = {
  signer: GRAPHQL_ADDRESS_PROP_TYPE,
  userIsSigner: PropTypes.bool.isRequired,
  onRemove: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired
}

export const SignersTable = ({
  signers,
  wallet,
  onChange,
  onRemove
}: SignersTableProps) => {
  return (
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Address</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {signers.map((s) => (
          <SignerRow
            key={s.robust}
            signer={s}
            userIsSigner={isAddrEqual(s, wallet)}
            onChange={onChange}
            onRemove={onRemove}
          />
        ))}
      </tbody>
    </table>
  )
}

type SignersTableProps = {
  signers: Address[]
  wallet: Wallet
  onRemove: (address: string) => void
  onChange: (address: string) => void
}

SignersTable.propTypes = {
  signers: SIGNER_PROPTYPE.isRequired,
  wallet: WALLET_PROPTYPE.isRequired,
  onRemove: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired
}
