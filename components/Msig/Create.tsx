import { useState, useMemo } from 'react'
import {
  Dialog,
  ShadowBox,
  TxState
} from '@glif/react-components'
export const Create = () => {
  // Transaction states
  const [txState, setTxState] = useState<TxState>(TxState.FillingForm)
  const [txError, setTxError] = useState<Error | null>(null)

  return (
    <Dialog>
      <ShadowBox>
      </ShadowBox>
    </Dialog>
  )
}
