import React from 'react'
import PropTypes from 'prop-types'
import { useRouter } from 'next/router'
import { ADDRESS_PROPTYPE } from '../../../customPropTypes'
import converAddrToFPrefix from '../../../utils/convertAddrToFPrefix'
import Address from './Address'
import { navigate } from '../../../utils/urlParams'
import { PAGE } from '../../../constants'
import { Signer } from '../../../MsigProvider/types'

const Signers = ({
  signers,
  walletAddress
}: {
  signers: Signer[]
  walletAddress: string
}) => {
  const router = useRouter()
  return (
    <>
      {signers
        .filter(
          (signer) =>
            converAddrToFPrefix(signer.account) !==
            converAddrToFPrefix(walletAddress)
        )
        .map((signer) => {
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
  ).isRequired,
  walletAddress: ADDRESS_PROPTYPE
}

export default Signers
