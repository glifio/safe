import { useRouter } from 'next/router'
import { ErrorView, OneColumnCentered } from '@glif/react-components'
import SafePage from '../../components/SafePage'

const NotASigner = () => {
  const router = useRouter()
  const params = new URLSearchParams(router.query)
  const walletAddress = params.get('walletAddress')
  const msigAddress = params.get('msigAddress')
  return (
    <SafePage>
      <OneColumnCentered>
        <ErrorView
          title='Not a signer!'
          description={`You selected an account (${walletAddress.slice(
            0,
            3
          )}...${walletAddress.slice(
            -5
          )}) from your Ledger device that is not a signer of the multisig actor address you entered (${msigAddress}).`}
        />
      </OneColumnCentered>
    </SafePage>
  )
}

export default NotASigner
