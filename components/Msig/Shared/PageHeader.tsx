import styled from 'styled-components'
import { Box, Label, CopyText } from '@glif/react-components'
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
  return (
    <Box display='flex' flexDirection='row' mt={1} mb={3}>
      <Address label='Safe Address' address={msigAddress} />
      <Address label='Wallet Address' address={walletAddress} />
    </Box>
  )
}

PageHeader.propTypes = {
  msigAddress: ADDRESS_PROPTYPE,
  walletAddress: ADDRESS_PROPTYPE
}

export default PageHeader
