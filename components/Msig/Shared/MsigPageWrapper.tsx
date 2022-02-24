import React, { cloneElement, ReactElement } from 'react'
import { node } from 'prop-types'
import { Box, LoadingScreen } from '@glif/react-components'
import { useWallet } from '@glif/wallet-provider-react'

import { useMsig } from '../../../MsigProvider'
import PageHeader from './PageHeader'

const MsigPageWrapper = ({
  children,
  ...props
}: {
  children: ReactElement
}) => {
  const msig = useMsig()
  const wallet = useWallet()

  return (
    <Box
      position='relative'
      display='flex'
      justifyContent='center'
      paddingBottom={8}
    >
      {msig.loading && <LoadingScreen width='100%' />}
      {!msig.loading && (
        <Box display='flex' flexDirection='column' width='100%'>
          <PageHeader
            msigAddress={msig.Address}
            walletAddress={wallet.address}
          />
          {cloneElement(children, props)}
        </Box>
      )}
    </Box>
  )
}

MsigPageWrapper.propTypes = {
  children: node.isRequired
}

export default MsigPageWrapper
