import '@testing-library/jest-dom/extend-expect'
import { FilecoinNumber } from '@glif/filecoin-number'
import { SWRConfig } from 'swr'
import { act, renderHook } from '@testing-library/react-hooks'
import { cleanup } from '@testing-library/react'
import { ReactNode } from 'react'
import WalletProviderWrapper, {
  initialState as _walletProviderInitialState
} from '@glif/wallet-provider-react'

import { MULTISIG_ACTOR_ADDRESS } from '../test-utils/constants'
import { useMsig, MsigProviderWrapper } from '.'
import { MsigActorState } from './types'
import { EXEC_ACTOR } from '../constants'
import { composeWalletProviderState } from '../test-utils/composeMockAppTree/composeState'

describe('Multisig provider', () => {
  describe('Fetching state', () => {
    afterEach(cleanup)
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
      const { result, unmount } = renderHook(() => useMsig(), {
        wrapper: Tree
      })
      expect(result.current.setMsigActor).not.toBeUndefined()
      unmount()
    })

    test('setting the msig actor sets the state in context', async () => {
      const { result, unmount } = renderHook(() => useMsig(), {
        wrapper: Tree
      })
      act(() => {
        result.current.setMsigActor(MULTISIG_ACTOR_ADDRESS)
      })
      expect(result.current.Address).toBe(MULTISIG_ACTOR_ADDRESS)
      unmount()
    })

    test('setting the msig actor fetches the state from lotus and populates the context', async () => {
      jest
        .spyOn(require('../utils/msig/isAddressSigner'), 'default')
        .mockImplementation(async () => true)

      let { waitForNextUpdate, result, unmount } = renderHook(() => useMsig(), {
        wrapper: Tree
      })
      act(() => {
        result.current.setMsigActor(MULTISIG_ACTOR_ADDRESS)
      })
      await waitForNextUpdate({ timeout: false })

      const msigState: MsigActorState = result.current

      expect(msigState.Address).toBe(MULTISIG_ACTOR_ADDRESS)
      expect(msigState.ActorCode.includes('multisig')).toBeTruthy()
      expect(msigState.AvailableBalance.gt(0)).toBeTruthy()
      expect(msigState.Balance.gt(0)).toBeTruthy()
      expect(msigState.NumApprovalsThreshold).toBeTruthy()
      expect(msigState.Signers.length).toBeGreaterThan(0)
      unmount()
    }, 10000)
  })

  describe('Error handling', () => {
    afterEach(cleanup)
    // @ts-ignore
    let Tree = ({ children }) => <>{children}</>
    beforeEach(() => {
      jest.clearAllMocks()

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
      let { waitForNextUpdate, result, unmount } = renderHook(() => useMsig(), {
        wrapper: Tree
      })
      act(() => {
        result.current.setMsigActor(EXEC_ACTOR)
      })
      await waitForNextUpdate()

      const msigState: MsigActorState = result.current
      expect(msigState.errors.notMsigActor).toBeTruthy()
      unmount()
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
      let { waitForNextUpdate, result, unmount } = renderHook(() => useMsig(), {
        wrapper: Tree
      })
      act(() => {
        result.current.setMsigActor(
          'f3vob5jvvypwlb2sqz6oeztzbsf5c4hjtqxs2xb2mhaneyiu3wmyd4fkigmiv2rgsm4aztmgvxwuybiwusoxea'
        )
      })
      await waitForNextUpdate()

      const msigState: MsigActorState = result.current

      expect(msigState.errors.actorNotFound).toBeTruthy()
      unmount()
    })
  })
})
