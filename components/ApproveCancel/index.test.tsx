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
import { MsigMethod, WalletProviderContextType } from '@glif/react-components'

import {
  pushPendingMessageSpy,
  WalletProviderContext,
  PendingMsgContext
} from '../../__mocks__/@glif/react-components'
import composeMockAppTree from '../../test-utils/composeMockAppTree'
import {
  WALLET_ADDRESS,
  MULTISIG_ACTOR_ADDRESS
} from '../../test-utils/constants'
import { ApproveCancel } from '.'
import { PAGE } from '../../constants'

jest.mock('@glif/filecoin-wallet-provider')

const routerMock = jest.spyOn(require('next/router'), 'useRouter')
const encodedProposalURI =
  '%7B%22id%22:2,%22to%22:%7B%22id%22:%22t030429%22,%22robust%22:%22t2i43oi6rnf2s6rp544rcegfbcdp5l62cayz2btmy%22%7D,%22value%22:%22400000000000000000%22,%22method%22:0,%22params%22:null,%22approved%22:%5B%7B%22id%22:%22t029519%22,%22robust%22:%22t13koa6kz5otquokcgwusvtsxcdymuq7lqe4twb4i%22%7D%5D,%22proposalHash%22:%22JyRolQNt12If0FMxrNMp0RmPUQ3pBrgsczCn9xdkt2w=%22%7D'

describe('ApproveCancel', () => {
  test('it allows a user to approve a proposal', async () => {
    // moving this outside each individual test breaks the mocks
    // in the future, approve / cancel could just go in separate test files...
    routerMock.mockImplementation(() => {
      return {
        query: { proposal: encodedProposalURI },
        pathname: PAGE.MSIG_APPROVE,
        push: jest.fn()
      }
    })
    const { Tree, walletProvider } = composeMockAppTree('postOnboard')
    let result: RenderResult | null = null

    await act(async () => {
      result = render(
        <Tree>
          <ApproveCancel
            method={MsigMethod.APPROVE}
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
      const cancel = getByText(result.container, 'Cancel')
      const review = getByText(result.container, 'Review')

      // Wait for the message information to load
      await waitFor(
        () =>
          expect(
            getByText(result.container, 'Proposal ID')
          ).toBeInTheDocument(),
        { timeout: 10000 }
      )

      // Check initial state
      expect(header).toHaveTextContent('Approve Safe Proposal')
      expect(cancel).toBeEnabled()
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
      const send = getByText(
        result.container,
        (content, node) =>
          content === 'Send' && node.getAttribute('type') === 'submit'
      )
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
    expect(message.method).toBe(MsigMethod.APPROVE)
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
    expect(pendingMsg.height).toBe('')
    expect(typeof pendingMsg.params).toBe('string')
    expect(pendingMsg.params).toBeTruthy()
    expect(Number(pendingMsg.nonce)).toBeGreaterThanOrEqual(0)
    expect(Number(pendingMsg.method)).toBe(MsigMethod.APPROVE)
    expect(Number(pendingMsg.value)).toBe(0)
    expect(Number(pendingMsg.gasFeeCap)).toBeGreaterThan(0)
    expect(Number(pendingMsg.gasLimit)).toBeGreaterThan(0)
    expect(Number(pendingMsg.gasPremium)).toBeGreaterThan(0)

    // Check snapshot
    expect(result.container.firstChild).toMatchSnapshot()
  })

  test('it allows a user to cancel a proposal', async () => {
    // moving this outside each individual test breaks the mocks
    // in the future, approve / cancel could just go in separate test files...
    routerMock.mockImplementation(() => {
      return {
        query: { proposal: encodedProposalURI },
        pathname: PAGE.MSIG_CANCEL,
        push: jest.fn()
      }
    })
    const { Tree, walletProvider } = composeMockAppTree('postOnboard')
    let result: RenderResult | null = null

    await act(async () => {
      result = render(
        <Tree>
          <ApproveCancel
            method={MsigMethod.CANCEL}
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
      const cancel = getByText(result.container, 'Cancel')
      const review = getByText(result.container, 'Review')

      // Wait for the message information to load
      await waitFor(
        () =>
          expect(
            getByText(result.container, 'Proposal ID')
          ).toBeInTheDocument(),
        { timeout: 10000 }
      )

      // Check initial state
      expect(header).toHaveTextContent('Cancel Safe Proposal')
      expect(cancel).toBeEnabled()
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
      const send = getByText(
        result.container,
        (content, node) =>
          content === 'Send' && node.getAttribute('type') === 'submit'
      )
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
    expect(message.method).toBe(MsigMethod.CANCEL)
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
    expect(pendingMsg.height).toBe('')
    expect(typeof pendingMsg.params).toBe('string')
    expect(pendingMsg.params).toBeTruthy()
    expect(Number(pendingMsg.nonce)).toBeGreaterThanOrEqual(0)
    expect(Number(pendingMsg.method)).toBe(MsigMethod.CANCEL)
    expect(Number(pendingMsg.value)).toBe(0)
    expect(Number(pendingMsg.gasFeeCap)).toBeGreaterThan(0)
    expect(Number(pendingMsg.gasLimit)).toBeGreaterThan(0)
    expect(Number(pendingMsg.gasPremium)).toBeGreaterThan(0)

    // Check snapshot
    expect(result.container.firstChild).toMatchSnapshot()
  })

  test('it renders the initial approve state correctly', async () => {
    const { Tree } = composeMockAppTree('postOnboard')
    let result: RenderResult | null = null

    await act(async () => {
      result = render(
        <Tree>
          <ApproveCancel method={MsigMethod.APPROVE} />
        </Tree>
      )
    })

    // Check snapshot
    expect(result.container.firstChild).toMatchSnapshot()
  })

  test('it renders the initial cancel state correctly', async () => {
    const { Tree } = composeMockAppTree('postOnboard')
    let result: RenderResult | null = null

    await act(async () => {
      result = render(
        <Tree>
          <ApproveCancel method={MsigMethod.CANCEL} />
        </Tree>
      )
    })

    // Check snapshot
    expect(result.container.firstChild).toMatchSnapshot()
  })
})
