import { ErrorView, OneColumnCentered } from '@glif/react-components'
import SafePage from '../../components/SafePage'

export const CantLoadWasm = () => (
  <SafePage>
    <OneColumnCentered>
      <ErrorView
        title='Glif Safe isn&rsquo;t ready for your browser'
        description='Only Google Chrome supports all features required to use the Safe'
        linkDisplay='Install Google Chrome.'
        linkhref='https://www.google.com/chrome'
      />
    </OneColumnCentered>
  </SafePage>
)
