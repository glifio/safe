import styled from 'styled-components'
import { useRouter } from 'next/router'
import {
  ButtonV2Link,
  PageTitle,
  useWallet,
  navigate,
  ButtonV2,
  ButtonRowCenter,
  WideDialog,
  LoadingScreen
} from '@glif/react-components'

import { PAGE } from '../../constants'
import { useMsig } from '../../MsigProvider'
import { SignersTable } from './SignersTable'

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  margin-top: 3em;
  h3 {
    margin-top: 0;
    flex-grow: 1;
  }
`

const Info = styled.p`
  color: var(--gray-medium);
  margin-top: 0;
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

        <TitleRow>
          <h3>Required Approvals: {NumApprovalsThreshold}</h3>
          <ButtonV2Link href={PAGE.MSIG_CHANGE_APPROVALS}>Edit</ButtonV2Link>
        </TitleRow>
        
        <Info>
          The number of approvals required for a Safe proposal to execute.
        </Info>

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
          <ButtonV2
            onClick={() =>
              navigate(router, {
                pageUrl: PAGE.MSIG_ADD_SIGNER
              })
            }
          >
            Add signer
          </ButtonV2>
        </ButtonRowCenter>
      </WideDialog>
    </div>
  )
}
