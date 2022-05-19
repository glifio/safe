import { useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import {
  useWallet,
  useWalletProvider,
  Dialog,
  ShadowBox,
  Transaction,
  LoginOption,
  MsigMethod,
  TxState
} from '@glif/react-components'

import { useWasm } from '../../lib/WasmLoader'

export const Create = () => {
  const router = useRouter()
  const wallet = useWallet()
  // @ts-expect-error
  const { createMultisig } = useWasm()
  const { loginOption, walletProvider, walletError, getProvider } =
    useWalletProvider()

  // Transaction states
  const [txState, setTxState] = useState<TxState>(TxState.FillingForm)
  const [txError, setTxError] = useState<Error | null>(null)

  return (
    <Dialog>
      <Transaction.Header
        txState={txState}
        title='Create Safe'
        description='Please enter the details for your new Safe below'
        loginOption={loginOption as LoginOption}
        msig={true}
        method={MsigMethod.CONSTRUCTOR}
      />
      <ShadowBox>
        <Transaction.Balance
          address={wallet.address}
          balance={wallet.balance}
        />
        <form>
        </form>
      </ShadowBox>
    </Dialog>
  )
}
