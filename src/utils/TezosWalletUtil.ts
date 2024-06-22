import TezosLib from '@/lib/TezosLib'

export let wallet1: TezosLib
export let wallet2: TezosLib
export let tezosWallets: Record<string, TezosLib>
export let tezosAddresses: string[]

let address1: string
let address2: string

/**
 * Utilities
 */
export function getTezosWallet(address: string) {
  let wallet = Object.entries(tezosWallets).find(([walletAddress, _]) => {
    return address === walletAddress
  })
  return wallet?.[1]
}

export async function createOrRestoreTezosWallet(seedPhrase) {
  const mnemonic1 = seedPhrase

  if (mnemonic1) {
    wallet1 = await TezosLib.init({ mnemonic: mnemonic1 })
  } else {
    throw Error('seedPhrase not found')
  }

  address1 = wallet1.getAddress()
  // address2 = wallet2.getAddress()

  tezosWallets = {
    [address1]: wallet1,
    // [address2]: wallet2
  }
  tezosAddresses = Object.keys(tezosWallets)

  return {
    tezosWallets,
    tezosAddresses
  }
}
