import { Address, isAddrEqual } from '@glif/react-components'

export const isAddressSigner = (address: string, signers: Address[]): boolean =>
  signers.some((signer) => isAddrEqual(signer, address))
