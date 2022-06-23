import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import {
  getQueryParam,
  navigate,
  ButtonRowSpaced,
  ButtonV2,
  InputV2,
  Dialog,
  ErrorBox,
  ShadowBox,
  SmartLink
} from '@glif/react-components'

import { useMsig } from '../../MsigProvider'
import { PAGE, QPARAM } from '../../constants'

export const Choose = () => {
  const router = useRouter()
  const msigAddressParam = getQueryParam.string(router, QPARAM.MSIG_ADDRESS)
  const { setMsigActor, errors, ActorCode } = useMsig()

  // Input states
  const [safeID, setSafeID] = useState<string>(msigAddressParam)
  const [isSafeIDValid, setIsSafeIDValid] = useState<boolean>(false)
  const [submittedForm, setSubmittedForm] = useState<boolean>(false)

  // Get error message from MSIG provider
  const errorMessage = useMemo<string>(() => {
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

  const submitForm = useCallback(() => {
    setSubmittedForm(true)
    setMsigActor(safeID)
  }, [setSubmittedForm, setMsigActor, safeID])

  // Automatically submit the form if there is
  // a valid MSIG address in the query params
  useEffect(
    () => msigAddressParam && isSafeIDValid && !submittedForm && submitForm(),
    [msigAddressParam, isSafeIDValid, submittedForm, submitForm]
  )

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
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submitForm()
        }}
      >
        {submittedForm && errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}
        <ShadowBox>
          <h2>Safe ID</h2>
          <hr />
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
          <p>
            Don&apos;t have a Safe ID?{' '}
            <SmartLink href={PAGE.MSIG_CREATE}>Create one</SmartLink>
          </p>
        </ShadowBox>
        <ButtonRowSpaced>
          <ButtonV2 large type='button' onClick={() => router.back()}>
            Back
          </ButtonV2>
          <ButtonV2 large green type='submit' disabled={!isSafeIDValid}>
            Submit
          </ButtonV2>
        </ButtonRowSpaced>
      </form>
    </Dialog>
  )
}
