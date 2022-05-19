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
import { navigate } from '../../utils/urlParams'
import { PAGE } from '../../constants'
import { logger } from '../../logger'

export const Create = () => {
  const router = useRouter()
  const wallet = useWallet()
  // @ts-expect-error
  const { createMultisig } = useWasm()
  const { loginOption, walletProvider, walletError, getProvider } =
    useWalletProvider()

  // Input states
  const [vest, setVest] = useState<number>(0)
  const [epoch, setEpoch] = useState<number>(0)
  const [value, setValue] = useState<FilecoinNumber | null>(null)
  const [signers, setSigners] = useState<Array<string>>([wallet.address])
  const [approvals, setApprovals] = useState<number>(1)
  const [isVestValid, setIsVestValid] = useState<boolean>(false)
  const [isEpochValid, setIsEpochValid] = useState<boolean>(false)
  const [isValueValid, setIsValueValid] = useState<boolean>(false)
  const [isSignersValid, setIsSignersValid] = useState<boolean>(false)
  const [isApprovalsValid, setIsApprovalsValid] = useState<boolean>(false)

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
