import { truncateAddress } from '@glif/react-components'
import { render, screen, act, fireEvent } from '@testing-library/react'
import {
  MULTISIG_SIGNER_ID_2,
  WALLET_ADDRESS,
  WALLET_ID_2
} from '../../test-utils/constants'
import composeMockAppTree from '../../test-utils/composeMockAppTree'
import { PAGE } from '../../constants'
import Admin from '.'

const routerPushMock = jest.fn()
jest.spyOn(require('next/router'), 'useRouter').mockImplementation(() => {
  return {
    query: {},
    pathname: PAGE.MSIG_ADMIN,
    push: routerPushMock
  }
})

describe('Admin page', () => {
  test('it renders the required approvals and the signers', () => {
    const { Tree } = composeMockAppTree('postOnboard')

    render(
      <Tree>
        <Admin />
      </Tree>
    )

    expect(screen.getByText(/Required Approvals/)).toBeInTheDocument()
    expect(screen.getByText(/Your Address/)).toBeInTheDocument()
    expect(screen.getByText(/Additional Signers/)).toBeInTheDocument()
    // signers - "t1z225tguggx4onbauimqvxzutopzdr2m4s6z6wgi" and f1nq5k2mps5umtebdovlyo7y6a3ywc7u4tobtuo3a from msig provider mocks
    // since the self signer is also listed in the top corner, it should appear twice
    expect(
      screen.getAllByText(truncateAddress(WALLET_ADDRESS)).length === 1
    ).toBeTruthy()
    expect(screen.getByText(WALLET_ID_2)).toBeInTheDocument()

    // snapshot on this test is oddly broken until https://github.com/styled-components/jest-styled-components/issues/399 is resolved
    // expect(container).toMatchSnapshot()
  })

  test('it renders a link to the add signer page', () => {
    const { Tree } = composeMockAppTree('postOnboard')

    act(() => {
      render(
        <Tree>
          <Admin />
        </Tree>
      )
      expect(screen.getByText('Add Signer').closest('a')).toHaveAttribute(
        'href',
        PAGE.MSIG_ADD_SIGNER
      )
    })
  })

  test('it renders a link to the edit req num approvals page', () => {
    const { Tree } = composeMockAppTree('postOnboard')

    act(() => {
      render(
        <Tree>
          <Admin />
        </Tree>
      )
      expect(screen.getByText('Edit').closest('a')).toHaveAttribute(
        'href',
        PAGE.MSIG_CHANGE_APPROVALS
      )
    })
  })

  test('it sends you to the change signer page with the right query params when the user clicks the edit signer button', () => {
    const { Tree } = composeMockAppTree('postOnboard')

    act(() => {
      render(
        <Tree>
          <Admin />
        </Tree>
      )
      fireEvent.click(screen.getByLabelText('edit-signer'))
    })

    expect(routerPushMock).toHaveBeenCalledWith(
      `${PAGE.MSIG_CHANGE_SIGNER}?address=${MULTISIG_SIGNER_ID_2}`
    )
  })

  test('it sends you to the remove signer page with the right query params when the user clicks the remove signer button', () => {
    const { Tree } = composeMockAppTree('postOnboard')

    act(() => {
      render(
        <Tree>
          <Admin />
        </Tree>
      )
      fireEvent.click(screen.getByLabelText('remove-signer'))
    })

    expect(routerPushMock).toHaveBeenCalledWith(
      `${PAGE.MSIG_REMOVE_SIGNER}?address=${MULTISIG_SIGNER_ID_2}`
    )
  })
})
