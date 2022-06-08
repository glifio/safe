import styled from 'styled-components'
import { useCallback, useMemo, useState } from 'react'
import {
  ButtonV2,
  ButtonV2Link,
  useWallet,
  useWalletProvider,
  convertAddrToPrefix,
  reportLedgerConfigError
} from '@glif/react-components'

import { PAGE } from '../../../constants'
import { Address } from './Address'
import { Signers } from './Signers'
import { useMsig } from '../../../MsigProvider'

const Wrapper = styled.div`
  max-width: 50rem;
  margin: 0 auto;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  margin-top: 3em;
  h3 {
    margin: 0;
    flex-grow: 1;
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

  const { additionalSigners, userSigner } = useMemo(() => {
    return {
      additionalSigners: signers.filter(
        (signer) =>
          convertAddrToPrefix(signer.robust) !==
          convertAddrToPrefix(wallet.address)
      ),
      userSigner: signers.find(
        (signer) =>
          convertAddrToPrefix(signer.robust) ===
          convertAddrToPrefix(wallet.address)
      )
    }
  }, [signers, wallet])

  return (
    <div>
      <Title>Safe Admin</Title>
      <hr />

      <Wrapper>
        <TitleRow>
          <h3>Required Approvals: {NumApprovalsThreshold}</h3>
          <ButtonV2Link href={PAGE.MSIG_CHANGE_APPROVALS}>Edit</ButtonV2Link>
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
        <Address address={userSigner} />

        <TitleRow>
          <h3>Additional Signers ({additionalSigners.length})</h3>
          <ButtonV2Link href={PAGE.MSIG_ADD_SIGNER}>Add Signer</ButtonV2Link>
        </TitleRow>
        <Info>
          These are the Filecoin addresses that can approve and reject proposals
          from your Safe.
        </Info>
        <Signers signers={additionalSigners} />
      </Wrapper>
    </div>
  )
}
