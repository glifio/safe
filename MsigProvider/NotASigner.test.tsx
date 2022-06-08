import { act, renderHook } from '@testing-library/react-hooks'
import { FilecoinNumber } from '@glif/filecoin-number'
import { cleanup } from '@testing-library/react'
import { ReactNode } from 'react'
import {
  WalletProviderWrapper,
  initialState as _walletProviderInitialState
} from '@glif/react-components'

import { MULTISIG_ACTOR_ADDRESS } from '../test-utils/constants'
import { useMsig, MsigProviderWrapper } from '.'
import { MsigActorState } from './types'
import { composeWalletProviderState } from '../test-utils/composeMockAppTree/composeState'

// trying to mock a module with two differet functions and the react hooks test renderer does not work
// so this file tests 1 function that depends on a different implementation of a mock

describe('Not a signer error handling', () => {
  afterEach(cleanup)
  // @ts-ignore
  let Tree = ({ children }) => <>{children}</>
  beforeEach(() => {
    jest.clearAllMocks()

    jest
      .spyOn(require('@glif/filecoin-rpc-client'), 'default')
      .mockImplementation(() => {
        return {
          request: jest.fn(async (method) => {
            switch (method) {
              case 'StateGetActor': {
                return {
                  Code: { '/': 'bafkqadtgnfwc6nrpnv2wy5djonuwo' },
                  Balance: '80000000000'
                }
              }
              case 'StateReadState': {
                return {
                  Balance: new FilecoinNumber('1', 'fil').toAttoFil(),
                  State: {
                    InitialBalance: new FilecoinNumber('1', 'fil').toAttoFil(),
                    NextTxnID: 2,
                    NumApprovalsThreshold: 1,
                    Signers: ['f01234'],
                    StartEpoch: 1000,
                    UnlockDuration: 0
                  }
                }
              }
              case 'MsigGetAvailableBalance': {
                return '1000000'
              }
              case 'StateLookupID': {
                return 't0123445'
              }
            }
          })
        }
      })

    jest
      .spyOn(require('../apolloClient'), 'createApolloClient')
      .mockImplementation(() => {
        return {
          query: ({ variables }) =>
            Promise.resolve({
              data: {
                address: {
                  id: variables.address,
                  robust: variables.address
                }
              }
            })
        }
      })

    const statePreset = 'postOnboard'
    const walletProviderInitialState = composeWalletProviderState(
      _walletProviderInitialState,
      statePreset
    )
    Tree = ({ children }: { children: ReactNode }) => (
      <WalletProviderWrapper
        getState={() => {}}
        statePreset={statePreset}
        initialState={walletProviderInitialState}
      >
        <MsigProviderWrapper test>{children}</MsigProviderWrapper>
      </WalletProviderWrapper>
    )
  })

  test('if wallet address is not a signer, the address not a signer error populates', async () => {
    jest
      .spyOn(require('../utils/msig/isAddressSigner'), 'default')
      .mockImplementation(async () => false)

    let { waitForNextUpdate, result, unmount } = renderHook(() => useMsig(), {
      wrapper: Tree
    })
    act(() => {
      result.current.setMsigActor(MULTISIG_ACTOR_ADDRESS)
    })
    await waitForNextUpdate({ timeout: false })

    const msigState: MsigActorState = result.current

    expect(msigState.errors.connectedWalletNotMsigSigner).toBeTruthy()
    unmount()
  }, 10000)
})
