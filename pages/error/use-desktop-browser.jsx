import React from 'react'
import {
  ButtonV2Link,
  ShadowBox,
  Dialog,
  ButtonRowCenter,
  OneColumnCentered
} from '@glif/react-components'
import SafePage from '../../components/SafePage'

const UseDesktopBrowser = () => {
  return (
    <SafePage>
      <OneColumnCentered>
        <Dialog>
          <ShadowBox>
            <h2>Not yet</h2>
            <hr />
            <p>Glif Safe isn&rsquo;t ready for your phone or tablet.</p>
            <p>Please access it from your computer instead.</p>
          </ShadowBox>
          <ButtonRowCenter>
            <ButtonV2Link large green href={process.env.NEXT_PUBLIC_HOME_URL}>
              Home
            </ButtonV2Link>
          </ButtonRowCenter>
        </Dialog>
      </OneColumnCentered>
    </SafePage>
  )
}

export default UseDesktopBrowser
