import { useMemo } from 'react'
import {
  AppTile,
  ButtonV2Link,
  LandingPageColumns,
  LandingPageContent,
  OneColumnLargeText,
  Page,
  isMobileOrTablet,
  SmartLink,
  FullWidthButtons,
  useEnvironment,
  Network
} from '@glif/react-components'

import { GLIF_DISCORD, GLIF_TWITTER, PAGE } from '../constants'

export default function Landing() {
  const isUnsupportedDevice = useMemo(() => isMobileOrTablet(), [])
  const { networkName } = useEnvironment()

  return (
    <Page phishingUrl='https://safe.glif.io' hideAppHeader>
      <LandingPageColumns>
        <AppTile
          title={
            networkName && networkName !== Network.MAINNET
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

            <FullWidthButtons>
              <ButtonV2Link large retainParams href={PAGE.CONNECT_METAMASK}>
                MetaMask
              </ButtonV2Link>
              <ButtonV2Link large retainParams href={PAGE.CONNECT_LEDGER}>
                Ledger Device
              </ButtonV2Link>
            </FullWidthButtons>

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
