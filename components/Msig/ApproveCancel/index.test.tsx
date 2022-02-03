import { cleanup, render, screen, act, fireEvent } from '@testing-library/react'
import { Message } from '@glif/filecoin-message'

import ApproveCancel from '.'
import composeMockAppTree from '../../../test-utils/composeMockAppTree'
import { pushPendingMessageSpy } from '../../../__mocks__/@glif/react-components'
import { flushPromises, MULTISIG_ACTOR_ADDRESS } from '../../../test-utils'
import { MSIG_METHOD, PAGE } from '../../../constants'

jest.mock('@glif/filecoin-wallet-provider')
jest.mock('@glif/filecoin-rpc-client')
jest.mock('../../../MsigProvider')

const routerMock = jest.spyOn(require('next/router'), 'useRouter')

const next = async (buttonTxt: string = 'Next') => {
  await act(async () => {
    fireEvent.click(screen.getByText(buttonTxt))
    await flushPromises()
  })
}

const encodedProposalURI =
  '%7B%22id%22:2,%22to%22:%7B%22__typename%22:%22Address%22,%22id%22:%22t030429%22,%22robust%22:%22t2i43oi6rnf2s6rp544rcegfbcdp5l62cayz2btmy%22%7D,%22value%22:%22400000000000000000%22,%22method%22:0,%22params%22:null,%22approved%22:%5B%7B%22__typename%22:%22Address%22,%22id%22:%22t029519%22,%22robust%22:%22t13koa6kz5otquokcgwusvtsxcdymuq7lqe4twb4i%22%7D%5D,%22proposalHash%22:%22JyRolQNt12If0FMxrNMp0RmPUQ3pBrgsczCn9xdkt2w=%22,%22approvalsUntilExecution%22:1%7D'

describe('Approve/Cancel proposals', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })
  describe('Approve Proposal', () => {
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

      await act(async () => {
        render(
          <Tree>
            <ApproveCancel />
          </Tree>
        )
      })

      await next('Submit')

      expect(walletProvider.getNonce).toHaveBeenCalled()
      expect(walletProvider.wallet.sign).toHaveBeenCalled()
      const message = Message.fromLotusType(
        walletProvider.wallet.sign.mock.calls[0][1]
      ).toZondaxType()
      expect(Number(message.gaspremium) > 0).toBe(true)
      expect(typeof message.gaspremium).toBe('string')
      expect(Number(message.gasfeecap) > 0).toBe(true)
      expect(typeof message.gasfeecap).toBe('string')
      expect(message.gaslimit > 0).toBe(true)
      expect(typeof message.gaslimit).toBe('number')
      expect(!!message.value).toBe(true)
      expect(Number(message.value)).toBe(0)
      expect(message.to).toBe(MULTISIG_ACTOR_ADDRESS)

      const pendingMsg = pushPendingMessageSpy.mock.calls[0][0]
      expect(pendingMsg.to.robust).toBe(MULTISIG_ACTOR_ADDRESS)
      expect(pendingMsg.from.robust).toBeTruthy()
      expect(Number(pendingMsg.gasFeeCap) > 0).toBeTruthy()
      expect(Number(pendingMsg.gasLimit) > 0).toBeTruthy()
      expect(Number(pendingMsg.gasPremium) > 0).toBeTruthy()
      expect(!!pendingMsg.value).toBe(true)
      expect(Number(pendingMsg.value)).toBe(0)
      expect(Number(pendingMsg.method)).toBe(MSIG_METHOD.APPROVE)
    })
  })

  describe('Cancel Proposal', () => {
    test('it allows a user to reject a proposal', async () => {
      routerMock.mockImplementation(() => {
        return {
          query: { proposal: encodedProposalURI },
          pathname: PAGE.MSIG_CANCEL,
          push: jest.fn()
        }
      })
      const { Tree, walletProvider } = composeMockAppTree('postOnboard')

      await act(async () => {
        render(
          <Tree>
            <ApproveCancel />
          </Tree>
        )
      })

      await next('Submit')

      expect(walletProvider.getNonce).toHaveBeenCalled()
      expect(walletProvider.wallet.sign).toHaveBeenCalled()
      const message = Message.fromLotusType(
        walletProvider.wallet.sign.mock.calls[0][1]
      ).toZondaxType()
      expect(Number(message.gaspremium) > 0).toBe(true)
      expect(typeof message.gaspremium).toBe('string')
      expect(Number(message.gasfeecap) > 0).toBe(true)
      expect(typeof message.gasfeecap).toBe('string')
      expect(message.gaslimit > 0).toBe(true)
      expect(typeof message.gaslimit).toBe('number')
      expect(!!message.value).toBe(true)
      expect(Number(message.value)).toBe(0)
      expect(message.to).toBe(MULTISIG_ACTOR_ADDRESS)

      const pendingMsg = pushPendingMessageSpy.mock.calls[0][0]
      expect(pendingMsg.to.robust).toBe(MULTISIG_ACTOR_ADDRESS)
      expect(pendingMsg.from.robust).toBeTruthy()
      expect(Number(pendingMsg.gasFeeCap) > 0).toBeTruthy()
      expect(Number(pendingMsg.gasLimit) > 0).toBeTruthy()
      expect(Number(pendingMsg.gasPremium) > 0).toBeTruthy()
      expect(!!pendingMsg.value).toBe(true)
      expect(Number(pendingMsg.value)).toBe(0)
      expect(Number(pendingMsg.method)).toBe(MSIG_METHOD.CANCEL)
    })
  })
})
