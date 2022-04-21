import React from 'react'
import PropTypes from 'prop-types'
import { useRouter } from 'next/router'
import { Address as AddressType } from '@glif/react-components'
import { ADDRESS_PROPTYPE } from '../../../customPropTypes'
import Address from './Address'
import { navigate } from '../../../utils/urlParams'
import { PAGE } from '../../../constants'

const Signers = ({ signers }: { signers: AddressType[] }) => {
  const router = useRouter()
  return (
    <>
      {signers.map((signer) => {
        return (
          <Address
            key={signer.robust || signer.id}
            address={signer}
            onRemoveSigner={() => {
              navigate(router, {
                pageUrl: PAGE.MSIG_REMOVE_SIGNER,
                newQueryParams: {
                  address: signer.robust || signer.id
                }
              })
            }}
            onChangeSigner={() => {
              navigate(router, {
                pageUrl: PAGE.MSIG_CHANGE_SIGNER,
                newQueryParams: {
                  address: signer.robust || signer.id
                }
              })
            }}
          />
        )
      })}
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

export default Signers
