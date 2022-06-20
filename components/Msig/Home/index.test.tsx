import { act, getByText, render, RenderResult } from '@testing-library/react'
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
    let result: RenderResult | null = null

    await act(async () => {
      result = render(
        <Tree>
          <Home />
        </Tree>
      )
    })

    // Check snapshot
    expect(getByText(result.container, 'Available Balance')).toBeInTheDocument()
    expect(getByText(result.container, 'Total Vesting')).toBeInTheDocument()
    expect(result.container.firstChild).toMatchSnapshot()
  })
})
