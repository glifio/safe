import { Page, OneColumnCentered } from '@glif/react-components'
import ConfirmMsgCreate from '../../components/Msig/Create/Confirm'

const Confirm = () => (
  <Page
    homeUrl={process.env.NEXT_PUBLIC_HOME_URL}
    blogUrl={process.env.NEXT_PUBLIC_BLOG_URL}
    walletUrl={process.env.NEXT_PUBLIC_WALLET_URL}
    explorerUrl={process.env.NEXT_PUBLIC_EXPLORER_URL}
  >
    <OneColumnCentered>
      <ConfirmMsgCreate />
    </OneColumnCentered>
  </Page>
)

export default Confirm
