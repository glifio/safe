import { FilecoinNumber } from '@glif/filecoin-number'
import LotusRPCEngine from '@glif/filecoin-rpc-client'
import { CID } from '@glif/filecoin-wallet-provider'
import { QueryLazyOptions, LazyQueryResult } from '@apollo/client'
import { AddressQuery, Exact } from '@glif/react-components'

import isAddressSigner from './isAddressSigner'
import { decodeActorCID } from '../actorCode'
import { MsigActorState, emptyMsigState } from '../../MsigProvider/types'

export default async function fetchMsigState(
  actorID: string,
  signerAddress: string,
  getAddress: (
    options?: QueryLazyOptions<
      Exact<{
        address: string
      }>
    >
  ) => Promise<
    LazyQueryResult<
      AddressQuery,
      Exact<{
        address: string
      }>
    >
  >
): Promise<MsigActorState> {
  try {
    const lCli = new LotusRPCEngine({
      apiAddress: process.env.NEXT_PUBLIC_LOTUS_NODE_JSONRPC
    })

    const { Code } = await lCli.request<{ Code: CID }>(
      'StateGetActor',
      actorID,
      null
    )

    const ActorCode = decodeActorCID(Code['/'])

    if (!ActorCode?.includes('multisig')) {
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
        State?.Signers.map(async (s) => {
          const { data, error, loading } = await getAddress({
            variables: { address: s }
          })

          if (!error && !loading && !!data?.address) {
            return data.address
          }

          return { id: s, robust: '' }
        })
      )
    ])

    if (!(await isAddressSigner(signerAddress, signers))) {
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
  }
}
