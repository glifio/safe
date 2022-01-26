import App from 'next/app'
import Head from 'next/head'
import React from 'react'
import {
  theme,
  ThemeProvider,
  PendingMessageProvider
} from '@glif/react-components'
import Script from 'next/script'

import {
  WalletProviderWrapper,
  BalancePoller
} from '@glif/wallet-provider-react'
import { ApolloProvider } from '@apollo/client'
import { SWRConfig } from 'swr'
import { MsigProviderWrapper } from '../MsigProvider'
import { WasmLoader } from '../lib/WasmLoader'
import { createApolloClient } from '../apolloClient'
import ErrorBoundary from '../components/ErrorBoundary'
import JSONLD from '../JSONLD'
import '../stylesheets/normalize.css'
import '../stylesheets/styles.css'

const client = createApolloClient()

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props
    return (
      <>
        <Head>
          <title>GLIF Safe</title>
          <meta name='description' content='A Filecoin multisig wallet.' />
          <meta
            name='keywords'
            content='Filecoin,Wallet,Web,Storage,Blockchain,Crypto,FIL'
          />
          <meta property='og:image' content='/bg-sender.jpg' />
          <meta property='og:title' content='GLIF Sender' />
          <meta
            property='og:description'
            content='A Filecoin multisig wallet.'
          />
          <meta property='og:url' content='https://safe.glif.io' />
          <meta name='twitter:title' content='GLIF Safe' />
          <meta
            name='twitter:description'
            content='A Filecoin multisig wallet.'
          />
          <meta name='twitter:image' content='/bg-safe.jpg' />
          <meta name='twitter:card' content='summary_large_image' />
          <meta name='twitter:creator' content='@glifio' key='twhandle' />
          <meta property='og:site_name' content='GLIF Safe' />
          <meta
            name='twitter:image:alt'
            content='A Filecoin multisig wallet.'
          />
          <link
            rel='icon'
            type='image/png'
            sizes='32x32'
            href='/static/favicon-32x32.png'
          />
          <link
            rel='icon'
            type='image/png'
            sizes='16x16'
            href='/static/favicon-32x32.png'
          />
        </Head>
        <Script
          id='json-ld'
          type='application/ld+json'
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }}
        />
        <ApolloProvider client={client}>
          <SWRConfig value={{ refreshInterval: 10000 }}>
            <ThemeProvider theme={theme}>
              <WasmLoader>
                <WalletProviderWrapper>
                  <MsigProviderWrapper>
                    <BalancePoller />
                    <PendingMessageProvider>
                      <ErrorBoundary>
                        <Component {...pageProps} />
                      </ErrorBoundary>
                    </PendingMessageProvider>
                  </MsigProviderWrapper>
                </WalletProviderWrapper>
              </WasmLoader>
            </ThemeProvider>
          </SWRConfig>
        </ApolloProvider>
      </>
    )
  }
}

export default MyApp
