import { SyntheticEvent, useEffect, useState } from 'react'
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
  Title,
  Dialog,
  ShadowBox,
  ButtonRowCenter,
  ButtonV2,
  SmartLink,
  ErrorBox
} from '@glif/react-components'

import { useMsig } from '../../MsigProvider'
import { PAGE } from '../../constants'
import { navigate } from '../../utils/urlParams'
import getAddrFromReceipt from '../../utils/getAddrFromReceipt'

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

export const CreateConfirm = () => {
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

  const { cid } = router.query
  const { NEXT_PUBLIC_EXPLORER_URL: explorerUrl } = process.env

  if (msigError || !cid) {
    return (
      <Dialog>
        <ShadowBox>
          <h2>Safe creation failed</h2>
          <hr />
          <p>Something went wrong</p>
        </ShadowBox>
        <ErrorBox>
          {cid ? (
            <>
              <p>
                An error occurred while creating your safe. Click on the CID
                below to view the transaction in the Glif Explorer:
              </p>
              <p>
                <SmartLink href={`${explorerUrl}/message/?cid=${cid}`}>
                  {cid}
                </SmartLink>
              </p>
            </>
          ) : (
            'Missing CID for monitoring safe creation'
          )}
        </ErrorBox>
      </Dialog>
    )
  }

  if (Address) {
    return (
      <Dialog>
        <ShadowBox>
          <h2>Safe creation completed</h2>
          <hr />
          <p>Your new Safe address is:</p>
          <p>
            <SmartLink href={`${explorerUrl}/actor/?address=${Address}`}>
              {Address}
            </SmartLink>
          </p>
        </ShadowBox>
        <ButtonRowCenter>
          <ButtonV2
            large
            green
            onClick={() => navigate(router, { pageUrl: PAGE.MSIG_HOME })}
          >
            Go to Safe dashboard
          </ButtonV2>
        </ButtonRowCenter>
      </Dialog>
    )
  }

  return (
    <Dialog>
      <ShadowBox>
        <h2>Safe creation in progress</h2>
        <hr />
        <IconPending flexShrink='0' />
        <p>
          We&apos;re waiting for your transaction to confirm. Click on the
          transaction CID below to follow its progress in the Glif Explorer:
        </p>
        <p>
          <SmartLink href={`${explorerUrl}/message/?cid=${cid}`}>
            {cid}
          </SmartLink>
        </p>
        <p>
          Your new Safe address will show here once the transaction confirms.
        </p>
      </ShadowBox>
    </Dialog>
  )
}
