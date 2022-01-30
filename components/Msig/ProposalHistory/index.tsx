import React from 'react'
import {
  Box,
  ProposalDetail,
  ProposalHistoryTable,
  ButtonClose,
  MsigTransaction
} from '@glif/react-components'
import { useWallet } from '@glif/wallet-provider-react'
import { useRouter } from 'next/router'

import { MsigPageWrapper } from '../Shared'
import { useMsig } from '../../../MsigProvider'
import { navigate } from '../../../utils/urlParams'
import { PAGE } from '../../../constants'

const ProposalHistory = () => {
  const { Address } = useMsig()
  const wallet = useWallet()
  const router = useRouter()
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
        {router.query.id && router.query.address ? (
          <Box display='flex' flexDirection='row'>
            <ProposalDetail
              id={Number(router.query.id)}
              address={Address}
              walletAddress={wallet.address}
              accept={(
                proposal: MsigTransaction,
                approvalsUntilExecution: number
              ) => {
                const clone = { ...proposal, approvalsUntilExecution }
                delete clone.__typename
                navigate(router, {
                  pageUrl: PAGE.MSIG_APPROVE,
                  newQueryParams: {
                    proposal: encodeURI(JSON.stringify(clone))
                  }
                })
              }}
              cancel={(
                proposal: MsigTransaction,
                approvalsUntilExecution: number
              ) => {
                const clone = { ...proposal, approvalsUntilExecution }
                delete clone.__typename
                navigate(router, {
                  pageUrl: PAGE.MSIG_CANCEL,
                  newQueryParams: {
                    proposal: encodeURI(JSON.stringify(clone))
                  }
                })
              }}
              addressHref={(address: string) =>
                `https://messenger.glif.io/${address}`
              }
            />
            <ButtonClose
              alignSelf='flex-start'
              ml={7}
              pt={4}
              onClick={router.back}
            />
          </Box>
        ) : (
          <ProposalHistoryTable
            address={Address}
            idHref={(id: number) =>
              `${PAGE.MSIG_PROPOSAL}?id=${id}&address=${Address}`
            }
          />
        )}
      </Box>
    </MsigPageWrapper>
  )
}

export default ProposalHistory
