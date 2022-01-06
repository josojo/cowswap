import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { SupportedChainId } from 'constants/chains'
import { V_COW } from 'constants/tokens'
import {
  CLAIMS_REPO,
  ClaimType,
  FREE_CLAIM_TYPES,
  PAID_CLAIM_TYPES,
  RepoClaims,
  REVERSE_CLAIM_TYPE_MAPPING,
  UserClaims,
} from 'state/claim/hooks/index'

/**
 * Helper function to check whether any claim is an investment option
 *
 * @param claims
 */
export function hasPaidClaim(claims: UserClaims | null): boolean {
  return Boolean(claims?.some((claim) => PAID_CLAIM_TYPES.includes(claim.type)))
}

/**
 * Helper function to check whether any claim is an airdrop option
 *
 * @param claims
 */
export function hasFreeClaim(claims: UserClaims | null): boolean {
  return Boolean(claims?.some((claim) => FREE_CLAIM_TYPES.includes(claim.type)))
}

/**
 * Helper function to transform data as coming from the airdrop claims repo onto internal types
 *
 * Namely, converting types from their string representations to the enum numbers:
 * Airdrop -> 0
 */
export function transformRepoClaimsToUserClaims(repoClaims: RepoClaims): UserClaims {
  return repoClaims.map((claim) => ({ ...claim, type: REVERSE_CLAIM_TYPE_MAPPING[claim.type] }))
}

/**
 * Helper function to return an array of investment option claims
 *
 * @param claims
 */
export function getPaidClaims(claims: UserClaims): UserClaims {
  return claims?.filter((claim) => PAID_CLAIM_TYPES.includes(claim.type))
}

/**
 * Helper function to return an array of free claims
 *
 * @param claims
 */
export function getFreeClaims(claims: UserClaims): UserClaims {
  return claims?.filter((claim) => FREE_CLAIM_TYPES.includes(claim.type))
}

/**
 * Helper function to transform claim data amount to CurrencyAmount
 *
 */
export function parseClaimAmount(value: string, chainId: number | undefined): CurrencyAmount<Token> | undefined {
  const vCow = chainId ? V_COW[chainId || 4] : undefined
  if (!vCow || !value) return undefined
  return CurrencyAmount.fromRawAmount(vCow, value)
}

export type TypeToCurrencyMapper = {
  [key: string]: string
}

/**
 * Helper function to transform claim data type to coin name that can be displayed in the UI
 *
 * @param chainId
 */
export function getTypeToCurrencyMap(chainId: number | undefined): TypeToCurrencyMapper {
  if (!chainId) return {}

  const map: TypeToCurrencyMapper = {
    [ClaimType.GnoOption]: 'GNO',
    [ClaimType.Investor]: 'USDC',
    [ClaimType.UserOption]: '',
  }

  if ([SupportedChainId.MAINNET, SupportedChainId.RINKEBY].includes(chainId)) {
    map[ClaimType.UserOption] = 'ETH'
  }

  if (chainId === SupportedChainId.XDAI) {
    map[ClaimType.UserOption] = 'XDAI'
  }

  return map
}

export type TypeToPriceMapper = {
  [key: string]: number
}

/**
 * Helper function to get vCow price based on claim type and chainId
 *
 * @param type
 */
export function getTypeToPriceMap(): TypeToPriceMapper {
  // Hardcoded values
  const map: TypeToPriceMapper = {
    [ClaimType.GnoOption]: 16.66,
    [ClaimType.Investor]: 26.66,
    [ClaimType.UserOption]: 36.66,
  }

  return map
}

/**
 * Helper function to check if current type is free claim
 *
 * @param type
 */
export function isFreeClaim(type: ClaimType): boolean {
  return FREE_CLAIM_TYPES.includes(type)
}

/**
 * Helper function to return an array of indexes from claim data
 *
 * @param type
 */
export function getIndexes(data: UserClaims): number[] {
  return data.map(({ index }) => index)
}

/**
 * Helper function to get the repo path for the corresponding network id
 * Throws when passed an unknown network id
 */
export function getClaimsRepoPath(id: number): string {
  return `${CLAIMS_REPO}${_repoNetworkIdMapping(id)}/`
}

function _repoNetworkIdMapping(id: number): string {
  switch (id) {
    case 1:
      return 'mainnet'
    case 4:
      return 'rinkeby'
    case 100:
      return 'gnosis-chain'
    default:
      throw new Error('Network not supported')
  }
}

/**
 * Helper function to get the claim key based on account and chainId
 */
export function getClaimKey(account: string, chainId: number): string {
  return `${chainId}:${account}`
}