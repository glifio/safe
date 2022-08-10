import {
  Address,
  AddressLink,
  GRAPHQL_ADDRESS_PROP_TYPE,
  IconClose,
  IconEdit,
  isAddrEqual,
  Wallet,
  WALLET_PROPTYPE
} from '@glif/react-components'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const ButtonsTD = styled.td`
  color: var(--gray-medium);
  text-align: right;

  > div {
    display: flex;
    align-items: center;
    justify-content: end;
    gap: var(--space-s);

    > span {
      cursor: pointer;
      transition: transform 0.1s ease-out;

      &:hover {
        transform: scale(1.2);
      }

      svg {
        vertical-align: middle;
      }
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
        <AddressLink
          address={signer.robust || signer.id}
          shouldTruncate={false}
          hideCopyText={false}
        />
      </td>
      <ButtonsTD>
        {userIsSigner ? (
          <>this is you</>
        ) : (
          <div>
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
          </div>
        )}
      </ButtonsTD>
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
  signers: PropTypes.arrayOf(GRAPHQL_ADDRESS_PROP_TYPE).isRequired,
  wallet: WALLET_PROPTYPE.isRequired,
  onRemove: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired
}
