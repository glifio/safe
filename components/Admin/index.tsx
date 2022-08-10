import styled from 'styled-components'
import { useRouter } from 'next/router'
import {
  ButtonV2Link,
  PageTitle,
  useWallet,
  navigate,
  ButtonRowCenter,
  WideDialog,
  LoadingScreen
} from '@glif/react-components'

import { PAGE } from '../../constants'
import { useMsig } from '../../MsigProvider'
import { SignersTable } from './SignersTable'

const RequiredApprovals = styled.div`
  margin-top: var(--space-l);

  div {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  p {
    color: var(--gray-medium);
    margin-top: 0;
    padding-left: 1em;
  }
`

export default function Owners() {
  const { NumApprovalsThreshold, Signers: signers } = useMsig()
  const wallet = useWallet()
  const router = useRouter()

  return NumApprovalsThreshold === 0 ? (
    <LoadingScreen />
  ) : (
    <div>
      <PageTitle>Safe Admin</PageTitle>
      <hr />
      <WideDialog>
        <RequiredApprovals>
          <div>
            <h3>Required Approvals: {NumApprovalsThreshold}</h3>
            <ButtonV2Link href={PAGE.MSIG_CHANGE_APPROVALS}>Edit</ButtonV2Link>
          </div>
          <p>
            The number of approvals required for a Safe proposal to execute.
          </p>
        </RequiredApprovals>

        <div>
          <h3>Signer Addresses</h3>
          <SignersTable
            signers={signers}
            wallet={wallet}
            onRemove={(address: string) => {
              navigate(router, {
                pageUrl: PAGE.MSIG_REMOVE_SIGNER,
                params: {
                  address
                }
              })
            }}
            onChange={(address: string) => {
              navigate(router, {
                pageUrl: PAGE.MSIG_CHANGE_SIGNER,
                params: {
                  address
                }
              })
            }}
          />
          <ButtonRowCenter>
            <ButtonV2Link href={PAGE.MSIG_ADD_SIGNER}>Add signer</ButtonV2Link>
          </ButtonRowCenter>
        </div>
      </WideDialog>
    </div>
  )
}
