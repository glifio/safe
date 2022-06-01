import '@testing-library/jest-dom/extend-expect'
import {
  act,
  cleanup,
  getByRole,
  getByText,
  render,
  RenderResult
} from '@testing-library/react'

import composeMockAppTree from '../../test-utils/composeMockAppTree'
import { PAGE } from '../../constants'

import { CreateConfirm } from './CreateConfirm'

jest.mock('../../MsigProvider')
const mockMessageConfirmation = jest.fn(async () => true)
jest
  .spyOn(require('@glif/filecoin-message-confirmer'), 'default')
  .mockImplementation(mockMessageConfirmation)

const mockStateGetMessageReceipt = jest.fn(async () => ({
  ExitCode: 0,
  Return: 'gkQAyogBVQJnC6HX7N9krE3QzLET9tDO1XuUqw==',
  GasUsed: 8555837
}))
jest
  .spyOn(require('@glif/filecoin-rpc-client'), 'default')
  .mockImplementation(() => {
    return {
      request: mockStateGetMessageReceipt
    }
  })

jest.spyOn(require('next/router'), 'useRouter').mockImplementation(() => {
  return {
    query: { cid: 'QmZ' },
    pathname: PAGE.MSIG_CREATE_CONFIRM,
    push: jest.fn()
  }
})

describe('confirmation of newly created multisig', () => {
  afterEach(cleanup)
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('it renders message pending UI while the transaction is pending', async () => {
    const { Tree } = composeMockAppTree('pendingMsigCreate')
    let result: RenderResult | null = null

    await act(async () => {
      result = render(
        <Tree>
          <CreateConfirm />
        </Tree>
      )

      // we perform these tests inside act(), so we don't test things after they update
      const header = getByRole(result.container, 'heading')
      expect(header).toHaveTextContent('Safe creation in progress')
      expect(
        getByText(
          result.container,
          'Your new Safe address will show here once the transaction confirms.'
        )
      ).toBeInTheDocument()
      expect(result.container.firstChild).toMatchSnapshot()
    })
  })

  test('it attempts to confirm the pending msig create message', async () => {
    const { Tree } = composeMockAppTree('pendingMsigCreate')

    await act(async () => {
      render(
        <Tree>
          <CreateConfirm />
        </Tree>
      )
    })

    expect(mockMessageConfirmation).toHaveBeenCalled()
  })

  test('it displays the multisig address after the message is confirmed', async () => {
    const { Tree } = composeMockAppTree('pendingMsigCreate')
    let result: RenderResult | null = null

    await act(async () => {
      result = render(
        <Tree>
          <CreateConfirm />
        </Tree>
      )
    })

    const header = getByRole(result.container, 'heading')
    expect(header).toHaveTextContent('Safe creation completed')
    expect(mockMessageConfirmation).toHaveBeenCalled()
    expect(result.container.firstChild).toMatchSnapshot()
  })
})
