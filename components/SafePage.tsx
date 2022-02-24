import PropTypes from 'prop-types'
import { Page, SafeIconHeaderFooter } from '@glif/react-components'

export default function SafePage(props: SafePageProps) {
  const { children, showPhishingBanner } = props
  return (
    <Page
      phishingUrl={showPhishingBanner ? 'https://safe.glif.io' : null}
      appTitle='Safe'
      appIcon={<SafeIconHeaderFooter />}
      appUrl={process.env.NEXT_PUBLIC_SAFE_URL}
      blogUrl={process.env.NEXT_PUBLIC_BLOG_URL}
      walletUrl={process.env.NEXT_PUBLIC_WALLET_URL}
      explorerUrl={process.env.NEXT_PUBLIC_EXPLORER_URL}
    >
      {children}
    </Page>
  )
}

type SafePageProps = {
  children?: JSX.Element | Array<JSX.Element>
  showPhishingBanner?: boolean
}

SafePage.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  showPhishingBanner: PropTypes.bool
}

SafePage.defaultProps = {
  showPhishingBanner: false
}
