import PropTypes from 'prop-types'
import { useRouter } from 'next/router'
import {
  navigate,
  ADDRESS_PROPTYPE,
  Address as AddressType
} from '@glif/react-components'
import { Signer } from './Signer'
import { PAGE } from '../../constants'

export const Signers = ({ signers }: { signers: AddressType[] }) => {
  const router = useRouter()
  return (
    <>
      {signers.map((signer) => (
        <Signer
          key={signer.robust || signer.id}
          address={signer}
          onRemoveSigner={() => {
            navigate(router, {
              pageUrl: PAGE.MSIG_REMOVE_SIGNER,
              params: {
                address: signer.robust || signer.id
              }
            })
          }}
          onChangeSigner={() => {
            navigate(router, {
              pageUrl: PAGE.MSIG_CHANGE_SIGNER,
              params: {
                address: signer.robust || signer.id
              }
            })
          }}
        />
      ))}
    </>
  )
}

Signers.propTypes = {
  signers: PropTypes.arrayOf(
    PropTypes.shape({
      robust: ADDRESS_PROPTYPE,
      id: ADDRESS_PROPTYPE
    })
  ).isRequired
}
