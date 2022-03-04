import { Page, PageProps, SafeIconHeaderFooter } from '@glif/react-components'

export default function SafePage({ children, ...rest }: PageProps) {
  return (
    <Page appIcon={<SafeIconHeaderFooter />} appUrl='/' {...rest}>
      {children}
    </Page>
  )
}

SafePage.propTypes = {
  ...Page.propTypes
}
