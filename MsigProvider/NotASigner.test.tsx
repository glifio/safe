import { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react-hooks'
import {
  WalletProviderWrapper,
  initialState as _walletProviderInitialState,
  TestEnvironment
} from '@glif/react-components'
import { waitFor } from '@testing-library/react'

import {
  mockStateGetActorRes,
  mockStateReadStateSingleSignerRes,
  MULTISIG_ACTOR_ADDRESS
} from '../test-utils/constants'
import { useMsig, MsigProviderWrapper } from '.'
import { MsigActorState } from './types'
import { composeWalletProviderState } from '../test-utils/composeMockAppTree/composeState'
import { addressMocks } from '../test-utils/apolloMocks'

// trying to mock a module with two differet functions and the react hooks test renderer does not work
// so this file tests 1 function that depends on a different implementation of a mock

describe('Not a signer error handling', () => {
  // @ts-ignore
  let Tree = ({ children }) => <>{children}</>
  beforeEach(() => {
    jest
      .spyOn(require('@glif/filecoin-rpc-client'), 'default')
      .mockImplementation(() => {
        return {
          request: jest.fn(async (method) => {
            switch (method) {
              case 'StateGetActor': {
                return mockStateGetActorRes
              }
              case 'StateReadState': {
                return mockStateReadStateSingleSignerRes
              }
              case 'MsigGetAvailableBalance': {
                return '1000000'
              }
            }
          })
        }
      })

    const statePreset = 'selectedOtherWallet'
    const walletProviderInitialState = composeWalletProviderState(
      _walletProviderInitialState,
      statePreset
    )
    Tree = ({ children }: { children: ReactNode }) => (
      <TestEnvironment withApollo apolloMocks={addressMocks}>
        <WalletProviderWrapper
          getState={() => {}}
          statePreset={statePreset}
          // @ts-ignore
          initialState={walletProviderInitialState}
        >
          <MsigProviderWrapper test>{children}</MsigProviderWrapper>
        </WalletProviderWrapper>
      </TestEnvironment>
    )
  })

  test('if wallet address is not a signer, the address not a signer error populates', async () => {
    let { result } = renderHook(() => useMsig(), {
      wrapper: Tree
    })

    await act(async () => {
      result.current.setMsigActor(MULTISIG_ACTOR_ADDRESS)
    })

    await waitFor(() => {
      const msigState: MsigActorState = result.current
      expect(msigState.errors.connectedWalletNotMsigSigner).toBeTruthy()
    })
  }, 10000)
})
