import { render, screen, act, fireEvent } from '@testing-library/react'

import UseChrome from '../../pages/error/use-chrome.jsx'
import composeMockAppTree from '../../test-utils/composeMockAppTree'

jest.mock('@glif/filecoin-wallet-provider')

describe('UseChrome', () => {
  test('it renders the error page', () => {
    const { Tree } = composeMockAppTree('postOnboard')
    const { container } = render(
      <Tree>
        <UseChrome />
      </Tree>
    )

    expect(container.firstChild).toMatchSnapshot()
  })

  test('it renders the message about getting Chrome', () => {
    const { Tree } = composeMockAppTree('postOnboard')

    render(
      <Tree>
        <UseChrome />
      </Tree>
    )

    expect(
      screen.getByText(
        'Please install Google Chrome to continue using your Ledger device, or choose an alternative setup option'
      )
    ).toBeInTheDocument()
  })

  test.skip('it renders the home page after clicking back', async () => {
    const { Tree } = composeMockAppTree('preOnboard')
    const useRouter = jest.spyOn(require('next/router'), 'useRouter')
    const mockRouterReplace = jest.fn(() => {})
    useRouter.mockImplementationOnce(() => ({
      query: 'network=t',
      replace: mockRouterReplace
    }))

    await act(async () => {
      render(
        <Tree>
          <UseChrome />
        </Tree>
      )
      fireEvent.click(screen.getByText('Back'))
    })

    expect(mockRouterReplace).toHaveBeenCalled()
    expect(mockRouterReplace).toHaveBeenCalledWith('/')
  })
})
