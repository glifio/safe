const { TextDecoder } = require('util')
// @ts-ignore
global.TextDecoder = TextDecoder

import '@testing-library/jest-dom'
import 'jest-styled-components'
import 'whatwg-fetch'

process.env.NEXT_PUBLIC_LOTUS_NODE_JSONRPC =
  'https://calibration.node.glif.io/rpc/v0'
process.env.NEXT_PUBLIC_COIN_TYPE = 't'
