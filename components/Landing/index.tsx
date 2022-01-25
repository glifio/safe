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
  H2,
  P,
  isMobileOrTablet,
  theme
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
              title='Safe'
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
                  We&apos;re sorry, the Glif Sender only supports desktop
                  browsers at the moment. Please come back on your computer!
                </P>
              </TextBox>
            ) : (
              <Box>
                <H2
                  style={{
                    marginTop: 0,
                    marginBottom: '1em',
                    fontWeight: 'normal',
                    fontSize: fontSize('large'),
                    lineHeight: '1.3em'
                  }}
                >
                  Connect
                </H2>

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
                    Want to load this app directly from IPFS/FIL?
                    <br />
                    Check our <a href='#'>release page</a>
                  </P>

                  <P
                    css={`
                      font-size: ${fontSize('default')};
                    `}
                  >
                    Need help?
                    <br />
                    <a href='#'>Reach out</a> to us
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
