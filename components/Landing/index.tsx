import React, { useCallback, useMemo, useState } from 'react'
import {
  AppTile,
  Box,
  Footer,
  PhishingBanner,
  LandingPageContainer,
  LandingPageContentContainer,
  space,
  fontSize,
  P,
  isMobileOrTablet,
  theme,
  useNetworkName
} from '@glif/react-components'
import { useRouter } from 'next/router'

import {
  ResponsiveWalletTile,
  ConnectContentContainer,
  ConnectBtn,
  TextBox
} from './Helpers'
import { navigate } from '../../utils/urlParams'
import { PAGE } from '../../constants'

export default function Landing() {
  const isUnsupportedDevice = useMemo(() => isMobileOrTablet(), [])
  const [closed, setClosed] = useState(false)
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
      <LandingPageContainer>
        <PhishingBanner
          href='https://safe.glif.io'
          closed={closed}
          setClosed={() => setClosed(true)}
        />
        <LandingPageContentContainer phishingBannerClosed={closed}>
          <ResponsiveWalletTile phishingBannerClosed={closed}>
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
          </ResponsiveWalletTile>
          <ConnectContentContainer
            style={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
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
              <Box>
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
                <Box mt={6}>
                  <P
                    css={`
                      font-size: ${fontSize('default')};
                    `}
                  >
                    Want to load this app directly from IPFS or Filecoin?
                    <br />
                    Check our{' '}
                    <a
                      href='https://github.com/glifio/safe/releases'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      release page
                    </a>
                  </P>
                  <P
                    css={`
                      font-size: ${fontSize('default')};
                    `}
                  >
                    Need help?
                    <br />
                    Open a{' '}
                    <a
                      href='https://github.com/glifio/safe/issues/new/choose'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      GitHub issue
                    </a>{' '}
                    or hit us up on{' '}
                    <a
                      href='https://twitter.com/glifio'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      Twitter
                    </a>
                  </P>
                </Box>
              </Box>
            )}
          </ConnectContentContainer>
        </LandingPageContentContainer>
      </LandingPageContainer>
      <Box p={`0 ${space()} ${space()}`}>
        <Footer />
      </Box>
    </>
  )
}
