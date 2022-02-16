import React, { useCallback, useMemo } from 'react'
import {
  AppHeader,
  AppTile,
  Box,
  Footer,
  PhishingBanner,
  LandingPageOuter,
  LandingPageInner,
  LandingPageAppTile,
  LandingPageContent,
  space,
  fontSize,
  P,
  isMobileOrTablet,
  theme,
  useNetworkName,
  SmartLink
} from '@glif/react-components'
import { useRouter } from 'next/router'

import { ConnectBtn, TextBox } from './Helpers'
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
    <>
      <LandingPageOuter>
        <PhishingBanner href='https://safe.glif.io' />
        <AppHeader
          homeUrl={process.env.NEXT_PUBLIC_HOME_URL}
          blogUrl={process.env.NEXT_PUBLIC_BLOG_URL}
          walletUrl={process.env.NEXT_PUBLIC_WALLET_URL}
          safeUrl={process.env.NEXT_PUBLIC_SAFE_URL}
        />
        <LandingPageInner>
          <LandingPageAppTile>
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
          </LandingPageAppTile>
          <LandingPageContent>
            {isUnsupportedDevice ? (
              <TextBox style={{ background: theme.colors.core.primary }}>
                <P
                  css={`
                    font-size: ${fontSize('large')};
                    color: white;
                  `}
                >
                  We&apos;re sorry, the Glif Safe only supports desktop browsers
                  at the moment. Please come back on your computer!
                </P>
              </TextBox>
            ) : (
              <>
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
                  <ConnectBtn
                    large
                    onClick={() => connect(PAGE.CONNECT_LEDGER)}
                  >
                    Ledger Device
                  </ConnectBtn>
                </Box>
                <Box mt={6} fontSize='1.125rem'>
                  <P>
                    Want to load this app directly from IPFS or Filecoin?
                    <br />
                    Check our{' '}
                    <SmartLink href='https://github.com/glifio/safe/releases'>
                      release page
                    </SmartLink>
                  </P>
                  <P>
                    Need help?
                    <br />
                    Open a{' '}
                    <SmartLink href='https://github.com/glifio/safe/issues/new/choose'>
                      GitHub issue
                    </SmartLink>{' '}
                    or hit us up on{' '}
                    <SmartLink href='https://twitter.com/glifio'>
                      Twitter
                    </SmartLink>
                  </P>
                </Box>
              </>
            )}
          </LandingPageContent>
        </LandingPageInner>
      </LandingPageOuter>
      <Footer />
    </>
  )
}
