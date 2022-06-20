jest.mock('@glif/filecoin-rpc-client')
import { FilecoinNumber } from '@glif/filecoin-number'
import { convertAddrToPrefix } from '@glif/react-components'

import { fetchMsigState } from '.'
import { LotusMsigActorState } from '../../MsigProvider/types'

import {
  MULTISIG_ACTOR_ADDRESS,
  MULTISIG_SIGNER_ADDRESS,
  MULTISIG_SIGNER_ADDRESS_2
} from '../../test-utils'

jest
  .spyOn(require('../../apolloClient'), 'createApolloClient')
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

describe('fetchMsigState', () => {
  test('it returns an notMsigActor error if the actor is not a multisig', async () => {
    const mockActorCode = jest.fn(async () => ({
      Code: { '/': 'xxxyyyzz' },
      State: {}
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
                return {
                  Balance: '0',
                  State: {
                    Signers: ['f010114']
                  }
                }
              }
              case 'StateGetActor': {
                return { Code: { '/': 'bafkqadtgnfwc6nzpnv2wy5djonuwo' } }
              }
            }
          }
        }
      })

    const { errors } = await fetchMsigState(
      MULTISIG_ACTOR_ADDRESS,
      MULTISIG_SIGNER_ADDRESS
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
                return {
                  Code: {
                    '/': 'bafk2bzacec66wmb4kohuzvuxsulhcgiwju7sqkldwfpmmgw7dbbwgm5l2574q'
                  },
                  Balance: new FilecoinNumber('1', 'fil'),
                  State: {
                    Signers: [MULTISIG_SIGNER_ADDRESS_2],
                    InitialBalance: '10000',
                    NextTxnID: 1,
                    NumApprovalsThreshold: 1,
                    StartEpoch: 1,
                    UnlockDuration: 1,
                    PendingTxns: { '/': 'bafkafhduos' }
                  } as LotusMsigActorState
                }
              }
              case 'StateGetActor': {
                return { Code: { '/': 'bafkqadtgnfwc6nzpnv2wy5djonuwo' } }
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
    } = await fetchMsigState(MULTISIG_ACTOR_ADDRESS, MULTISIG_SIGNER_ADDRESS_2)

    expect(convertAddrToPrefix(Address)).toBe(
      convertAddrToPrefix(MULTISIG_ACTOR_ADDRESS)
    )
    expect(Balance.isGreaterThan(0)).toBe(true)
    expect(AvailableBalance.isGreaterThan(0)).toBe(true)
    expect(Signers.length).toBeGreaterThan(0)
    expect(convertAddrToPrefix(Signers[0].robust)).toBe(
      convertAddrToPrefix(MULTISIG_SIGNER_ADDRESS_2)
    )
    expect(ActorCode.includes('bafk')).toBe(true)
    expect(InitialBalance.isGreaterThan(0)).toBe(true)
    expect(NumApprovalsThreshold).toBeGreaterThan(0)
    expect(StartEpoch).toBeGreaterThan(0)
    expect(UnlockDuration).not.toBeUndefined()
    expect(NextTxnID).not.toBeUndefined()
  }, 10000)
})
