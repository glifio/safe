import { FilecoinNumber } from '@glif/filecoin-number'
import { getActorCode } from '@glif/filecoin-actor-utils'
// this breaks when import from regular react components
import { Network } from '../node_modules/@glif/react-components/dist/services/EnvironmentProvider'

export const WALLET_ADDRESS = 't1z225tguggx4onbauimqvxzutopzdr2m4s6z6wgi'
export const WALLET_ID = 't0101'
export const WALLET_ADDRESS_2 = 't1mbk7q6gm4rjlndfqw6f2vkfgqotres3fgicb2uq'
export const WALLET_ID_2 = 't0102'

// this is a premade multisig vesting actor
// if calibration net resets, these tests will fail
export const MULTISIG_ACTOR_ADDRESS =
  'f2m4f2dv7m35skytoqzsyrh5wqz3kxxfflxsha5za'
export const MULTISIG_ACTOR_ID = 't0201'

export const MULTISIG_SIGNER_ADDRESS = WALLET_ADDRESS
export const MULTISIG_SIGNER_ID = WALLET_ID
export const MULTISIG_SIGNER_ADDRESS_2 = WALLET_ADDRESS_2
export const MULTISIG_SIGNER_ID_2 = WALLET_ID_2

export const signers = [
  {
    robust: MULTISIG_SIGNER_ADDRESS,
    id: MULTISIG_SIGNER_ID
  },
  {
    robust: MULTISIG_SIGNER_ADDRESS_2,
    id: MULTISIG_SIGNER_ID_2
  }
]

export const mockStateGetActorRes = {
  Code: {
    '/': getActorCode('multisig', Network.CALIBRATION)
  },
  Balance: '80000000000'
}

const stateReadStateBaseRes = {
  Balance: new FilecoinNumber('1', 'fil').toAttoFil(),
  State: {
    InitialBalance: new FilecoinNumber('1', 'fil').toAttoFil(),
    NextTxnID: 2,
    NumApprovalsThreshold: 1,
    Signers: [],
    StartEpoch: 1000,
    UnlockDuration: 0
  }
}

export const mockStateReadStateSingleSignerRes = {
  ...stateReadStateBaseRes,
  State: {
    ...stateReadStateBaseRes.State,
    Signers: [MULTISIG_SIGNER_ID]
  }
}

export const mockStateReadStateDoubleSignerRes = {
  ...stateReadStateBaseRes,
  State: {
    ...stateReadStateBaseRes.State,
    Signers: [MULTISIG_SIGNER_ID, MULTISIG_SIGNER_ID_2]
  }
}
