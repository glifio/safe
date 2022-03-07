import styled from 'styled-components'
import { useCallback, useState } from 'react'
import { ButtonV2 } from '@glif/react-components'
import {
  useWallet,
  useWalletProvider,
  reportLedgerConfigError
} from '@glif/wallet-provider-react'
import { useRouter } from 'next/router'

import { PAGE } from '../../../constants'
import { Address, Signers } from '../Shared'
import { useMsig } from '../../../MsigProvider'

const Wrapper = styled.div`
  max-width: 50rem;
  margin: 0 auto;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 3em;
  h3 {
    margin: 0;
  }
`

const Title = styled.h2`
  color: var(--purple-medium);
`

const Info = styled.p`
  color: var(--gray-medium);
  margin-top: 0.25em;
`

export default function Owners() {
  const router = useRouter()
  const { NumApprovalsThreshold, Signers: signers } = useMsig()
  const wallet = useWallet()
  const { ledger, connectLedger, loginOption } = useWalletProvider()
  const [ledgerBusy, setLedgerBusy] = useState(false)
  const onShowOnLedger = useCallback(async () => {
    setLedgerBusy(true)
    const provider = await connectLedger()
    if (provider) await provider.wallet.showAddressAndPubKey(wallet.path)
    setLedgerBusy(false)
  }, [setLedgerBusy, connectLedger, wallet.path])

  const ledgerErr = reportLedgerConfigError({
    ...ledger
  })

  return (
    <div>
      <Title>Safe Admin</Title>
      <hr />

      <Wrapper>
        <TitleRow>
          <h3>Required Approvals: {NumApprovalsThreshold}</h3>
          <ButtonV2
            onClick={() => router.push(PAGE.MSIG_CHANGE_APPROVAL_THRESHOLD)}
          >
            Edit
          </ButtonV2>
        </TitleRow>
        <Info>
          The number of approvals required for a Safe proposal to execute.
        </Info>

        <TitleRow>
          <h3>Your Address</h3>
          {loginOption === 'LEDGER' && (
            <ButtonV2
              disabled={!!ledgerErr || ledgerBusy}
              onClick={onShowOnLedger}
            >
              {ledgerErr
                ? 'Ledger Device Error'
                : ledgerBusy
                ? 'Check Ledger Device'
                : 'View on Device'}
            </ButtonV2>
          )}
        </TitleRow>
        <Address address={wallet.address} />

        <TitleRow>
          <h3>Additional Signers ({signers.length - 1})</h3>
          <ButtonV2 onClick={() => router.push(PAGE.MSIG_ADD_SIGNER)}>
            Add Signer
          </ButtonV2>
        </TitleRow>
        <Info>
          These are the Filecoin addresses that can approve and reject proposals
          from your Safe.
        </Info>
        <Signers signers={signers} walletAddress={wallet.address} />
      </Wrapper>
    </div>
  )
}
