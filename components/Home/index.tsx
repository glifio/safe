import styled from 'styled-components'
import {
  ButtonRowCenter,
  ButtonV2Link,
  LoadingScreen,
  makeFriendlyBalance,
  StandardBox
} from '@glif/react-components'

import { useMsig } from '../../MsigProvider'
import { PAGE } from '../../constants'

const BalanceBox = styled(StandardBox)`
  width: 100%;
  padding: 4em;
  background: linear-gradient(
    169deg,
    hsl(224deg 48% 94%) 5.19%,
    hsl(224deg 48% 93% / 5%) 116.24%
  );

  .value {
    color: var(--purple-medium);
    font-size: 5rem;
    font-weight: 700;
  }
`

const VestingBox = styled(BalanceBox)`
  background: none !important;

  .value {
    color: var(--gray-dark);
  }
`

const MsigHome = () => {
  const { AvailableBalance, Balance, NumApprovalsThreshold } = useMsig()
  return NumApprovalsThreshold === 0 ? (
    <LoadingScreen />
  ) : (
    <>
      <BalanceBox>
        <h3>Available Balance</h3>
        <span className='value'>
          {makeFriendlyBalance(AvailableBalance, 6)}
        </span>
        <ButtonRowCenter>
          <ButtonV2Link large green href={PAGE.MSIG_WITHDRAW}>
            Withdraw
          </ButtonV2Link>
        </ButtonRowCenter>
      </BalanceBox>
      <VestingBox>
        <h3>Total Vesting</h3>
        <span className='value'>{makeFriendlyBalance(Balance, 6)}</span>
      </VestingBox>
    </>
  )
}

export default MsigHome
