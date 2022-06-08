jest.mock('@glif/filecoin-rpc-client')
import LotusRPCEngine from '@glif/filecoin-rpc-client'
import { convertAddrToPrefix } from '@glif/react-components'

import fetchAndSetMsigActor from './fetchAndSetMsigActor'
import { MULTISIG_ACTOR_ADDRESS } from '../../test-utils'

describe('fetchMsigState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('it calls the success callback with the new multisig address (passing an exec message CID)', async () => {
    // @ts-ignore
    LotusRPCEngine.mockImplementation(() => {
      return {
        request: jest.fn(() => ({
          ExitCode: 0,
          Return: 'gkQAyogBVQJnC6HX7N9krE3QzLET9tDO1XuUqw==',
          GasUsed: 8555837
        }))
      }
    })

    const successSpy = jest.fn()
    const errorSpy = jest.fn()
    await fetchAndSetMsigActor(
      'bafy2bzacebhfwafs6qslx7xehmgqjtqvmchzj4k54q4qdcwgroloutqbh6v6e',
      successSpy,
      errorSpy
    )

    expect(convertAddrToPrefix(successSpy.mock.calls[0][0])).toBe(
      convertAddrToPrefix(MULTISIG_ACTOR_ADDRESS)
    )
  }, 12500)

  test('it calls the error callback when there is an error', async () => {
    // @ts-ignore
    LotusRPCEngine.mockImplementation(() => {
      return {
        request: jest.fn(() => {
          throw new Error()
        })
      }
    })
    const successSpy = jest.fn()
    const errorSpy = jest.fn()
    await fetchAndSetMsigActor(
      'bafy2bzacebo6out5pl3b5c2xdaxt3fgmu3gjfifwohzca3d53x4tm74fsnnpu',
      successSpy,
      errorSpy
    )

    expect(errorSpy).toHaveBeenCalled()
  }, 12500)
})
