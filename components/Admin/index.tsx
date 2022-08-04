import styled from 'styled-components'
import { useRouter } from 'next/router'
import {
  ButtonV2Link,
  PageTitle,
  useWallet,
  navigate
} from '@glif/react-components'

import { PAGE } from '../../constants'
import { useMsig } from '../../MsigProvider'
import { SignersTable } from './table'

const Wrapper = styled.div`
  max-width: 50rem;
  margin: 0 auto;
`

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

  return (
    <div>
      <PageTitle>Safe Admin</PageTitle>
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
          <h3>Signers</h3>
        </TitleRow>
        <SignersTable signers={signers} wallet={wallet} loading={false} />
      </Wrapper>
    </div>
  )
}
