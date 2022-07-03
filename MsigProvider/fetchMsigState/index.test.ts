jest.mock('@glif/filecoin-rpc-client')
import { convertAddrToPrefix } from '@glif/react-components'

import { fetchMsigState } from '.'
import {
  mockStateGetActorRes,
  mockStateReadStateSingleSignerRes,
  MULTISIG_ACTOR_ADDRESS,
  MULTISIG_SIGNER_ADDRESS,
  MULTISIG_SIGNER_ADDRESS_2,
  MULTISIG_SIGNER_ID,
  WALLET_ADDRESS,
  WALLET_ADDRESS_2,
  WALLET_ID,
  WALLET_ID_2
} from '../../test-utils/constants'

// this is not inside a react components
// so i figured mocking the apollo client like this was the easiest way, even with duplicate mocks
jest
  .spyOn(require('../../apolloClient'), 'createApolloClient')
  .mockImplementation(() => {
    return {
      query: ({ variables }) => {
        if (variables.address === WALLET_ADDRESS) {
          return Promise.resolve({
            data: {
              address: {
                id: WALLET_ID,
                robust: variables.address
              }
            }
          })
        } else if (variables.address === WALLET_ADDRESS_2) {
          return Promise.resolve({
            data: {
              address: {
                id: WALLET_ID_2,
                robust: variables.address
              }
            }
          })
        } else if (variables.address[1] === '0') {
          return Promise.resolve({
            data: {
              address: {
                id: variables.address,
                robust: ''
              }
            }
          })
        }

        return Promise.resolve({
          data: {
            address: {
              id: '',
              robust: variables.address
            }
          }
        })
      }
    }
  })

describe('fetchMsigState', () => {
  test('it returns an notMsigActor error if the actor is not a multisig', async () => {
    const mockActorCode = jest.fn(async () => ({
      Code: { '/': 'xxxyyyzz' }
    }))
    jest
      .spyOn(require('@glif/filecoin-rpc-client'), 'default')
      .mockImplementationOnce(() => {
        return {
          request: mockActorCode
        }
      })

    const { errors } = await fetchMsigState('f01', MULTISIG_SIGNER_ADDRESS)
    expect(errors.notMsigActor).toBe(true)
  }, 10000)

  test('it returns a connected wallet not signer error if the wallet isnt a signer on the multisig', async () => {
    jest
      .spyOn(require('@glif/filecoin-rpc-client'), 'default')
      .mockImplementationOnce(() => {
        return {
          request: (method) => {
            switch (method) {
              case 'StateReadState': {
                return mockStateReadStateSingleSignerRes
              }
              case 'StateGetActor': {
                return mockStateGetActorRes
              }
            }
          }
        }
      })

    const { errors } = await fetchMsigState(
      MULTISIG_ACTOR_ADDRESS,
      MULTISIG_SIGNER_ADDRESS_2
    )

    expect(errors.connectedWalletNotMsigSigner).toBe(true)
  }, 10000)

  test('it returns an actor not found error if the actor isnt found', async () => {
    jest
      .spyOn(require('@glif/filecoin-rpc-client'), 'default')
      .mockImplementationOnce(() => {
        return {
          request: () => {
            return Promise.reject(new Error('actor not found'))
          }
        }
      })

    const { errors } = await fetchMsigState(
      't012914328591053',
      MULTISIG_SIGNER_ADDRESS
    )

    expect(errors.actorNotFound).toBe(true)
  }, 10000)

  test('it returns the full multisig actor', async () => {
    jest
      .spyOn(require('@glif/filecoin-rpc-client'), 'default')
      .mockImplementationOnce(() => {
        return {
          request: (method) => {
            switch (method) {
              case 'StateReadState': {
                return mockStateReadStateSingleSignerRes
              }
              case 'StateGetActor': {
                return mockStateGetActorRes
              }
              case 'MsigGetAvailableBalance': {
                return '1'
              }
            }
          }
        }
      })

    const {
      Address,
      Balance,
      AvailableBalance,
      Signers,
      ActorCode,
      InitialBalance,
      NextTxnID,
      NumApprovalsThreshold,
      StartEpoch,
      UnlockDuration
    } = await fetchMsigState(MULTISIG_ACTOR_ADDRESS, MULTISIG_SIGNER_ADDRESS)

    expect(convertAddrToPrefix(Address)).toBe(
      convertAddrToPrefix(MULTISIG_ACTOR_ADDRESS)
    )
    expect(Balance.isGreaterThan(0)).toBe(true)
    expect(AvailableBalance.isGreaterThan(0)).toBe(true)
    expect(Signers.length).toBeGreaterThan(0)
    expect(convertAddrToPrefix(Signers[0].id)).toBe(
      convertAddrToPrefix(MULTISIG_SIGNER_ID)
    )
    expect(ActorCode.includes('multisig')).toBe(true)
    expect(InitialBalance.isGreaterThan(0)).toBe(true)
    expect(NumApprovalsThreshold).toBeGreaterThan(0)
    expect(StartEpoch).toBeGreaterThan(0)
    expect(UnlockDuration).not.toBeUndefined()
    expect(NextTxnID).not.toBeUndefined()
  }, 10000)
})
