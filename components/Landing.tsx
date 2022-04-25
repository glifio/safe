import React, { useMemo } from 'react'
import {
  AppTile,
  Box,
  ButtonV2Link,
  LandingPageColumns,
  LandingPageContent,
  OneColumnLargeText,
  space,
  Page,
  isMobileOrTablet,
  useNetworkName,
  SmartLink
} from '@glif/react-components'

import { GLIF_DISCORD, GLIF_TWITTER, PAGE } from '../constants'

export default function Landing() {
  const isUnsupportedDevice = useMemo(() => isMobileOrTablet(), [])
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
              We&apos;re sorry, the Glif Safe only supports desktop browsers at
              the moment. Please come back on your computer!
            </p>
          </OneColumnLargeText>
        ) : (
          <LandingPageContent>
            <h2>Connect</h2>
            <Box display='flex' flexDirection='column' gridGap={space()}>
              <ButtonV2Link large href={PAGE.CONNECT_METAMASK}>
                MetaMask
              </ButtonV2Link>
              <ButtonV2Link large href={PAGE.CONNECT_LEDGER}>
                Ledger Device
              </ButtonV2Link>
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
              <SmartLink href='https://github.com/glifio/wallet/issues/new/choose'>
                GitHub issue
              </SmartLink>
              , join our <SmartLink href={GLIF_DISCORD}>Discord</SmartLink>, or
              or hit us up on <SmartLink href={GLIF_TWITTER}>Twitter</SmartLink>{' '}
            </p>
          </LandingPageContent>
        )}
      </LandingPageColumns>
    </Page>
  )
}
