import styled from 'styled-components'
import { useCallback, useMemo, useState } from 'react'
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
import converAddrToFPrefix from '../../../utils/convertAddrToFPrefix'
import { navigate } from '../../../utils/urlParams'

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

  const additionalSigners = useMemo(
    () =>
      signers.filter(
        (signer) =>
          converAddrToFPrefix(signer.account) !==
          converAddrToFPrefix(wallet.address)
      ),
    [signers, wallet]
  )

  return (
    <div>
      <Title>Safe Admin</Title>
      <hr />

      <Wrapper>
        <TitleRow>
          <h3>Required Approvals: {NumApprovalsThreshold}</h3>
          <ButtonV2
            onClick={() =>
              navigate(router, { pageUrl: PAGE.MSIG_CHANGE_APPROVAL_THRESHOLD })
            }
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
          <h3>Additional Signers ({additionalSigners.length})</h3>
          <ButtonV2
            onClick={() => navigate(router, { pageUrl: PAGE.MSIG_ADD_SIGNER })}
          >
            Add Signer
          </ButtonV2>
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
