import { useContext, createContext } from 'react'
import dynamic from 'next/dynamic'
import { node } from 'prop-types'
import { logger } from '../../logger'
import CantLoadWasm from './CantLoadWasm'

export const WasmContext = createContext({ loaded: false })

// Loads the wasm asyncronously and exposes it via a hook
export const WasmLoader = dynamic({
  ssr: false,
  loader: async () => {
    let rustModule = {}
    let loadError = null
    try {
      rustModule = await import('@zondax/filecoin-signing-tools')
    } catch (err) {
      logger.error(
        err instanceof Error ? err.message : JSON.stringify(err),
        'WasmLoader'
      )
      loadError = true
    }

    const WasmProvider = ({ children }) => {
      return (
        <WasmContext.Provider value={{ ...rustModule, loaded: true }}>
          {loadError ? <CantLoadWasm /> : children}
        </WasmContext.Provider>
      )
    }

    WasmProvider.propTypes = {
      children: node
    }

    WasmProvider.defaultProps = {
      children: <></>
    }
    return WasmProvider
  }
})

export const useWasm = () => {
  return useContext(WasmContext)
}
