import { render, screen } from '@testing-library/react'

import UseChrome from '../../pages/error/use-chrome.jsx'
import composeMockAppTree from '../../test-utils/composeMockAppTree'

jest.mock('@glif/filecoin-wallet-provider')

describe('UseChrome', () => {
  test('it renders the error page', () => {
    const { container } = render(<UseChrome />)

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
})
