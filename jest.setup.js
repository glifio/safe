const { TextDecoder, TextEncoder } = require('util')
global.TextDecoder = TextDecoder
global.TextEncoder = TextEncoder

import '@testing-library/jest-dom'
import 'jest-styled-components'

process.env.NEXT_PUBLIC_LOTUS_NODE_JSONRPC =
  'https://calibration.node.glif.io/rpc/v0'
process.env.NEXT_PUBLIC_COIN_TYPE = 't'
process.env.NEXT_PUBLIC_GRAPH_API_URL =
  'https://graph-calibration.glif.link/query'
