import React, { useCallback, useMemo } from 'react'
import {
  AppTile,
  Box,
  LandingPageColumns,
  LandingPageContent,
  OneColumnLargeText,
  space,
  Page,
  isMobileOrTablet,
  useNetworkName,
  SmartLink
} from '@glif/react-components'
import { useRouter } from 'next/router'

import { ConnectBtn } from './Helpers'
import { navigate } from '../../utils/urlParams'
import { PAGE } from '../../constants'

export default function Landing() {
  const isUnsupportedDevice = useMemo(() => isMobileOrTablet(), [])
  const router = useRouter()

  const connect = useCallback(
    (pageUrl: PAGE) => {
      navigate(router, { pageUrl })
    },
    [router]
  )

  const { networkName } = useNetworkName(
    process.env.NEXT_PUBLIC_LOTUS_NODE_JSONRPC
  )

  return (
    <Page phishingUrl='https://safe.glif.io' hideAppHeader>
      <LandingPageColumns>
        <AppTile
          title={
            networkName && networkName !== 'Mainnet'
              ? `Safe (${networkName})`
              : 'Safe'
          }
          oldTileName='Vault'
          description='A Filecoin multisig wallet.'
          imgSrc='/bg-safe.jpg'
          imgSrcHover='/bg-safe-hover.jpg'
          small={false}
          large
        />
        {isUnsupportedDevice ? (
          <OneColumnLargeText className='primary'>
            <p>
              We&apos;re sorry, the Glif Safe only supports desktop browsers
              at the moment. Please come back on your computer!
            </p>
          </OneColumnLargeText>
        ) : (
          <LandingPageContent>
            <h2>Connect</h2>
            <Box
              display='flex'
              flexDirection='column'
              width='100%'
              css={`
                &:not(:first-child) {
                  margin-top: ${space()};
                }
              `}
            >
              <ConnectBtn
                large
                onClick={() => connect(PAGE.CONNECT_METAMASK)}
              >
                MetaMask
              </ConnectBtn>
              <ConnectBtn large onClick={() => connect(PAGE.CONNECT_LEDGER)}>
                Ledger Device
              </ConnectBtn>
            </Box>

            <p>
              Want to load this app directly from IPFS or Filecoin?
              <br />
              Check our{' '}
              <SmartLink href='https://github.com/glifio/safe/releases'>
                release page
              </SmartLink>
            </p>

            <p>
              Need help?
              <br />
              Open a{' '}
              <SmartLink href='https://github.com/glifio/safe/issues/new/choose'>
                GitHub issue
              </SmartLink>{' '}
              or hit us up on{' '}
              <SmartLink href='https://twitter.com/glifio'>Twitter</SmartLink>
            </p>
          </LandingPageContent>
        )}
      </LandingPageColumns>
    </Page>
  )
}
