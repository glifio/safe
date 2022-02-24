import PropTypes from 'prop-types'
import {
  Page,
  AppHeaderLink,
  APP_HEADER_LINK,
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
  children?: JSX.Element | Array<JSX.Element>
  showPhishingBanner?: boolean
  logout?: () => void
  connection?: JSX.Element
  appHeaderLinks?: Array<AppHeaderLink>
}

SafePage.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  showPhishingBanner: PropTypes.bool,
  logout: PropTypes.func,
  connection: PropTypes.node,
  appHeaderLinks: PropTypes.arrayOf(APP_HEADER_LINK)
}
