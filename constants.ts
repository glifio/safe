/* WALLET TYPES */
export const HD_WALLET = 'HD_WALLET'
export const SINGLE_KEY = 'SINGLE_KEY'

/* LOGIN OPTIONS */
export const IMPORT_MNEMONIC = 'IMPORT_MNEMONIC'
export const CREATE_MNEMONIC = 'CREATE_MNEMONIC'
export const IMPORT_SINGLE_KEY = 'IMPORT_SINGLE_KEY'

export const LEDGER = 'LEDGER'
export const METAMASK = 'METAMASK'

/* API ENDPOINTS */
export const FILSCAN = 'https://api.filscan.io:8700/v0/filscan'
export const FILSCAN_JSONRPC = 'https://api.filscan.io:8700/rpc/v1'
export const FILSCOUT = 'https://filscoutv3api.ipfsunion.cn'
export const FILFOX = 'https://filfox.info/api'

/* NETWORK VARS */
export const MAINNET = 'f'
export const TESTNET = 't'

export const GLIF_DISCORD = 'https://discord.gg/B9ju5Eu4Rq'
export const GLIF_TWITTER = 'https://twitter.com/glifio'

export const MAINNET_PATH_CODE = 461
export const TESTNET_PATH_CODE = 1

export const EXEC_ACTOR = 'f01'

/* FILECOIN APP VERSION MIN */
export const LEDGER_VERSION_MAJOR = 0
export const LEDGER_VERSION_MINOR = 18
export const LEDGER_VERSION_PATCH = 2

/* QUERY PARAMS */
export enum QPARAM {
  MSIG_ADDRESS = 'safe-id'
}

/* PAGES */
/* eslint-disable no-unused-vars */
export enum PAGE {
  SPEED_UP = '/speed-up',
  MSIG_HOME = '/home',
  MSIG_HISTORY = '/history',
  MSIG_PROPOSALS = '/proposals',
  MSIG_PROPOSAL = '/proposal',
  MSIG_ADMIN = '/admin',
  MSIG_WITHDRAW = '/withdraw',
  MSIG_APPROVE = '/approve',
  MSIG_CANCEL = '/cancel',
  MSIG_CHANGE_SIGNER = '/change-signer',
  MSIG_REMOVE_SIGNER = '/remove-signer',
  MSIG_ADD_SIGNER = '/add-signer',
  MSIG_CHANGE_APPROVALS = '/change-approvals',
  MSIG_CREATE_CONFIRM = '/create/confirm',
  MSIG_CREATE = '/create',
  MSIG_CHOOSE = '/choose',
  MSIG_CHOOSE_ACCOUNTS = '/accounts',
  CONNECT_LEDGER = '/connect/ledger',
  CONNECT_METAMASK = '/connect/metamask',
  NODE_DISCONNECTED = '/error/node-disconnected',
  LANDING = '/'
}
/* eslint-enable */
