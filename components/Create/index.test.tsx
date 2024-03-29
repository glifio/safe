import {
  render,
  act,
  waitFor,
  fireEvent,
  getByText,
  getByRole,
  getAllByRole,
  RenderResult
} from '@testing-library/react'
import { Context } from 'react'
import { FilecoinNumber, BigNumber } from '@glif/filecoin-number'
import { Message } from '@glif/filecoin-message'
import { WalletProviderContextType } from '@glif/react-components'

import {
  WalletProviderContext,
  PendingMsgContext
} from '../../__mocks__/@glif/react-components'
import composeMockAppTree from '../../test-utils/composeMockAppTree'
import { WALLET_ADDRESS } from '../../test-utils/constants'
import { Create } from '.'

const validAddress = 't1iuryu3ke2hewrcxp4ezhmr5cmfeq3wjhpxaucza'
const validAmount = new FilecoinNumber(0.01, 'fil')

jest.mock('@glif/filecoin-wallet-provider')

describe('Create', () => {
  test('it allows a user to create a safe', async () => {
    const { Tree, walletProvider } = composeMockAppTree('postOnboard')
    let result: RenderResult | null = null

    await act(async () => {
      result = render(
        <Tree>
          <Create
            walletProviderOpts={{
              context:
                WalletProviderContext as unknown as Context<WalletProviderContextType>
            }}
            pendingMsgContext={PendingMsgContext}
          />
        </Tree>
      )

      jest.runAllTimers()

      // Get HTML elements
      const header = getByRole(result.container, 'heading')
      const signer1 = getByRole(result.container, 'textbox')
      const addSigner = getByText(result.container, 'Add Signer')
      const approvals = getByRole(result.container, 'combobox')
      const [amount, vest] = getAllByRole(result.container, 'spinbutton')
      const cancel = getByText(result.container, 'Cancel')
      const review = getByText(result.container, 'Review')

      // Check initial state
      expect(header).toHaveTextContent('Create Safe')
      expect(signer1).toBeDisabled()
      expect(signer1).toHaveDisplayValue(WALLET_ADDRESS)
      expect(approvals).toHaveDisplayValue('1')
      expect(amount).toHaveFocus()
      expect(amount).toHaveDisplayValue('')
      expect(vest).toHaveDisplayValue('0')
      expect(cancel).toBeEnabled()
      expect(review).toBeDisabled()

      // Add a signer
      fireEvent.click(addSigner)
      jest.runAllTimers()

      // There should be a second signer and review should not be enabled yet
      const signer2 = getAllByRole(result.container, 'textbox')[1]
      expect(signer2).toBeEnabled()
      expect(signer2).toHaveDisplayValue('')
      expect(review).toBeDisabled()

      // Enter second signer address
      signer2.focus()
      fireEvent.change(signer2, { target: { value: validAddress } })
      signer2.blur()
      jest.runAllTimers()

      // Review should not be enabled yet
      expect(review).toBeDisabled()

      // Increment required approvals
      approvals.focus()
      fireEvent.change(approvals, { target: { value: '2' } })
      approvals.blur()
      jest.runAllTimers()

      // Review should not be enabled yet
      expect(review).toBeDisabled()

      // Enter amount
      amount.focus()
      fireEvent.change(amount, { target: { value: validAmount.toFil() } })
      amount.blur()
      jest.runAllTimers()

      // Review should now be enabled
      expect(review).toBeEnabled()

      // Click review
      fireEvent.click(review)
      jest.runAllTimers()

      // The total amount should show after getting the tx fee
      await waitFor(
        () => expect(getByText(result.container, 'Total')).toBeInTheDocument(),
        { timeout: 10000 }
      )

      // The tx fee info should now be shown
      const maxFeeRegex =
        /You will not pay more than [0-9.]+ FIL for this transaction/i
      expect(getByText(result.container, maxFeeRegex)).toBeInTheDocument()

      // The expert mode toggle should shown and be off
      const expertMode = getByRole(result.container, 'checkbox')
      expect(expertMode).toBeInTheDocument()
      expect(expertMode).not.toBeChecked()

      // The send button should now be available
      const send = getByText(result.container, 'Send')
      expect(send).toBeInTheDocument()
      expect(send).toBeEnabled()

      // Click send
      fireEvent.click(send)
      jest.runAllTimers()
    })

    // Check wallet provider calls
    expect(walletProvider.getNonce).toHaveBeenCalled()
    expect(walletProvider.wallet.sign).toHaveBeenCalled()
    expect(walletProvider.simulateMessage).toHaveBeenCalled()
    expect(walletProvider.sendMessage).toHaveBeenCalled()

    // Check if sent message was properly formatted
    const lotusMessage = walletProvider.wallet.sign.mock.calls[0][1]
    const message = Message.fromLotusType(lotusMessage)
    expect(message.from).toBe(WALLET_ADDRESS)
    expect(message.to).toBe('f01')
    expect(message.nonce).toBeGreaterThanOrEqual(0)
    expect(BigNumber.isBigNumber(message.value)).toBe(true)
    expect(message.value.isEqualTo(validAmount.toAttoFil())).toBe(true)
    expect(message.method).toBe(2)
    expect(typeof message.params).toBe('string')
    expect(message.params).toBeTruthy()
    expect(BigNumber.isBigNumber(message.gasPremium)).toBe(true)
    expect(message.gasPremium.isGreaterThan(0)).toBe(true)
    expect(BigNumber.isBigNumber(message.gasFeeCap)).toBe(true)
    expect(message.gasFeeCap.isGreaterThan(0)).toBe(true)
    expect(message.gasLimit).toBeGreaterThan(0)

    // Check snapshot
    expect(result.container.firstChild).toMatchSnapshot()
  })

  test('it renders the initial state correctly', async () => {
    const { Tree } = composeMockAppTree('postOnboard')
    let result: RenderResult | null = null

    await act(async () => {
      result = render(
        <Tree>
          <Create />
        </Tree>
      )
    })

    // Check snapshot
    expect(result.container.firstChild).toMatchSnapshot()
  })
})
