import React from 'react'
import PropTypes from 'prop-types'
import { useRouter } from 'next/router'
import { ADDRESS_PROPTYPE } from '../../../customPropTypes'
import Address from './Address'
import { navigate } from '../../../utils/urlParams'
import { PAGE } from '../../../constants'
import { Signer } from '../../../MsigProvider/types'

const Signers = ({ signers }: { signers: Signer[] }) => {
  const router = useRouter()
  return (
    <>
      {signers.map((signer) => {
        return (
          <Address
            key={signer.account}
            address={signer.account}
            onRemoveSigner={() => {
              navigate(router, {
                pageUrl: PAGE.MSIG_REMOVE_SIGNER,
                newQueryParams: {
                  address: signer.account
                }
              })
            }}
            onChangeSigner={() => {
              navigate(router, {
                pageUrl: PAGE.MSIG_CHANGE_SIGNER,
                newQueryParams: {
                  address: signer.account
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
      account: ADDRESS_PROPTYPE,
      id: ADDRESS_PROPTYPE
    })
  ).isRequired
}

export default Signers
