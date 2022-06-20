import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import LotusRPCEngine from '@glif/filecoin-rpc-client'
import {
  IconPending,
  Dialog,
  ShadowBox,
  ButtonRowCenter,
  ButtonV2,
  SmartLink,
  ErrorBox,
  WarningBox,
  navigate,
  useWallet,
  useMessageQuery
} from '@glif/react-components'

import { useMsig } from '../../../MsigProvider'
import { PAGE } from '../../../constants'
import { getAddrFromReceipt } from '../../../utils/getAddrFromReceipt'

interface Receipt {
  ExitCode: number
  GasUsed: number
  Return: string
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const recursivelyGetReceipt = async (
  apiAddress: string,
  cid: string,
  waitTime: number = 5000
): Promise<Receipt> => {
  await sleep(waitTime)
  const lCli = new LotusRPCEngine({ apiAddress })
  const receipt = await lCli.request<Receipt>(
    'StateGetReceipt',
    { '/': cid },
    null
  )

  if (receipt) return receipt

  // recursively, linearly ease off
  return recursivelyGetReceipt(apiAddress, cid, waitTime + 1000)
}

export const CreateConfirm = () => {
  const router = useRouter()
  const { cid } = router.query
  const { setMsigActor, Address } = useMsig()
  const wallet = useWallet()

  // Confirmation state
  const [fetchingReceipt, setFetchingReceipt] = useState<boolean>(false)
  const [receiptError, setReceiptError] = useState<boolean>(false)
  const [creationError, setCreationError] = useState<boolean>(false)

  // Get environment variables
  const { NEXT_PUBLIC_EXPLORER_URL: explorerUrl } = process.env
  const { NEXT_PUBLIC_LOTUS_NODE_JSONRPC: apiAddress } = process.env

  // Get the message by cid
  const { data: messageData, error: messageError } = useMessageQuery({
    variables: { cid: cid as string },
    pollInterval: 5000,
    skip: !cid
  })

  // Decode the receipt after receiving the message
  useEffect(() => {
    if (messageData?.message && !fetchingReceipt) {
      setFetchingReceipt(true)
      recursivelyGetReceipt(apiAddress, cid as string)
        .then((receipt) => {
          if (receipt) {
            try {
              // Verify the exit code
              if (receipt.ExitCode !== 0)
                throw new Error('Safe creation failed')

              // Verify the safe address
              const { robust } = getAddrFromReceipt(receipt.Return)
              if (!robust) throw new Error('Failed to get address from receipt')

              // Set the safe address
              setMsigActor(robust)
            } catch (e) {
              setCreationError(true)
            } finally {
              setFetchingReceipt(false)
            }
          }
        })
        .catch(() => setReceiptError(true))
    }
  }, [
    messageData?.message,
    apiAddress,
    cid,
    setMsigActor,
    fetchingReceipt,
    setFetchingReceipt
  ])

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

  // Something went wrong while retrieving the message or receipt
  if (messageError || receiptError) {
    return (
      <Dialog>
        <ShadowBox>
          <h2>Safe creation status unknown</h2>
          <hr />
          <p>Something went wrong</p>
        </ShadowBox>
        <ErrorBox>
          <p>
            An error occurred while retrieving the status of your safe creation,
            please refresh the page.
          </p>
        </ErrorBox>
      </Dialog>
    )
  }

  // Something went wrong while creating the safe
  if (creationError) {
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
        <WarningBox>
          Please make sure to store your Safe address before continuing to
          prevent losing access to your Safe.
        </WarningBox>
        <ButtonRowCenter>
          {wallet.address ? (
            <ButtonV2
              large
              green
              onClick={() => navigate(router, { pageUrl: PAGE.MSIG_HOME })}
            >
              Go to the Safe dashboard
            </ButtonV2>
          ) : (
            <ButtonV2
              large
              green
              onClick={() => navigate(router, { pageUrl: PAGE.LANDING })}
            >
              Connect your wallet to open the Safe
            </ButtonV2>
          )}
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
