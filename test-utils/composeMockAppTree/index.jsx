/* eslint-disable react/prop-types */
import {
  theme,
  ThemeProvider,
  PendingMessageProvider,
  WalletProviderWrapper,
  initialState as walletProviderInitialState
} from '@glif/react-components'
import { MockedProvider } from '@apollo/client/testing'
import { WasmContext } from '../../lib/WasmLoader'
import { mockWalletProviderInstance } from '../../__mocks__/@glif/filecoin-wallet-provider'
import * as wasmMethods from '../../__mocks__/@zondax/filecoin-signing-tools'
import { MsigProviderWrapper } from '../../MsigProvider'

import { composeWalletProviderState } from '../../test-utils/composeMockAppTree/composeState'
import { apolloMocks } from '../apolloMocks'

jest.mock('../../MsigProvider')

const Index = (statePreset = 'preOnboard', options = {}) => {
  // here you can pass a walletProviderInitialState and a preset to shape the store how you want it for testing
  const initialState = composeWalletProviderState(
    options?.walletProviderInitialState || walletProviderInitialState,
    statePreset
  )

  let walletProviderCache = { ...initialState }

  const cacheWalletProviderState = (state) => {
    walletProviderCache = { ...state }
    return <></>
  }

  const getWalletProviderState = () => walletProviderCache

  const Tree = ({ children }) => {
    return (
      <MockedProvider mocks={apolloMocks} addTypeName={false}>
        <WasmContext.Provider value={wasmMethods}>
          <PendingMessageProvider>
            <WalletProviderWrapper
              options={options}
              statePreset={statePreset}
              getState={cacheWalletProviderState}
              initialState={initialState}
            >
              <MsigProviderWrapper options={options} statePreset={statePreset}>
                <ThemeProvider theme={theme}>{children}</ThemeProvider>
              </MsigProviderWrapper>
            </WalletProviderWrapper>
          </PendingMessageProvider>
        </WasmContext.Provider>
      </MockedProvider>
    )
  }

  return {
    Tree,
    walletProvider: mockWalletProviderInstance,
    getWalletProviderState
  }
}

/**
 * This function is a wrapper that mocks everything the filecoin app needs for testing
 *
 * VALID OPTIONS:
 * mockConverterInstance (an object that stubs the converter functionality)
 * walletProviderReducer (a reducer to stub the state handling of the wallet provider)
 * walletProviderInitialState(a reducer to stub the state of the walletProvider context)
 * walletProviderDispatch(a dispatcher to mock/read calls to the walletProvider's state)
 * pathname
 * query
 */

export default Index
