import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import {
  navigate,
  generateRouteWithRequiredUrlParams,
  ButtonRowSpaced,
  ButtonV2,
  InputV2,
  Dialog,
  ErrorBox,
  ShadowBox,
  SmartLink
} from '@glif/react-components'

import { useMsig } from '../../MsigProvider'
import { PAGE } from '../../constants'

export const Choose = () => {
  const router = useRouter()
  const { setMsigActor, errors, ActorCode } = useMsig()

  // Input states
  const [safeID, setSafeID] = useState<string>('')
  const [isSafeIDValid, setIsSafeIDValid] = useState<boolean>(false)
  const [submittedForm, setSubmittedForm] = useState<boolean>(false)

  // Get error message from MSIG provider
  const errorMessage = useMemo(() => {
    if (errors.actorNotFound) return 'Safe not found'
    if (errors.connectedWalletNotMsigSigner)
      return 'Your wallet is not an owner of this Safe. Please go back and choose a wallet address that is an owner of this Safe.'
    if (errors.notMsigActor)
      return 'The address you entered is not a Glif Safe.'
    return errors.unhandledError || ''
  }, [
    errors.actorNotFound,
    errors.connectedWalletNotMsigSigner,
    errors.notMsigActor,
    errors.unhandledError
  ])

  // When there is an ActorCode we successfully retrieved
  // the multisig and we push the user to the msig home
  useEffect(
    () =>
      submittedForm &&
      !errorMessage &&
      !!ActorCode &&
      navigate(router, { pageUrl: PAGE.MSIG_HOME }),
    [submittedForm, errorMessage, ActorCode, router]
  )

  return (
    <Dialog>
      {submittedForm && errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}
      <ShadowBox>
        <h2>Safe ID</h2>
        <hr />
        <form>
          <InputV2.Address
            name='safe-id'
            label='Please enter your Safe ID below to continue'
            vertical
            centered
            autoFocus
            truncate={false}
            actor
            value={safeID}
            onChange={setSafeID}
            setIsValid={setIsSafeIDValid}
          />
        </form>
        <p>
          Don&apos;t have a Safe ID?{' '}
          <SmartLink
            href={generateRouteWithRequiredUrlParams({
              pageUrl: PAGE.MSIG_CREATE,
              existingQParams: {}
            })}
          >
            Create one
          </SmartLink>
        </p>
      </ShadowBox>
      <ButtonRowSpaced>
        <ButtonV2 large onClick={() => router.back()}>
          Back
        </ButtonV2>
        <ButtonV2
          large
          green
          disabled={!isSafeIDValid}
          onClick={() => {
            setSubmittedForm(true)
            setMsigActor(safeID)
          }}
        >
          Submit
        </ButtonV2>
      </ButtonRowSpaced>
    </Dialog>
  )
}
