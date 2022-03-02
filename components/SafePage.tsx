import PropTypes from 'prop-types'
import {
  Page,
  PageProps,
  SafeIconHeaderFooter
} from '@glif/react-components'

export default function SafePage(props: SafePageProps) {
  const { children, showPhishingBanner, logout, connection, appHeaderLinks } =
    props
  return (
    <Page
      phishingUrl={showPhishingBanner ? 'https://safe.glif.io' : null}
      logout={logout}
      connection={connection}
      appTitle='Safe'
      appIcon={<SafeIconHeaderFooter />}
      appUrl={process.env.NEXT_PUBLIC_SAFE_URL}
      blogUrl={process.env.NEXT_PUBLIC_BLOG_URL}
      walletUrl={process.env.NEXT_PUBLIC_WALLET_URL}
      explorerUrl={process.env.NEXT_PUBLIC_EXPLORER_URL}
      appHeaderLinks={appHeaderLinks}
    >
      {children}
    </Page>
  )
}

type SafePageProps = {
  showPhishingBanner?: boolean
} & PageProps;

SafePage.propTypes = {
  showPhishingBanner: PropTypes.bool,
  ...Page.propTypes
}
