import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import confirmMessage from '@glif/filecoin-message-confirmer'
import LotusRPCEngine from '@glif/filecoin-rpc-client'
import {
  IconPending,
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

export const CreateConfirm = () => {
  const [msigError, setMsigError] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const { setMsigActor, Address } = useMsig()
  const router = useRouter()
  const { cid } = router.query
  const { NEXT_PUBLIC_EXPLORER_URL: explorerUrl } = process.env
  const { NEXT_PUBLIC_LOTUS_NODE_JSONRPC: apiAddress } = process.env

  const confirm = useCallback(async () => {
    try {
      const confirmed = await confirmMessage(cid as string, { apiAddress })
      if (confirmed) {
        const lCli = new LotusRPCEngine({ apiAddress })
        const receipt = await lCli.request<{
          ExitCode: number
          GasUsed: number
          Return: string
        }>('StateGetReceipt', { '/': cid }, null)

        // Verify exit code
        if (receipt.ExitCode !== 0) {
          setMsigError(true)
          return
        }

        // Verify address
        const { robust } = getAddrFromReceipt(receipt.Return)
        if (!robust) {
          setMsigError(true)
          return
        }

        // Set safe address
        setMsigActor(robust)
      }
    } catch (e) {
      setMsigError(true)
    }
  }, [cid, apiAddress, setMsigActor])

  useEffect(() => {
    if (!Address && !confirming && cid) {
      setConfirming(true)
      confirm()
    }
  }, [cid, Address, confirming, setConfirming, confirm])

  // CID was not provided in query parameters
  if (!cid) {
    return (
      <Dialog>
        <ShadowBox>
          <h2>Safe creation status unknown</h2>
          <hr />
          <p>Missing CID for monitoring safe creation</p>
        </ShadowBox>
      </Dialog>
    )
  }

  // Something went wrong while creating the safe
  if (msigError) {
    return (
      <Dialog>
        <ShadowBox>
          <h2>Safe creation failed</h2>
          <hr />
          <p>Something went wrong</p>
        </ShadowBox>
        <ErrorBox>
          <p>
            An error occurred while creating your safe. Click on the CID below
            to view the transaction in the Glif Explorer:
          </p>
          <p>
            <SmartLink href={`${explorerUrl}/message/?cid=${cid}`}>
              {cid}
            </SmartLink>
          </p>
        </ErrorBox>
      </Dialog>
    )
  }

  // The safe has been successfully created
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

  // The safe creation is in progress
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
