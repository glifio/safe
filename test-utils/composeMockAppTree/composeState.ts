import { FilecoinNumber } from '@glif/filecoin-number'
import { createPath, WalletProviderState } from '@glif/react-components'

import { IMPORT_MNEMONIC, IMPORT_SINGLE_KEY } from '../../constants'
import { mockWalletProviderInstance } from '../../__mocks__/@glif/filecoin-wallet-provider'
import { emptyMsigState } from '../../MsigProvider/types'
import {
  WALLET_ADDRESS,
  MULTISIG_ACTOR_ADDRESS,
  signers,
  WALLET_ID,
  WALLET_ADDRESS_2,
  WALLET_ID_2
} from '../constants'

export type Preset =
  | 'preOnboard'
  | 'postOnboard'
  | 'postOnboardLowBal'
  | 'postOnboardWithError'
  | 'selectedOtherWallet'
  | 'pendingMsigCreate'

export const composeWalletProviderState = (
  initialWalletProviderState: WalletProviderState,
  preset: Preset
) => {
  switch (preset) {
    case 'pendingMsigCreate':
    case 'postOnboard': {
      return Object.freeze({
        ...initialWalletProviderState,
        walletType: IMPORT_MNEMONIC,
        walletProvider: mockWalletProviderInstance,
        wallets: [
          {
            robust: WALLET_ADDRESS,
            id: WALLET_ID,
            balance: new FilecoinNumber('1', 'fil'),
            path: createPath(1, 0)
          }
        ],
        selectedWalletIdx: 0,
        loginOption: IMPORT_SINGLE_KEY
      })
    }
    case 'postOnboardLowBal': {
      return Object.freeze({
        ...initialWalletProviderState,
        walletType: IMPORT_MNEMONIC,
        walletProvider: mockWalletProviderInstance,
        wallets: [
          {
            robust: WALLET_ADDRESS,
            id: WALLET_ID,
            balance: new FilecoinNumber('.000001', 'fil'),
            path: createPath(1, 0)
          }
        ],
        selectedWalletIdx: 0,
        loginOption: IMPORT_SINGLE_KEY
      })
    }
    case 'postOnboardWithError': {
      return Object.freeze({
        ...initialWalletProviderState,
        walletProvider: mockWalletProviderInstance,
        wallets: [
          {
            robust: WALLET_ADDRESS,
            id: WALLET_ID,
            balance: new FilecoinNumber('1', 'fil'),
            path: createPath(1, 0)
          }
        ],
        selectedWalletIdx: 0,
        loginOption: IMPORT_SINGLE_KEY
      })
    }
    case 'selectedOtherWallet': {
      return Object.freeze({
        ...initialWalletProviderState,
        walletProvider: mockWalletProviderInstance,
        wallets: [
          {
            robust: WALLET_ADDRESS,
            id: WALLET_ID,
            balance: new FilecoinNumber('1', 'fil'),
            path: createPath(1, 0)
          },
          {
            robust: WALLET_ADDRESS_2,
            id: WALLET_ID_2,
            balance: new FilecoinNumber('5', 'fil'),
            path: createPath(1, 1)
          }
        ],
        selectedWalletIdx: 1,
        loginOption: IMPORT_MNEMONIC
      })
    }
    default:
      return initialWalletProviderState
  }
}

export const mockMsigProviderContext = {
  Address: MULTISIG_ACTOR_ADDRESS,
  ActorCode: 'fil/5/multisig',
  Balance: new FilecoinNumber('1', 'fil'),
  AvailableBalance: new FilecoinNumber('1', 'fil'),
  Signers: signers,
  InitialBalance: new FilecoinNumber('1', 'fil'),
  NextTxnID: 0,
  NumApprovalsThreshold: 2,
  StartEpoch: 0,
  UnlockDuration: 0,
  errors: {
    notMsigActor: false,
    connectedWalletNotMsigSigner: false,
    actorNotFound: false,
    unhandledError: ''
  },
  loading: false,
  setMsigActor: null
}

export const composeMsigProviderState = (preset: Preset) => {
  switch (preset) {
    case 'preOnboard': {
      return Object.freeze(emptyMsigState)
    }
    case 'pendingMsigCreate': {
      return Object.freeze(emptyMsigState)
    }
    default: {
      return Object.freeze(mockMsigProviderContext)
    }
  }
}
