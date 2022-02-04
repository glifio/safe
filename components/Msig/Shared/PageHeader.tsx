import { useCallback } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import {
  NavLink,
  Box,
  Title,
  IconGlif,
  Label,
  CopyText
} from '@glif/react-components'
import { PAGE } from '../../../constants'
import { generateRouteWithRequiredUrlParams } from '../../../utils/urlParams'
import { ADDRESS_PROPTYPE } from '../../../customPropTypes'
import truncateAddress from '../../../utils/truncateAddress'

const A = styled.a`
  color: ${(props) => props.theme.colors.core.primary};
  text-decoration: none;
  text-wrap: overflow;

  &:hover {
    text-decoration: underline;
  }
`

const Address = ({ address, label }: { address: string; label: string }) => {
  return (
    <Box
      display='flex'
      alignItems='center'
      justifyContent='flex-start'
      color='core.darkgray'
      height={6}
      borderRadius={2}
      mb={1}
    >
      <Box pl={3}>
        <Label fontSize={1}>{label}</Label>
        <Box display='flex' flexDirection='row'>
          <A
            href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/address/${address}`}
            target='_blank'
            rel='noopenner noreferrer'
          >
            {truncateAddress(address)}
          </A>
          <CopyText color='core.nearblack' text={address} hideCopyText />
        </Box>
      </Box>
    </Box>
  )
}

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
      <Box position='absolute'>
        <Box display='flex' alignItems='center'>
          <IconGlif
            size={6}
            css={`
              transform: rotate(-90deg);
            `}
          />
          <Title ml={2}>Safe</Title>
        </Box>
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
          <Box display='flex' flexDirection='row' mt={1}>
            <Address label='Safe Address' address={msigAddress} />
            <Address label='Wallet Address' address={walletAddress} />
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
