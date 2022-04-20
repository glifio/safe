import { Address, isAddrEqual } from '@glif/react-components'

export default async function isAddressSigner(
  walletAddress: string,
  signers: Address[]
): Promise<boolean> {
  return signers.some((signer) => isAddrEqual(signer, walletAddress))
}
