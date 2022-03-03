import PropTypes from 'prop-types'
import { Page, PageProps, SafeIconHeaderFooter } from '@glif/react-components'

export default function SafePage({
  children,
  showPhishingBanner,
  ...rest
}: SafePageProps) {
  return (
    <Page
      phishingUrl={showPhishingBanner ? 'https://safe.glif.io' : null}
      appIcon={<SafeIconHeaderFooter />}
      appUrl={process.env.NEXT_PUBLIC_SAFE_URL}
      {...rest}
    >
      {children}
    </Page>
  )
}

type SafePageProps = {
  showPhishingBanner?: boolean
} & PageProps

SafePage.propTypes = {
  showPhishingBanner: PropTypes.bool,
  ...Page.propTypes
}
