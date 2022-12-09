import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import {
  getQueryParam,
  IconPending,
  Dialog,
  ShadowBox,
  ButtonRowCenter,
  ButtonV2Link,
  SmartLink,
  ErrorBox,
  WarningBox,
  useWallet,
  getAddrFromReceipt,
  useMessageReceiptQuery,
  useEnvironment
} from '@glif/react-components'

import { useMsig } from '../../MsigProvider'
import { PAGE, QPARAM } from '../../constants'

export const CreateConfirm = () => {
  const router = useRouter()
  const cid = getQueryParam.string(router, 'cid')
  const { setMsigActor, Address } = useMsig()
  const wallet = useWallet()
  const { coinType, explorerUrl } = useEnvironment()

  // Confirmation state
  const [creationError, setCreationError] = useState<boolean>(false)

  // Get the message receipt
  const { data: messageReceiptQuery, error: _messageReceiptError } =
    useMessageReceiptQuery({
      variables: { cid },
      pollInterval: 5000
    })

  const messageReceiptError = useMemo(() => {
    if (
      _messageReceiptError &&
      _messageReceiptError.message.includes("didn't find msg")
    ) {
      return null
    }
    return _messageReceiptError
  }, [_messageReceiptError])

  // Decode the receipt after receiving the message
  useEffect(() => {
    const receipt = messageReceiptQuery?.receipt
    if (!!receipt?.return) {
      try {
        // Verify the exit code
        if (receipt.exitCode !== 0) throw new Error('Safe creation failed')

        // Verify the safe address
        const { robust } = getAddrFromReceipt(receipt.return, coinType)
        if (!robust) throw new Error('Failed to get address from receipt')

        // Set the safe address
        setMsigActor(robust)
      } catch (e) {
        setCreationError(true)
      }
    }
  }, [messageReceiptQuery?.receipt, setMsigActor, coinType])

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

  // Something went wrong while retrieving the message
  if (messageReceiptError) {
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
            <SmartLink href={`${explorerUrl}/tx/${cid}`}>{cid}</SmartLink>
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
            <SmartLink href={`${explorerUrl}/address/${Address}`}>
              {Address}
            </SmartLink>
          </p>
        </ShadowBox>
        <WarningBox>
          Please make sure to store your Safe address before continuing.
        </WarningBox>
        <ButtonRowCenter>
          {wallet.robust || wallet.id ? (
            <ButtonV2Link large green href={PAGE.MSIG_HOME}>
              Go to the Safe dashboard
            </ButtonV2Link>
          ) : (
            <ButtonV2Link
              large
              green
              href={PAGE.LANDING}
              params={{
                [QPARAM.MSIG_ADDRESS]: Address
              }}
            >
              Connect your wallet to open the Safe
            </ButtonV2Link>
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
        <IconPending height='2em' />
        <p>
          We&apos;re waiting for your transaction to confirm. Click on the
          transaction CID below to follow its progress in the Glif Explorer:
        </p>
        <p>
          <SmartLink href={`${explorerUrl}/tx/${cid}`}>{cid}</SmartLink>
        </p>
        <p>
          Your new Safe address will show here once the transaction confirms.
        </p>
      </ShadowBox>
    </Dialog>
  )
}
