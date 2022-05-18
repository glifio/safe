import {
  cleanup,
  render,
  act,
  waitFor,
  fireEvent,
  getByText,
  getByRole,
  RenderResult
} from '@testing-library/react'
import { FilecoinNumber, BigNumber } from '@glif/filecoin-number'
import { Message } from '@glif/filecoin-message'

import { pushPendingMessageSpy } from '../../__mocks__/@glif/react-components'
import composeMockAppTree from '../../test-utils/composeMockAppTree'
import {
  flushPromises,
  WALLET_ADDRESS,
  MULTISIG_ACTOR_ADDRESS
} from '../../test-utils'
import { Withdraw } from './Withdraw'

const validAddress = 't1iuryu3ke2hewrcxp4ezhmr5cmfeq3wjhpxaucza'
const validAmount = new FilecoinNumber(0.01, 'fil')

jest.mock('@glif/filecoin-wallet-provider')

describe('Withdraw', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllTimers()
    cleanup()
  })

  test('it allows a user to withdraw filecoin', async () => {
    const { Tree, walletProvider } = composeMockAppTree('postOnboard')
    let result: RenderResult | null = null

    await act(async () => {
      result = render(
        <Tree>
          <Withdraw />
        </Tree>
      )

      // Get HTML elements
      const header = getByRole(result.container, 'heading')
      const recipient = getByRole(result.container, 'textbox')
      const amount = getByRole(result.container, 'spinbutton')
      const cancel = getByText(result.container, 'Cancel')
      const send = getByText(result.container, 'Send')

      // Check initial state
      expect(header).toHaveTextContent('Withdraw Filecoin')
      expect(recipient).toHaveFocus()
      expect(recipient).toHaveDisplayValue('')
      expect(amount).toHaveDisplayValue('')
      expect(cancel).toBeEnabled()
      expect(send).toBeDisabled()

      // Enter recipient
      fireEvent.change(recipient, { target: { value: validAddress } })
      recipient.blur()

      // Send should not be enabled yet
      await flushPromises()
      expect(send).toBeDisabled()

      // Enter amount
      amount.focus()
      fireEvent.change(amount, { target: { value: validAmount.toFil() } })
      amount.blur()

      // Send should enable after getting tx fee
      await flushPromises()
      await waitFor(() => expect(send).toBeEnabled())

      // Max fee and total should be shown
      const maxFeeRegex =
        /You will not pay more than [0-9.]+ FIL for this transaction/i
      expect(getByText(result.container, maxFeeRegex)).toBeInTheDocument()
      expect(getByText(result.container, 'Total')).toBeInTheDocument()

      // The expert mode toggle should shown and be off
      const expertMode = getByRole(result.container, 'checkbox')
      expect(expertMode).toBeInTheDocument()
      expect(expertMode).not.toBeChecked()

      // Click send
      fireEvent.click(send)
      await flushPromises()
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
    expect(message.to).toBe(MULTISIG_ACTOR_ADDRESS)
    expect(message.nonce).toBeGreaterThanOrEqual(0)
    expect(message.value).toBeInstanceOf(BigNumber)
    expect(message.value.isEqualTo(0)).toBe(true)
    expect(message.method).toBe(2)
    expect(typeof message.params).toBe('string')
    expect(message.params).toBeTruthy()
    expect(message.gasPremium).toBeInstanceOf(BigNumber)
    expect(message.gasPremium.isGreaterThan(0)).toBe(true)
    expect(message.gasFeeCap).toBeInstanceOf(BigNumber)
    expect(message.gasFeeCap.isGreaterThan(0)).toBe(true)
    expect(message.gasLimit).toBeGreaterThan(0)

    // Check if pending message was properly pushed
    const pendingMsg = pushPendingMessageSpy.mock.calls[0][0]
    expect(typeof pendingMsg.cid).toBe('string')
    expect(pendingMsg.cid).toBeTruthy()
    expect(pendingMsg.from.robust).toBe(WALLET_ADDRESS)
    expect(pendingMsg.to.robust).toBe(MULTISIG_ACTOR_ADDRESS)
    expect(pendingMsg.height).toBe('')
    expect(typeof pendingMsg.params).toBe('string')
    expect(pendingMsg.params).toBeTruthy()
    expect(Number(pendingMsg.nonce)).toBeGreaterThanOrEqual(0)
    expect(Number(pendingMsg.method)).toBe(2)
    expect(Number(pendingMsg.value)).toBe(0)
    expect(Number(pendingMsg.gasFeeCap)).toBeGreaterThan(0)
    expect(Number(pendingMsg.gasLimit)).toBeGreaterThan(0)
    expect(Number(pendingMsg.gasPremium)).toBeGreaterThan(0)

    // Check snapshot
    expect(result.container.firstChild).toMatchSnapshot()
  })

  describe('snapshots', () => {
    test('it renders the initial state correctly', async () => {
      const { Tree } = composeMockAppTree('postOnboard')
      let result: RenderResult | null = null

      await act(async () => {
        result = render(
          <Tree>
            <Withdraw />
          </Tree>
        )
      })

      // Check snapshot
      expect(result.container.firstChild).toMatchSnapshot()
    })

    test('it renders correctly after entering the recipient', async () => {
      const { Tree } = composeMockAppTree('postOnboard')
      let result: RenderResult | null = null

      await act(async () => {
        result = render(
          <Tree>
            <Withdraw />
          </Tree>
        )

        // Enter recipient
        const recipient = getByRole(result.container, 'textbox')
        fireEvent.change(recipient, { target: { value: validAddress } })
        recipient.blur()

        await flushPromises()
      })

      // Check snapshot
      expect(result.container.firstChild).toMatchSnapshot()
    })
  })
})
