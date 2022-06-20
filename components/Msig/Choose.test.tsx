import {
  render,
  act,
  fireEvent,
  getByText,
  getByRole,
  RenderResult
} from '@testing-library/react'

import composeMockAppTree from '../../test-utils/composeMockAppTree'
import { flushPromises } from '../../test-utils'
import { Choose } from './Choose'

const validSafeID = 'f2yrhsjwuwypy4gsv2lcikphizkusqe2gp3pp4w5q'
const inValidSafeID = 't1iuryu3ke2hewrcxp4ezhmr5cmfeq3wjhpxaucza'

describe('Choose', () => {
  test('it renders the initial state correctly', async () => {
    const { Tree } = composeMockAppTree('postOnboard')
    let result: RenderResult | null = null

    await act(async () => {
      result = render(
        <Tree>
          <Choose />
        </Tree>
      )
    })

    // Check whether the submit button is disabled
    const submit = getByText(result.container, 'Submit')
    expect(submit).toBeDisabled()

    // Check snapshot
    expect(result.container.firstChild).toMatchSnapshot()
  })

  test('it renders correctly after entering a valid safe id', async () => {
    const { Tree } = composeMockAppTree('postOnboard')
    let result: RenderResult | null = null

    await act(async () => {
      result = render(
        <Tree>
          <Choose />
        </Tree>
      )

      // Enter a valid Safe ID
      const safeId = getByRole(result.container, 'textbox')
      fireEvent.change(safeId, { target: { value: validSafeID } })
      safeId.blur()

      await flushPromises()
    })

    // Check whether the submit button is enabled
    const submit = getByText(result.container, 'Submit')
    expect(submit).toBeEnabled()

    // Check snapshot
    expect(result.container.firstChild).toMatchSnapshot()
  })

  test('it renders correctly after entering an invalid safe id', async () => {
    const { Tree } = composeMockAppTree('postOnboard')
    let result: RenderResult | null = null

    await act(async () => {
      result = render(
        <Tree>
          <Choose />
        </Tree>
      )

      // Enter a valid Safe ID
      const safeId = getByRole(result.container, 'textbox')
      fireEvent.change(safeId, { target: { value: inValidSafeID } })
      safeId.blur()

      await flushPromises()
    })

    // Check whether the safe id input has an error
    const safeId = getByRole(result.container, 'textbox')
    expect(safeId).toHaveClass('error')

    // Check whether the submit button is disabled
    const submit = getByText(result.container, 'Submit')
    expect(submit).toBeDisabled()

    // Check snapshot
    expect(result.container.firstChild).toMatchSnapshot()
  })
})
