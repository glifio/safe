import { FilecoinNumber } from '@glif/filecoin-number'
import { Address, ADDRESS_PROPTYPE } from '@glif/react-components'
import { shape } from 'prop-types'

export interface MsigActorErrors {
  notMsigActor: boolean
  connectedWalletNotMsigSigner: boolean
  actorNotFound: boolean
  unhandledError: string
}

export interface Signer {
  id: string
  account: string
}

export const SIGNER_PROPTYPE = shape({ ...ADDRESS_PROPTYPE })

export interface MsigActorState {
  Address: string | null
  ActorCode: string
  Balance: FilecoinNumber
  AvailableBalance: FilecoinNumber
  InitialBalance: FilecoinNumber
  NextTxnID: number
  NumApprovalsThreshold: number
  StartEpoch: number
  UnlockDuration: number
  Signers: Address[]
  errors: MsigActorErrors
}

export const emptyMsigState: MsigActorState = {
  Address: null,
  ActorCode: '',
  Balance: new FilecoinNumber('0', 'fil'),
  AvailableBalance: new FilecoinNumber('0', 'fil'),
  Signers: [],
  InitialBalance: new FilecoinNumber('0', 'fil'),
  NextTxnID: 0,
  NumApprovalsThreshold: 0,
  StartEpoch: 0,
  UnlockDuration: 0,
  errors: {
    notMsigActor: false,
    connectedWalletNotMsigSigner: false,
    actorNotFound: true,
    unhandledError: ''
  }
}
