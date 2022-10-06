import { Page, PageProps, IconSafe } from '@glif/react-components'

export default function SafePage({ children, ...rest }: PageProps) {
  return (
    <Page appIcon={<IconSafe />} {...rest}>
      {children}
    </Page>
  )
}

SafePage.propTypes = {
  ...Page.propTypes
}
