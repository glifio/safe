import React, { useCallback, useState } from 'react'
import { Box, Title, ButtonV2, Tooltip } from '@glif/react-components'
import {
  useWallet,
  useWalletProvider,
  reportLedgerConfigError
} from '@glif/wallet-provider-react'
import { useRouter } from 'next/router'

import { PAGE } from '../../../constants'
import { Address, Signers, MsigPageWrapper } from '../Shared'
import { navigate } from '../../../utils/urlParams'
import { useMsig } from '../../../MsigProvider'

const ShowOnDevice = ({ ledgerErr, shouldView, onShowOnLedger }) => {
  if (ledgerErr)
    return (
      <ButtonV2 ml={3} onClick={onShowOnLedger} disabled>
        Ledger Device Error
      </ButtonV2>
    )
  if (shouldView)
    return (
      <ButtonV2 ml={3} onClick={onShowOnLedger} disabled>
        Check Ledger Device
      </ButtonV2>
    )
  return (
    <ButtonV2 ml={3} onClick={onShowOnLedger}>
      View on Device
    </ButtonV2>
  )
}

export default function Owners() {
  const router = useRouter()
  const { NumApprovalsThreshold, Signers: signers } = useMsig()
  const wallet = useWallet()
  const { ledger, connectLedger, loginOption } = useWalletProvider()
  const [ledgerBusy, setLedgerBusy] = useState(false)
  const onShowOnLedger = useCallback(async () => {
    setLedgerBusy(true)
    const provider = await connectLedger()
    if (provider) await provider.wallet.showAddressAndPubKey(wallet.path)
    setLedgerBusy(false)
  }, [setLedgerBusy, connectLedger, wallet.path])

  const ledgerErr = reportLedgerConfigError({
    ...ledger
  })

  return (
    <MsigPageWrapper>
      <Box
        display='flex'
        flexWrap='wrap'
        justifyContent='center'
        width='100%'
        maxWidth={18}
        margin='0 auto'
      >
        <Box width='100%'>
          <Box
            display='flex'
            flexWrap='wrap'
            my={6}
            flexDirection='row'
            alignItems='center'
          >
            <Title display='inline-flex' alignItems='center'>
              Required Approvals:
            </Title>
            <Title
              display='inline-flex'
              alignItems='center'
              ml={3}
              css={`
                font-weight: 800;
              `}
            >
              {`${NumApprovalsThreshold.toString()}`}
            </Title>
            <Box
              display='flex'
              flexWrap='wrap'
              flexDirection='row'
              alignItems='flex-start'
            >
              <ButtonV2
                ml={3}
                onClick={() => {
                  navigate(router, {
                    pageUrl: PAGE.MSIG_CHANGE_APPROVAL_THRESHOLD
                  })
                }}
              >
                Edit
              </ButtonV2>
              <Tooltip content='The number of approvals required for a Safe proposal to execute.' />
            </Box>
          </Box>
          <Box
            position='relative'
            display='flex'
            flexWrap='wrap'
            alignItems='center'
          >
            <Title>Signers</Title>
            <Box display='flex' flexDirection='row' alignItems='flex-start'>
              <ButtonV2
                ml={3}
                onClick={() => {
                  navigate(router, { pageUrl: PAGE.MSIG_ADD_SIGNER })
                }}
              >
                Add Signer
              </ButtonV2>
              <Tooltip content='These are the Filecoin addresses that can approve and reject proposals from your Safe.' />
            </Box>
          </Box>
          <Box
            position='relative'
            display='flex'
            flexWrap='wrap'
            mt={3}
            alignItems='center'
          >
            <Address
              address={wallet.address}
              glyphAcronym='1'
              label='Signer 1 - You'
            />
            {loginOption === 'LEDGER' && (
              <ShowOnDevice
                onClick={onShowOnLedger}
                shouldView={ledgerBusy}
                {...ledgerErr}
              />
            )}
          </Box>
          <Signers signers={signers} walletAddress={wallet.address} />
        </Box>
      </Box>
    </MsigPageWrapper>
  )
}
