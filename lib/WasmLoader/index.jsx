import { useContext, createContext, useEffect } from 'react'
import { useLogger } from '@glif/react-components'
import dynamic from 'next/dynamic'
import { node } from 'prop-types'
import { CantLoadWasm } from './CantLoadWasm'

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
      loadError = err
    }

    const WasmProvider = ({ children }) => {
      const logger = useLogger()

      useEffect(() => {
        if (loadError) {
          logger.error(
            err instanceof Error ? err.message : JSON.stringify(err),
            'WasmLoader'
          )
        }
      }, [logger])
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
