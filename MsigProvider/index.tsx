import {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
  Dispatch
} from 'react'
import { useWallet } from '@glif/react-components'
import { FilecoinNumber } from '@glif/filecoin-number'
import useSWR from 'swr'

import { fetchMsigState } from '../utils/fetchMsigState'
import { MsigActorState, emptyMsigState } from './types'

const MsigProviderContext = createContext<
  MsigActorState & {
    loading: boolean
    setMsigActor: null | Dispatch<string | null>
  }
>({
  ...emptyMsigState,
  loading: true,
  setMsigActor: null
})

export type MsigProviderContextType = MsigActorState & {
  setMsigActor: null | Dispatch<string | null>
  loading: boolean
}

export const MsigProviderWrapper = ({
  children
}: {
  children: ReactNode
  test: boolean
}) => {
  const wallet = useWallet()
  const [loading, setLoading] = useState<boolean>(false)
  const [msigActor, setMsigActor] = useState(null)
  const { data: actor, error: msigActorStateError } = useSWR(
    msigActor ? [msigActor, wallet.address] : null,
    fetchMsigState
  )

  // Set loading to true when changing the msigActor
  useEffect(() => msigActor && setLoading(true), [msigActor])

  // Set loading to false after fetching new data
  useEffect(() => actor && setLoading(false), [actor])

  return (
    <MsigProviderContext.Provider
      value={{
        Address: msigActor,
        ActorCode: actor?.ActorCode || '',
        Balance: actor?.Balance || new FilecoinNumber('0', 'fil'),
        AvailableBalance:
          actor?.AvailableBalance || new FilecoinNumber('0', 'fil'),
        Signers: actor?.Signers || [],
        NextTxnID: actor?.NextTxnID || 0,
        NumApprovalsThreshold: actor?.NumApprovalsThreshold || 0,
        InitialBalance: actor?.InitialBalance || new FilecoinNumber('0', 'fil'),
        UnlockDuration: actor?.UnlockDuration || 0,
        StartEpoch: actor?.StartEpoch || 0,
        errors: actor?.errors || {
          notMsigActor: false,
          connectedWalletNotMsigSigner: false,
          actorNotFound: false,
          unhandledError: msigActorStateError ? msigActorStateError : ''
        },
        loading,
        setMsigActor
      }}
    >
      {children}
    </MsigProviderContext.Provider>
  )
}

export const useMsig = () => useContext(MsigProviderContext)
