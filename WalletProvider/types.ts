import { LedgerActionType } from '../utils/ledger/ledgerStateManagement'
import { initialState } from './state'

export type WalletActionType =
  | 'SET_WALLET_TYPE'
  | 'CREATE_WALLET_PROVIDER'
  | 'WALLET_ERROR'
  | 'CLEAR_ERROR'
  | 'RESET_STATE'

export type WalletProviderActionType = WalletActionType | LedgerActionType

export interface WalletProviderAction {
  type: WalletProviderActionType
  payload?: any
  error?: any
}

export type WalletProviderState = typeof initialState
