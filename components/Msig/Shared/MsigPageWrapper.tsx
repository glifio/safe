import React, { cloneElement, ReactElement, useCallback } from 'react'
import { bool, node } from 'prop-types'
import {
  Box,
  LoadingScreen,
  ButtonV2,
  NetworkConnection
} from '@glif/react-components'
import { useWallet } from '@glif/wallet-provider-react'
import { useRouter } from 'next/router'

import { useMsig } from '../../../MsigProvider'
import { resetWallet, navigate } from '../../../utils/urlParams'
import { PAGE } from '../../../constants'
import PageHeader from './PageHeader'

const MsigPageWrapper = ({
  children,
  hideNav,
  ...props
}: {
  children: ReactElement
  hideNav: boolean
}) => {
  const msig = useMsig()
  const wallet = useWallet()
  const router = useRouter()

  const onNodeDisconnect = useCallback(() => {
    navigate(router, { pageUrl: PAGE.NODE_DISCONNECTED })
  }, [router])

  return (
    <Box
      display='flex'
      justifyContent='center'
      width='100%'
      minHeight='100vh'
      p={3}
    >
      {hideNav ? (
        cloneElement(children, props)
      ) : (
        <>
          <Box
            position='relative'
            display='flex'
            justifyContent='center'
            width='100%'
            p={3}
            // padding for logout button to ensure it never sits on top of the content
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

            <ButtonV2
              css={`
                position: absolute;
                bottom: 0;
                left: 0;
              `}
              small
              m={5}
              onClick={resetWallet}
            >
              Logout
            </ButtonV2>
            <NetworkConnection
              position='absolute'
              bottom='0'
              right='0'
              m={5}
              lotusApiAddr={process.env.NEXT_PUBLIC_LOTUS_NODE_JSONRPC}
              apiKey={process.env.NEXT_PUBLIC_NODE_STATUS_API_KEY}
              statusApiAddr={process.env.NEXT_PUBLIC_NODE_STATUS_API_ADDRESS}
              errorCallback={onNodeDisconnect}
            />
          </Box>
        </>
      )}
    </Box>
  )
}

MsigPageWrapper.propTypes = {
  children: node.isRequired,
  hideNav: bool
}

MsigPageWrapper.defaultProps = {
  hideNav: false
}

export default MsigPageWrapper
