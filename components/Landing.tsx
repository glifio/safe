import styled from 'styled-components'
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
  Network,
  PrimaryBox,
  IconWarn,
  Colors
} from '@glif/react-components'

const DeprecationBox = styled(PrimaryBox)`
  font-size: 1.25em;
  a:hover {
    color: var(--purple-light);
    text-decoration: underline;
    text-decoration-color: var(--purple-light);
  }
`

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

            <DeprecationBox>
              <IconWarn height='1.25em' color={Colors.WHITE} />
              The GLIF Safe will redirect you to{' '}
              <SmartLink href='https://glif.io/multisig'>
                https://glif.io/multisig
              </SmartLink>{' '}
              in January 2024
            </DeprecationBox>

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
