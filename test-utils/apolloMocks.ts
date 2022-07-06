import {
  AddressDocument,
  MessageReceipt,
  MessageReceiptDocument
} from '@glif/react-components'
import {
  MULTISIG_SIGNER_ADDRESS,
  MULTISIG_SIGNER_ADDRESS_2,
  MULTISIG_SIGNER_ID,
  MULTISIG_SIGNER_ID_2
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

export const apolloMocks = [...addressMocks, ...receiptMocks]
