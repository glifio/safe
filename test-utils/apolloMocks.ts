import { AddressDocument } from '@glif/react-components'
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
