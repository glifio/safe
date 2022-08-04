import {
  Address,
  isAddrEqual,
  LoadingCaption,
  StatusIcon,
  Wallet,
  WALLET_PROPTYPE
} from '@glif/react-components'
import PropTypes from 'prop-types'
import { SIGNER_PROPTYPE } from '../../MsigProvider/types'

const SignerRow = ({ signer, userIsSigner }: SignerRowProps) => {
  return (
    <tr>
      <td>
        {userIsSigner && <StatusIcon color='purple' margin='4px 0 0 1em' />}
      </td>
      <td>{signer.robust}</td>
      <td>{signer.id}</td>
    </tr>
  )
}

type SignerRowProps = {
  signer: Address
  userIsSigner: boolean
}

SignerRow.propTypes = {
  signer: SIGNER_PROPTYPE,
  userIsSigner: PropTypes.bool.isRequired
}

export const SignersTable = ({
  signers,
  loading,
  wallet
}: SignersTableProps) => {
  return (
    <table>
      {loading && <LoadingCaption />}
      <thead>
        <tr>
          <th></th>
          <th>Address</th>
          <th>Id</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {signers.map((s) => (
          <SignerRow
            key={s.robust}
            signer={s}
            userIsSigner={isAddrEqual(s, wallet)}
          />
        ))}
      </tbody>
    </table>
  )
}

type SignersTableProps = {
  signers: Address[]
  loading: boolean
  wallet: Wallet
}

SignersTable.propTypes = {
  signers: SIGNER_PROPTYPE.isRequired,
  loading: PropTypes.bool.isRequired,
  wallet: WALLET_PROPTYPE.isRequired
}
