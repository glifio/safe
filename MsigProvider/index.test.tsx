import { FilecoinNumber } from '@glif/filecoin-number'
import { SWRConfig } from 'swr'
import { act, renderHook } from '@testing-library/react-hooks'
import { ReactNode } from 'react'
import {
  WalletProviderWrapper,
  initialState as _walletProviderInitialState
} from '@glif/react-components'

import { MULTISIG_ACTOR_ADDRESS } from '../test-utils/constants'
import { useMsig, MsigProviderWrapper } from '.'
import { MsigActorState } from './types'
import { EXEC_ACTOR } from '../constants'
import { composeWalletProviderState } from '../test-utils/composeMockAppTree/composeState'

describe('Multisig provider', () => {
  describe('Fetching state', () => {
    let Tree = ({ children }) => <>{children}</>
    beforeEach(() => {
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
                      InitialBalance: new FilecoinNumber(
                        '1',
                        'fil'
                      ).toAttoFil(),
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

      jest
        .spyOn(require('../utils/isAddressSigner'), 'isAddressSigner')
        .mockImplementation(() => true)

      const statePreset = 'postOnboard'
      const walletProviderInitialState = composeWalletProviderState(
        _walletProviderInitialState,
        statePreset
      )
      Tree = ({ children }: { children: ReactNode }) => (
        <SWRConfig value={{ dedupingInterval: 0 }}>
          <WalletProviderWrapper
            getState={() => {}}
            statePreset={statePreset}
            initialState={walletProviderInitialState}
          >
            <MsigProviderWrapper test>{children}</MsigProviderWrapper>
          </WalletProviderWrapper>
        </SWRConfig>
      )
    })

    test('useMsig hook exposes a method to set multisig address', () => {
      const { result } = renderHook(() => useMsig(), {
        wrapper: Tree
      })
      expect(result.current.setMsigActor).not.toBeUndefined()
    })

    test('setting the msig actor sets the state in context', async () => {
      const { result } = renderHook(() => useMsig(), {
        wrapper: Tree
      })

      await act(async () => {
        result.current.setMsigActor(MULTISIG_ACTOR_ADDRESS)
      })

      expect(result.current.Address).toBe(MULTISIG_ACTOR_ADDRESS)
    })

    test('setting the msig actor fetches the state from lotus and populates the context', async () => {
      const { result } = renderHook(() => useMsig(), {
        wrapper: Tree
      })

      await act(async () => {
        result.current.setMsigActor(MULTISIG_ACTOR_ADDRESS)
      })

      const msigState: MsigActorState = result.current
      expect(msigState.Address).toBe(MULTISIG_ACTOR_ADDRESS)
      expect(msigState.ActorCode.includes('multisig')).toBeTruthy()
      expect(msigState.AvailableBalance.gt(0)).toBeTruthy()
      expect(msigState.Balance.gt(0)).toBeTruthy()
      expect(msigState.NumApprovalsThreshold).toBeTruthy()
      expect(msigState.Signers.length).toBeGreaterThan(0)
    })
  })

  describe('Error handling', () => {
    // @ts-ignore
    let Tree = ({ children }) => <>{children}</>
    beforeEach(() => {
      const statePreset = 'postOnboard'
      const walletProviderInitialState = composeWalletProviderState(
        _walletProviderInitialState,
        statePreset
      )
      Tree = ({ children }: { children: ReactNode }) => (
        <SWRConfig value={{ dedupingInterval: 0 }}>
          <WalletProviderWrapper
            getState={() => {}}
            statePreset={statePreset}
            initialState={walletProviderInitialState}
          >
            <MsigProviderWrapper test>{children}</MsigProviderWrapper>
          </WalletProviderWrapper>
        </SWRConfig>
      )
    })

    test('if address is not a multisig actor address, the not multisig actor error should get thrown', async () => {
      jest
        .spyOn(require('@glif/filecoin-rpc-client'), 'default')
        .mockImplementation(() => {
          return {
            request: jest.fn(async () => {
              return {
                Balance: '0',
                Code: { '/': 'xyz' }
              }
            })
          }
        })

      const { result } = renderHook(() => useMsig(), {
        wrapper: Tree
      })

      await act(async () => {
        result.current.setMsigActor(EXEC_ACTOR)
      })

      const msigState: MsigActorState = result.current
      expect(msigState.errors.notMsigActor).toBeTruthy()
    })

    test('if address is not an actor, the actor not found error should get thrown', async () => {
      jest
        .spyOn(require('@glif/filecoin-rpc-client'), 'default')
        .mockImplementation(() => {
          return {
            request: jest.fn(async () => {
              throw new Error('actor not found')
            })
          }
        })

      const { result } = renderHook(() => useMsig(), {
        wrapper: Tree
      })

      await act(async () => {
        result.current.setMsigActor(
          'f3vob5jvvypwlb2sqz6oeztzbsf5c4hjtqxs2xb2mhaneyiu3wmyd4fkigmiv2rgsm4aztmgvxwuybiwusoxea'
        )
      })

      const msigState: MsigActorState = result.current
      expect(msigState.errors.actorNotFound).toBeTruthy()
    })
  })
})
