import { useMsig } from '../../../MsigProvider'
import Balances from './Balances'

const MsigHome = () => {
  const msig = useMsig()
  return (
    <Balances available={msig.AvailableBalance} total={msig.Balance} />
  )
}

export default MsigHome
