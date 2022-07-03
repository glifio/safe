import {
  act,
  getByRole,
  getByText,
  render,
  RenderResult,
  screen
} from '@testing-library/react'
import {
  useMessageQuery,
  MessageReceipt,
  getAddrFromReceipt
} from '@glif/react-components'

import composeMockAppTree from '../../test-utils/composeMockAppTree'
import { CreateConfirm } from '.'
import { PAGE } from '../../constants'

const mockReceipt = {
  exitCode: 0,
  return: 'gkMA1xJVAvKriskdpguj4VPi+gQa9hMsYso8',
  gasUsed: 8555837
} as MessageReceipt

jest.mock('../../MsigProvider')
jest.mock('@glif/react-components', () => {
  const original = jest.requireActual('@glif/react-components')
  return {
    ...original,
    useMessageQuery: jest.fn(({ variables }) => ({
      data: {
        message: {
          cid: variables.cid,
          receipt: mockReceipt
        }
      }
    }))
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

    expect(useMessageQuery).toHaveBeenCalled()
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
      jest.runOnlyPendingTimers()
    })

    const header = getByRole(result.container, 'heading')
    expect(header).toHaveTextContent('Safe creation completed')
    expect(useMessageQuery).toHaveBeenCalled()
    const { robust } = getAddrFromReceipt(mockReceipt.return)
    expect(screen.getByText(robust)).toBeInTheDocument()
    expect(result.container.firstChild).toMatchSnapshot()
  })
})
