import { Dispatch, SetStateAction } from 'react'
import { FilecoinNumber } from '@glif/filecoin-number'
import LotusRPCEngine from '@glif/filecoin-rpc-client'
import { CID } from '@glif/filecoin-wallet-provider'
import {
  AddressDocument,
  AddressQuery,
  decodeActorCID,
  isAddressSigner
} from '@glif/react-components'
import type { ApolloClient } from '@apollo/client'

import { MsigActorState, emptyMsigState } from '../../MsigProvider/types'
import { createApolloClient } from '../../apolloClient'

export const fetchMsigState = async (
  actorID: string,
  signerAddress: string,
  // we give this a default value for tests
  apolloClient: ApolloClient<object> = createApolloClient(),
  setLoading: Dispatch<SetStateAction<boolean>>
): Promise<MsigActorState> => {
  try {
    setLoading(true)
    const lCli = new LotusRPCEngine({
      apiAddress: process.env.NEXT_PUBLIC_LOTUS_NODE_JSONRPC
    })

    const { Code } = await lCli.request<{ Code: CID }>(
      'StateGetActor',
      actorID,
      null
    )

    let ActorCode = ''
    try {
      ActorCode = decodeActorCID(Code['/'])
      if (!ActorCode?.includes('multisig')) throw new Error('Not an Msig actor')
    } catch (e) {
      return {
        ...emptyMsigState,
        errors: {
          notMsigActor: true,
          connectedWalletNotMsigSigner: false,
          actorNotFound: false,
          unhandledError: ''
        }
      }
    }

    const { Balance, State } = await lCli.request<{
      Balance: FilecoinNumber
      State: {
        InitialBalance: string
        NextTxnID: number
        NumApprovalsThreshold: number
        Signers: string[]
        StartEpoch: number
        UnlockDuration: number
      }
    }>('StateReadState', actorID, null)
    const [availableBalance, signers] = await Promise.all([
      lCli.request<string>('MsigGetAvailableBalance', actorID, null),
      Promise.all(
        State?.Signers.map(async (signer) => {
          try {
            const { data } = await apolloClient.query<AddressQuery>({
              query: AddressDocument,
              variables: {
                address: signer
              }
            })
            if (!data.address) throw new Error('Missing address')
            return data.address
          } catch (e) {
            return { id: signer, robust: '' }
          }
        })
      )
    ])

    const { data } = await apolloClient.query<AddressQuery>({
      query: AddressDocument,
      variables: {
        address: signerAddress
      }
    })

    if (
      !isAddressSigner(
        // here we always return the signerAddr as the robust addr in case it doesnt come back from the server for whatever reason
        { id: data?.address?.id, robust: signerAddress },
        signers
      )
    ) {
      return {
        ...emptyMsigState,
        errors: {
          notMsigActor: false,
          connectedWalletNotMsigSigner: true,
          actorNotFound: false,
          unhandledError: ''
        }
      }
    }

    return {
      Address: actorID,
      Balance: new FilecoinNumber(Balance, 'attofil'),
      AvailableBalance: new FilecoinNumber(availableBalance, 'attofil'),
      Signers: signers,
      ActorCode,
      InitialBalance: new FilecoinNumber(State.InitialBalance, 'attofil'),
      NextTxnID: State.NextTxnID,
      NumApprovalsThreshold: State.NumApprovalsThreshold,
      StartEpoch: State.StartEpoch,
      UnlockDuration: State.UnlockDuration,
      errors: {
        notMsigActor: false,
        connectedWalletNotMsigSigner: false,
        actorNotFound: false,
        unhandledError: ''
      }
    }
  } catch (err) {
    if (err?.message?.includes('actor not found')) {
      return {
        ...emptyMsigState,
        errors: {
          notMsigActor: false,
          connectedWalletNotMsigSigner: false,
          actorNotFound: true,
          unhandledError: ''
        }
      }
    }

    if (err?.message?.includes('unknown actor code')) {
      return {
        ...emptyMsigState,
        errors: {
          notMsigActor: true,
          connectedWalletNotMsigSigner: false,
          actorNotFound: false,
          unhandledError: ''
        }
      }
    }

    return {
      ...emptyMsigState,
      errors: {
        notMsigActor: false,
        connectedWalletNotMsigSigner: false,
        actorNotFound: false,
        unhandledError: err?.message || err
      }
    }
  } finally {
    setLoading(false)
  }
}
