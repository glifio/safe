import { useCallback } from 'react'
import { useRouter } from 'next/router'
import { NavLink, Box, Title, IconGlif } from '@glif/react-components'
import { Address } from '../Shared'
import { PAGE } from '../../../constants'
import { generateRouteWithRequiredUrlParams } from '../../../utils/urlParams'
import { ADDRESS_PROPTYPE } from '../../../customPropTypes'

const PageHeader = ({
  msigAddress,
  walletAddress
}: {
  msigAddress: string
  walletAddress: string
}) => {
  const router = useRouter()
  const getRoute = useCallback(generateRouteWithRequiredUrlParams, [
    router.query
  ])
  return (
    <Box mb={6}>
      <Box display='flex' alignItems='center' position='absolute'>
        <IconGlif
          size={6}
          css={`
            transform: rotate(-90deg);
          `}
        />
        <Title ml={2}>Safe</Title>
      </Box>
      <Box
        display='flex'
        alignItems='center'
        flexDirection='row'
        justifyContent='space-between'
        mb={3}
      >
        <Box
          display='flex'
          alignItems='flex-start'
          flexDirection='row'
          mx='auto'
        >
          <NavLink
            href={getRoute({
              existingQParams: router.query as Record<string, string>,
              pageUrl: PAGE.MSIG_HOME
            })}
            isActive={router.pathname === PAGE.MSIG_HOME}
            mr={3}
          >
            Assets
          </NavLink>
          <NavLink
            href={getRoute({
              existingQParams: router.query as Record<string, string>,
              pageUrl: PAGE.MSIG_HISTORY
            })}
            isActive={router.pathname === PAGE.MSIG_HISTORY}
            mr={3}
          >
            History
          </NavLink>
          <NavLink
            href={getRoute({
              existingQParams: router.query as Record<string, string>,
              pageUrl: PAGE.MSIG_PROPOSALS
            })}
            isActive={
              router.pathname === PAGE.MSIG_PROPOSALS ||
              router.pathname.includes(PAGE.MSIG_PROPOSAL)
            }
            mr={3}
          >
            Proposals
          </NavLink>
          <NavLink
            href={getRoute({
              existingQParams: router.query as Record<string, string>,
              pageUrl: PAGE.MSIG_ADMIN
            })}
            isActive={router.pathname === PAGE.MSIG_ADMIN}
            mr={3}
          >
            Admin
          </NavLink>
          <Box>
            <Address
              label='Multisig Address'
              address={msigAddress}
              glyphAcronym='Ms'
            />
            <Address
              label='Wallet Address'
              address={walletAddress}
              glyphAcronym='Wa'
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

PageHeader.propTypes = {
  msigAddress: ADDRESS_PROPTYPE,
  walletAddress: ADDRESS_PROPTYPE
}

export default PageHeader
