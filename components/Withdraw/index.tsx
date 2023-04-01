import PropTypes from 'prop-types'
import { useState, useMemo, Context } from 'react'
import { useRouter } from 'next/router'
import { Message } from '@glif/filecoin-message'
import { FilecoinNumber } from '@glif/filecoin-number'
import { validateAddressString } from '@glif/filecoin-address'
import {
  navigate,
  useWallet,
  InputV2,
  Transaction,
  MsigMethod,
  TxState,
  WalletProviderOpts,
  PendingMsgContextType,
  useLogger,
  isAddrEqual
} from '@glif/react-components'

import { useMsig } from '../../MsigProvider'
import { useWasm } from '../../lib/WasmLoader'
import { PAGE } from '../../constants'

const contractsToDisableWithdrawal = [
  'f2097390',
  'f2s4fled7kstd343gbzob4harevekx2q4naeurfti',
  '0x690908f7fa93afC040CFbD9fE1dDd2C2668Aa0e0',
  'f2097395',
  'f23wp4q3xdnopf6xbydjkinsqej423ncyijsykhsi',
  '0x0ec46ad7aa8600118da4bd64239c3dc364fd0274'
]

export const Withdraw = ({
  walletProviderOpts,
  pendingMsgContext
}: WithdrawProps) => {
  const logger = useLogger()
  const router = useRouter()
  const wallet = useWallet()
  // @ts-expect-error
  const { serializeParams } = useWasm()
  const { Address, AvailableBalance } = useMsig()

  // Input states
  const [toAddress, setToAddress] = useState<string>('')
  const [value, setValue] = useState<FilecoinNumber | null>(null)
  const [isValueValid, setIsValueValid] = useState<boolean>(false)

  // Transaction states
  const [txState, setTxState] = useState<TxState>(TxState.FillingForm)
  const [txFee, setTxFee] = useState<FilecoinNumber | null>(null)

  // Create message from input
  const message = useMemo<Message | null>(() => {
    if (
      contractsToDisableWithdrawal.some((addr) => isAddrEqual(toAddress, addr))
    ) {
      return null
    }

    try {
      return isValueValid &&
        // Manually check address validity to prevent passing invalid addresses to serializeParams.
        // This can happen due to multiple rerenders when using setIsValid from InputV2.Address.
        validateAddressString(toAddress) &&
        // For the same reason, check whether value is a FileCoinNumber and not null
        value
        ? new Message({
            to: Address,
            from: wallet.robust,
            nonce: 0,
            value: 0,
            method: MsigMethod.PROPOSE,
            params: Buffer.from(
              serializeParams({
                To: toAddress,
                Value: value.toAttoFil(),
                Method: MsigMethod.WITHDRAW,
                Params: ''
              }),
              'hex'
            ).toString('base64'),
            gasPremium: 0,
            gasFeeCap: 0,
            gasLimit: 0
          })
        : null
    } catch (e) {
      logger.error(e)
      return null
    }
  }, [
    isValueValid,
    toAddress,
    Address,
    wallet.robust,
    value,
    serializeParams,
    logger
  ])

  return (
    <Transaction.Form
      title='Withdraw Filecoin'
      description='Please enter the message details below'
      msig
      method={MsigMethod.WITHDRAW}
      message={message}
      total={value}
      txState={txState}
      setTxState={setTxState}
      maxFee={wallet.balance}
      txFee={txFee}
      setTxFee={setTxFee}
      onComplete={() => navigate(router, { pageUrl: PAGE.MSIG_HISTORY })}
      walletProviderOpts={walletProviderOpts}
      pendingMsgContext={pendingMsgContext}
    >
      <Transaction.Balance
        address={Address}
        balance={wallet.balance}
        msigBalance={AvailableBalance}
      />
      <InputV2.Address
        label='Recipient'
        autoFocus
        value={toAddress}
        onChange={setToAddress}
        disabled={txState !== TxState.FillingForm}
        truncate={false}
      />
      <InputV2.Filecoin
        label='Amount'
        max={AvailableBalance}
        value={value}
        denom='fil'
        onChange={setValue}
        setIsValid={setIsValueValid}
        disabled={txState !== TxState.FillingForm}
      />
    </Transaction.Form>
  )
}

interface WithdrawProps {
  walletProviderOpts?: WalletProviderOpts
  pendingMsgContext?: Context<PendingMsgContextType>
}

Withdraw.propTypes = {
  walletProviderOpts: PropTypes.object,
  pendingMsgContext: PropTypes.object
}
