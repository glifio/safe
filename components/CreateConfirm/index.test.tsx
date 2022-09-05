import {
  act,
  getByRole,
  getByText,
  render,
  RenderResult,
  screen,
  waitFor
} from '@testing-library/react'
import { getAddrFromReceipt } from '@glif/react-components'

import composeMockAppTree from '../../test-utils/composeMockAppTree'
import { CreateConfirm } from '.'
import { PAGE } from '../../constants'
import { EXEC_MSG_CID, mockReceipt } from '../../test-utils/apolloMocks'
import { CoinType } from '@glif/filecoin-address'

jest.mock('../../MsigProvider')
jest.spyOn(require('next/router'), 'useRouter').mockImplementation(() => {
  return {
    query: { cid: EXEC_MSG_CID },
    pathname: PAGE.MSIG_CREATE_CONFIRM,
    push: jest.fn()
  }
})

describe('confirmation of newly created multisig', () => {
  test('it renders message pending UI while the transaction is pending', async () => {
    const { Tree } = composeMockAppTree('pendingMsigCreate')
    let result: RenderResult | null = null

    act(() => {
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

    await waitFor(() => {
      const header = getByRole(result.container, 'heading')
      expect(header).toHaveTextContent('Safe creation completed')
      const { robust } = getAddrFromReceipt(mockReceipt.return, CoinType.TEST)
      expect(screen.getByText(robust)).toBeInTheDocument()
      expect(result.container.firstChild).toMatchSnapshot()
    })
  })
})
