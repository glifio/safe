import PropTypes from 'prop-types'
import { useState, useMemo, Context } from 'react'
import { useRouter } from 'next/router'
import { Message } from '@glif/filecoin-message'
import { FilecoinNumber } from '@glif/filecoin-number'
import {
  navigate,
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
import { PAGE } from '../../constants'
import { logger } from '../../logger'

export const ChangeApprovals = ({
  walletProviderOpts,
  pendingMsgContext
}: ChangeApprovalsProps) => {
  const router = useRouter()
  const wallet = useWallet()
  // @ts-expect-error
  const { serializeParams } = useWasm()
  const { Address, AvailableBalance, Signers, NumApprovalsThreshold } =
    useMsig()

  // Input states
  const [approvals, setApprovals] = useState<number>(NumApprovalsThreshold)

  // Transaction states
  const [txState, setTxState] = useState<TxState>(TxState.FillingForm)
  const [txFee, setTxFee] = useState<FilecoinNumber | null>(null)

  // Create message from input
  const message = useMemo<Message | null>(() => {
    try {
      return approvals !== NumApprovalsThreshold
        ? new Message({
            to: Address,
            from: wallet.address,
            nonce: 0,
            value: 0,
            method: MsigMethod.PROPOSE,
            params: Buffer.from(
              serializeParams({
                To: Address,
                Value: '0',
                Method: MsigMethod.CHANGE_NUM_APPROVALS_THRESHOLD,
                Params: Buffer.from(
                  serializeParams({
                    NewTreshold: approvals
                  }),
                  'hex'
                ).toString('base64')
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
    approvals,
    NumApprovalsThreshold,
    Address,
    wallet.address,
    serializeParams
  ])

  return (
    <Transaction.Form
      title='Change required approvals'
      description='Please update the number of required approvals below'
      msig
      method={MsigMethod.CHANGE_NUM_APPROVALS_THRESHOLD}
      message={message}
      total={txFee}
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
        address={wallet.address}
        balance={wallet.balance}
        msigBalance={AvailableBalance}
      />
      <InputV2.SelectRange
        label='Required approvals'
        info={`The Safe currently has ${Signers.length} owners`}
        autoFocus
        min={1}
        max={Signers.length}
        value={approvals}
        onChange={setApprovals}
        disabled={txState !== TxState.FillingForm}
      />
    </Transaction.Form>
  )
}

interface ChangeApprovalsProps {
  walletProviderOpts?: WalletProviderOpts
  pendingMsgContext?: Context<PendingMsgContextType>
}

ChangeApprovals.propTypes = {
  walletProviderOpts: PropTypes.object,
  pendingMsgContext: PropTypes.object
}
