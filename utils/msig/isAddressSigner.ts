import { Address, isAddrEqual } from '@glif/react-components'

export default function isAddressSigner(
  walletAddress: string,
  signers: Address[]
): boolean {
  return signers.some((signer) => isAddrEqual(signer, walletAddress))
}
