import { getActorCode } from '@glif/filecoin-actor-utils'
import {
  ActorDocument,
  AddressDocument,
  MessageReceipt,
  MessageReceiptDocument,
  MsigPendingDocument,
  Network
} from '@glif/react-components'
import {
  MULTISIG_ACTOR_ADDRESS,
  MULTISIG_SIGNER_ADDRESS,
  MULTISIG_SIGNER_ADDRESS_2,
  MULTISIG_SIGNER_ID,
  MULTISIG_SIGNER_ID_2,
  WALLET_ADDRESS,
  WALLET_ADDRESS_2,
  WALLET_ID,
  WALLET_ID_2
} from './constants'

export const addressMocks = [
  {
    request: {
      query: AddressDocument,
      variables: {
        address: MULTISIG_SIGNER_ID
      }
    },
    result: {
      data: {
        address: {
          robust: '',
          id: MULTISIG_SIGNER_ID
        }
      }
    }
  },
  {
    request: {
      query: AddressDocument,
      variables: {
        address: MULTISIG_SIGNER_ID_2
      }
    },
    result: {
      data: {
        address: {
          robust: '',
          id: MULTISIG_SIGNER_ID_2
        }
      }
    }
  },
  {
    request: {
      query: AddressDocument,
      variables: {
        address: MULTISIG_SIGNER_ADDRESS
      }
    },
    result: {
      data: {
        address: {
          robust: MULTISIG_SIGNER_ADDRESS,
          id: MULTISIG_SIGNER_ID
        }
      }
    }
  },
  {
    request: {
      query: AddressDocument,
      variables: {
        address: MULTISIG_SIGNER_ADDRESS_2
      }
    },
    result: {
      data: {
        address: {
          robust: MULTISIG_SIGNER_ADDRESS_2,
          id: MULTISIG_SIGNER_ID_2
        }
      }
    }
  }
]

export const mockReceipt = {
  exitCode: 0,
  return: 'gkMA1xJVAvKriskdpguj4VPi+gQa9hMsYso8',
  gasUsed: 8555837
} as MessageReceipt

export const EXEC_MSG_CID =
  'bafy2bzaced3ub5g4v35tj7n74zsog3dmcum4tk4qmchbhjx7q747jghal3l4g'

export const receiptMocks = [
  {
    request: {
      query: MessageReceiptDocument,
      variables: {
        cid: EXEC_MSG_CID
      }
    },
    result: {
      data: {
        receipt: mockReceipt
      }
    }
  }
]

const msigPendingMocks = [
  {
    request: {
      query: MsigPendingDocument,
      variables: {
        address: MULTISIG_ACTOR_ADDRESS
      }
    },
    result: {
      data: {
        msigPending: [
          {
            id: 2,
            to: {
              id: WALLET_ID_2,
              robust: WALLET_ADDRESS_2
            },
            value: '400000000000000000',
            method: 0,
            params: null,
            approved: [
              {
                id: WALLET_ID,
                robust: WALLET_ADDRESS
              }
            ],
            proposalHash: 'JyRolQNt12If0FMxrNMp0RmPUQ3pBrgsczCn9xdkt2w='
          }
        ]
      }
    }
  }
]

const actorQueryMocks = [
  {
    request: {
      query: ActorDocument,
      variables: {
        address: WALLET_ADDRESS_2
      }
    },
    result: {
      data: {
        actor: {
          Code: getActorCode('account', Network.CALIBRATION),
          Balance: '0',
          id: WALLET_ID_2
        }
      }
    }
  }
]

export const apolloMocks = [
  ...addressMocks,
  ...receiptMocks,
  ...msigPendingMocks,
  ...actorQueryMocks
]
