import {
  render,
  act,
  waitFor,
  fireEvent,
  getByText,
  getByRole,
  RenderResult
} from '@testing-library/react'
import { Context } from 'react'
import { BigNumber } from '@glif/filecoin-number'
import { Message } from '@glif/filecoin-message'
import {
  MsigMethod,
  truncateAddress,
  WalletProviderContextType
} from '@glif/react-components'

import {
  pushPendingMessageSpy,
  WalletProviderContext,
  PendingMsgContext
} from '../../__mocks__/@glif/react-components'
import composeMockAppTree from '../../test-utils/composeMockAppTree'
import {
  WALLET_ADDRESS,
  MULTISIG_ACTOR_ADDRESS,
  MULTISIG_SIGNER_ADDRESS_2
} from '../../test-utils/constants'
import { ChangeSigner } from '.'

const newAddress = 't1iuryu3ke2hewrcxp4ezhmr5cmfeq3wjhpxaucza'

jest.mock('@glif/filecoin-wallet-provider')

describe('ChangeSigner', () => {
  test('it allows a user to change a signer address', async () => {
    const { Tree, walletProvider } = composeMockAppTree('postOnboard')
    let result: RenderResult | null = null

    await act(async () => {
      result = render(
        <Tree>
          <ChangeSigner
            oldSignerAddress={MULTISIG_SIGNER_ADDRESS_2}
            walletProviderOpts={{
              context:
                WalletProviderContext as unknown as Context<WalletProviderContextType>
            }}
            pendingMsgContext={PendingMsgContext}
          />
        </Tree>
      )

      // Get HTML elements
      const header = getByRole(result.container, 'heading')
      const oldSigner = getByRole(result.container, 'combobox')
      const newSigner = getByRole(result.container, 'textbox')
      const cancel = getByText(result.container, 'Cancel')
      const review = getByText(result.container, 'Review')

      // Check initial state
      expect(header).toHaveTextContent('Change a signer')
      expect(oldSigner).toHaveDisplayValue(
        truncateAddress(MULTISIG_SIGNER_ADDRESS_2)
      )
      expect(newSigner).toHaveFocus()
      expect(newSigner).toHaveDisplayValue('')
      expect(cancel).toBeEnabled()
      expect(review).toBeDisabled()

      // Enter new address
      newSigner.focus()
      fireEvent.change(newSigner, { target: { value: newAddress } })
      newSigner.blur()
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
    expect(message.to).toBe(MULTISIG_ACTOR_ADDRESS)
    expect(message.nonce).toBeGreaterThanOrEqual(0)
    expect(BigNumber.isBigNumber(message.value)).toBe(true)
    expect(message.value.isEqualTo(0)).toBe(true)
    expect(message.method).toBe(MsigMethod.PROPOSE)
    expect(typeof message.params).toBe('string')
    expect(message.params).toBeTruthy()
    expect(BigNumber.isBigNumber(message.gasPremium)).toBe(true)
    expect(message.gasPremium.isGreaterThan(0)).toBe(true)
    expect(BigNumber.isBigNumber(message.gasFeeCap)).toBe(true)
    expect(message.gasFeeCap.isGreaterThan(0)).toBe(true)
    expect(message.gasLimit).toBeGreaterThan(0)

    // Check if pending message was properly pushed
    const pendingMsg = pushPendingMessageSpy.mock.calls[0][0]
    expect(typeof pendingMsg.cid).toBe('string')
    expect(pendingMsg.cid).toBeTruthy()
    expect(pendingMsg.from.robust).toBe(WALLET_ADDRESS)
    expect(pendingMsg.to.robust).toBe(MULTISIG_ACTOR_ADDRESS)
    expect(pendingMsg.height).toBe(0)
    expect(typeof pendingMsg.params).toBe('string')
    expect(pendingMsg.params).toBeTruthy()
    expect(Number(pendingMsg.nonce)).toBeGreaterThanOrEqual(0)
    expect(Number(pendingMsg.method)).toBe(MsigMethod.PROPOSE)
    expect(Number(pendingMsg.value)).toBe(0)
    expect(Number(pendingMsg.gasFeeCap)).toBeGreaterThan(0)
    expect(Number(pendingMsg.gasLimit)).toBeGreaterThan(0)
    expect(Number(pendingMsg.gasPremium)).toBeGreaterThan(0)

    // Check snapshot
    expect(result.container.firstChild).toMatchSnapshot()
  })

  test('it renders the initial state correctly', async () => {
    const { Tree } = composeMockAppTree('postOnboard')
    let result: RenderResult | null = null

    await act(async () => {
      result = render(
        <Tree>
          <ChangeSigner oldSignerAddress={MULTISIG_SIGNER_ADDRESS_2} />
        </Tree>
      )
    })

    // Check snapshot
    expect(result.container.firstChild).toMatchSnapshot()
  })
})
