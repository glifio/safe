import { render, screen, act, fireEvent } from '@testing-library/react'
import composeMockAppTree from '../../../test-utils/composeMockAppTree'

import Home from '.'
import { PAGE } from '../../../constants'

const routerPushMock = jest.fn()
jest.spyOn(require('next/router'), 'useRouter').mockImplementation(() => {
  return {
    query: { network: 't' },
    pathname: PAGE.MSIG_HOME,
    push: routerPushMock
  }
})

jest.mock('../../../MsigProvider')

describe('Msig Home', () => {

  test('it renders the vesting balance, available balance, and msig address', async () => {
    const { Tree } = composeMockAppTree('postOnboard')

    // const container =
    render(
      <Tree>
        <Home />
      </Tree>
    )

    expect(screen.getByText('Available Balance')).toBeInTheDocument()
    expect(screen.getByText('Total Vesting')).toBeInTheDocument()

    // snapshot on this test is oddly broken until https://github.com/styled-components/jest-styled-components/issues/399 is resolved
    // expect(container).toMatchSnapshot()
  })

  test('clicking withdraw sends the user to the withdraw page', async () => {
    const { Tree } = composeMockAppTree('postOnboard')

    act(() => {
      render(
        <Tree>
          <Home />
        </Tree>
      )

      fireEvent.click(screen.getByText('Withdraw'))
    })

    expect(routerPushMock).toHaveBeenCalledWith(PAGE.MSIG_WITHDRAW)
  })
})
