import { Page, PageProps, SafeIconHeaderFooter } from '@glif/react-components'

export default function SafePage({ children, ...rest }: PageProps) {
  return (
    <Page
      appIcon={<SafeIconHeaderFooter />}
      appUrl={process.env.NEXT_PUBLIC_SAFE_URL}
      {...rest}
    >
      {children}
    </Page>
  )
}

SafePage.propTypes = {
  ...Page.propTypes
}
