import PropTypes from 'prop-types'
import { useState, useMemo, Context } from 'react'
import { useRouter } from 'next/router'
import { Message } from '@glif/filecoin-message'
import { FilecoinNumber } from '@glif/filecoin-number'
import { validateAddressString } from '@glif/filecoin-address'
import {
  useWallet,
  InputV2,
  Transaction,
  MsigMethod,
  TxState,
  WalletProviderOpts,
  PendingMsgContextType
} from '@glif/react-components'

import { useMsig } from '../../MsigProvider'
import { useWasm } from '../../lib/WasmLoader'
import { navigate } from '../../utils/urlParams'
import { PAGE } from '../../constants'

export const Withdraw = ({
  walletProviderOpts,
  pendingMsgContext
}: WithdrawProps) => {
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
  const message = useMemo<Message | null>(
    () =>
      isValueValid &&
      // Manually check address validity to prevent passing invalid addresses to serializeParams.
      // This can happen due to multiple rerenders when using setIsValid from InputV2.Address.
      validateAddressString(toAddress) &&
      // For the same reason, check whether value is a FileCoinNumber and not null
      value
        ? new Message({
            to: Address,
            from: wallet.address,
            nonce: 0,
            value: 0,
            method: MsigMethod.PROPOSE,
            params: Buffer.from(
              serializeParams({
                to: toAddress,
                value: value.toAttoFil(),
                method: MsigMethod.WITHDRAW,
                params: ''
              }),
              'hex'
            ).toString('base64'),
            gasPremium: 0,
            gasFeeCap: 0,
            gasLimit: 0
          })
        : null,
    [isValueValid, toAddress, Address, wallet.address, value, serializeParams]
  )

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
