import { FilecoinNumber } from '@glif/filecoin-number'
import { createPath } from '@glif/react-components'
import { TESTNET_PATH_CODE } from '../../constants'

import {
  setLoginOption,
  setError,
  resetLedgerState,
  resetState,
  walletList,
  updateBalance
} from '@glif/react-components'
import { mockWalletProviderInstance } from '../../__mocks__/@glif/filecoin-wallet-provider'
import { WALLET_ADDRESS_2, WALLET_ID_2 } from '../constants'

export const mockFetchDefaultWallet = jest.fn().mockImplementation(() => ({
  balance: new FilecoinNumber('1', 'fil'),
  robust: WALLET_ADDRESS_2,
  id: WALLET_ID_2,
  path: createPath(TESTNET_PATH_CODE, 0)
}))

export default (walletProviderDispatch, state) => ({
  fetchDefaultWallet: mockFetchDefaultWallet,
  walletList: jest
    .fn()
    .mockImplementation((wallets) =>
      walletProviderDispatch(walletList(wallets))
    ),
  setWalletError: jest
    .fn()
    .mockImplementation((errorMessage) =>
      walletProviderDispatch(setError(errorMessage))
    ),
  setLoginOption: jest
    .fn()
    .mockImplementation((loginOption) =>
      walletProviderDispatch(setLoginOption(loginOption))
    ),
  connectLedger: jest.fn().mockImplementation(() => mockWalletProviderInstance),
  connectMetaMask: jest.fn().mockImplementation(() => {
    walletProviderDispatch({ type: 'METAMASK_CONFIGURED_SUCCESS' })
    return mockWalletProviderInstance
  }),
  getProvider: jest.fn().mockImplementation(() => mockWalletProviderInstance),
  resetLedgerState: jest.fn().mockImplementation(() => {
    walletProviderDispatch(resetLedgerState())
  }),
  resetState: jest.fn().mockImplementation(() => {
    walletProviderDispatch(resetState())
  }),
  updateBalance: jest.fn().mockImplementation((balance, index) => {
    walletProviderDispatch(updateBalance(balance, index))
  }),
  walletError: jest.fn().mockImplementation(() => state.error),
  resetWalletError: jest.fn().mockImplementation(() => {})
})
