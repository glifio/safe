import React, { SyntheticEvent, useEffect, useState } from 'react'
import { func, string } from 'prop-types'
import { useRouter } from 'next/router'
import confirmMessage from '@glif/filecoin-message-confirmer'
import LotusRPCEngine from '@glif/filecoin-rpc-client'
import {
  Card,
  Box,
  IconPending,
  StyledATag,
  Button,
  Text,
  Glyph,
  Title
} from '@glif/react-components'

import { useMsig } from '../../../MsigProvider'
import { PAGE } from '../../../constants'
import { navigate } from '../../../utils/urlParams'
import getAddrFromReceipt from '../../../utils/getAddrFromReceipt'

const NextOption = ({
  text,
  onClick
}: {
  text: string
  onClick: (_: SyntheticEvent) => void
}) => {
  return (
    <Button
      title={text}
      display='flex'
      flexWrap='wrap'
      alignItems='center'
      mr={2}
      my={3}
      bg='core.transparent'
      borderColor='core.primary'
      color='core.primary'
      opacity='1'
      onClick={onClick}
      css={`
        &:hover {
          cursor: pointer;
        }
      `}
    />
  )
}

NextOption.propTypes = {
  text: string.isRequired,
  onClick: func.isRequired
}

const Confirm = () => {
  const [msigError, setMsigError] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const { setMsigActor, Address } = useMsig()
  const router = useRouter()

  useEffect(() => {
    const confirm = async () => {
      const confirmed = await confirmMessage(router.query.cid as string, {
        apiAddress: process.env.NEXT_PUBLIC_LOTUS_NODE_JSONRPC
      })

      if (confirmed) {
        const lCli = new LotusRPCEngine({
          apiAddress: process.env.NEXT_PUBLIC_LOTUS_NODE_JSONRPC
        })
        const receipt = (await lCli.request(
          'StateGetReceipt',
          { '/': router.query.cid },
          null
        )) as { ExitCode: number; GasUsed: number; Return: string }

        if (receipt.ExitCode === 0) {
          const { robust } = getAddrFromReceipt(receipt.Return)
          if (robust) setMsigActor(robust)
          else setMsigError(true)
        } else {
          setMsigError(true)
        }
      }
    }

    if (!Address && !confirming && router.query.cid) {
      setConfirming(true)
      confirm()
    }
  }, [router.query.cid, Address, setMsigActor, confirming, setConfirming])

  if (msigError || !router.query.cid) {
    return (
      <>
        <Title ml={2}>There was an error when creating your Safe.</Title>
        <Box display='flex' justifyContent='center' alignItems='center'>
          <Text mr={2}>With CID: </Text>
          <StyledATag
            href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/message/?cid=${router.query.cid}`}
          >
            {router.query.cid}
          </StyledATag>
          <br />
        </Box>
      </>
    )
  }

  if (Address) {
    return (
      <Box display='flex' flexDirection='column' alignItems='center'>
        <Title>Your Safe has been created.</Title>
        <Card
          maxWidth={13}
          width='100%'
          my={3}
          bg='background.screen'
          boxShadow={2}
          border={0}
        >
          <Glyph acronym='Sa' />
          <Text my={0} mt={3} color='core.darkgray'>
            Your Safe Address{' '}
          </Text>
          <Text mt={2}>{Address}</Text>
        </Card>
        <NextOption
          text='Go to Safe dashboard'
          onClick={() => {
            navigate(router, { pageUrl: PAGE.MSIG_HOME })
          }}
        />
      </Box>
    )
  }

  return (
    <Card
      width='100%'
      maxWidth={16}
      bg='background.screen'
      boxShadow={2}
      border={0}
      textAlign='center'
    >
      <Box display='flex' justifyContent='center' alignItems='center'>
        <IconPending flexShrink='0' />
        <Text ml={2}>We&apos;re waiting for your transaction to confirm.</Text>
      </Box>
      <Box display='flex' justifyContent='center' alignItems='center'>
        <Text mr={2}>With CID: </Text>
        <StyledATag
          href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/message/?cid=${router.query.cid}`}
        >
          <span style={{ wordBreak: 'break-all' }}>{router.query.cid}</span>
        </StyledATag>
        <br />
      </Box>
      <Text>
        This screen will automatically show you your new Safe address once the
        transaction confirms.
      </Text>
    </Card>
  )
}

export default Confirm
