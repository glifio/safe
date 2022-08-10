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
import PropTypes from 'prop-types'
import { ButtonsTD } from './ButtonsTD'

const SignerRow = ({
  signer,
  isCurrentUser,
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
        {isCurrentUser ? (
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
  isCurrentUser: boolean
  onRemove: (address: string) => void
  onChange: (address: string) => void
}

SignerRow.propTypes = {
  signer: GRAPHQL_ADDRESS_PROP_TYPE,
  isCurrentUser: PropTypes.bool.isRequired,
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
          <th>Current Signers</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {signers.map((s) => (
          <SignerRow
            key={s.robust}
            signer={s}
            isCurrentUser={isAddrEqual(s, wallet)}
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
