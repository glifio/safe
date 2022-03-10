import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { validateAddressString } from '@glif/filecoin-address'
import styled from 'styled-components'
import {
  Box,
  Button,
  OnboardCard,
  StepHeader,
  StyledLink,
  Text,
  Title,
  IconLedger,
  Input
} from '@glif/react-components'
import { useMsig } from '../../MsigProvider'
import {
  generateRouteWithRequiredUrlParams,
  navigate
} from '../../utils/urlParams'
import { PAGE } from '../../constants'

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const ACTOR_NOT_FOUND_ERR = 'Safe not found'
const NOT_A_SIGNER_ERR =
  'Your wallet is not an owner of this Safe. Please go back and choose a wallet address that is an owner of this Safe.'
const NOT_MSIG_ACTOR_ERR = 'The address you entered is not a Glif Safe.'

const EnterActorAddress = () => {
  const { setMsigActor, errors: msigActorErrors, ActorCode } = useMsig()
  const [submittedForm, setSubmittedForm] = useState(false)
  const router = useRouter()
  const [err, setErr] = useState('')
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!err && msigActorErrors.actorNotFound) {
      setErr(ACTOR_NOT_FOUND_ERR)
    }

    if (!err && msigActorErrors.connectedWalletNotMsigSigner) {
      setErr(NOT_A_SIGNER_ERR)
    }

    if (!err && msigActorErrors.notMsigActor) {
      setErr(NOT_MSIG_ACTOR_ERR)
    }

    if (!err && msigActorErrors.unhandledError) {
      setErr(msigActorErrors.unhandledError)
    }
  }, [
    err,
    setErr,
    msigActorErrors.actorNotFound,
    msigActorErrors.connectedWalletNotMsigSigner,
    msigActorErrors.notMsigActor,
    msigActorErrors.unhandledError
  ])

  // once the actor address gets populated in context
  // we push the user to the msig home
  useEffect(() => {
    // as long as there is an ActorCode, we know we successfully retrieved the multisig
    if (!err && !!ActorCode && submittedForm) {
      navigate(router, { pageUrl: PAGE.MSIG_HOME })
    }
  }, [submittedForm, err, router, ActorCode])

  const onSubmit = (e) => {
    e.preventDefault()
    setSubmittedForm(true)
    setErr('')
    const trimmedAddr = input.current.value.trim()
    if (!validateAddressString(trimmedAddr)) return setErr('Invalid address.')
    if (Number(trimmedAddr[1]) !== 0 && Number(trimmedAddr[1]) !== 2)
      return setErr('Invalid Safe Address. Second character must be 0 or 2.')
    setMsigActor(trimmedAddr)
  }

  return (
    <Form autoComplete='on' onSubmit={onSubmit}>
      <OnboardCard>
        <StepHeader showStepper={false} Icon={IconLedger} />
        <Title mt={3}>Safe ID</Title>
        <Text>Please input your Safe ID address below to continue </Text>
        <Input.Text
          // @ts-expect-error
          ref={input}
          autoComplete='on'
          label='ID'
          name='ID'
          placeholder='f02'
          error={err}
        />

        <br />
        <Box display='flex' flexDirection='row' alignItems='center'>
          <Text mr={3}>Don&apos;t have a Safe ID?</Text>
          <StyledLink
            href={generateRouteWithRequiredUrlParams({
              pageUrl: PAGE.MSIG_CREATE,
              existingQParams: {}
            })}
            name='Create one'
            target='_self'
          />
        </Box>
      </OnboardCard>
      <Box
        mt={6}
        display='flex'
        flexDirection='row'
        justifyContent='space-between'
        width='100%'
        maxWidth={13}
      >
        <Button title='Back' onClick={router.back} variant='secondary' mr={2} />
        <Button title='Submit' type='submit' variant='primary' ml={2} />
      </Box>
    </Form>
  )
}

export default EnterActorAddress
