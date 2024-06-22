import PolkadotLib from '@/lib/PolkadotLib'
import { addressEq } from '@polkadot/util-crypto'

export let wallet1: PolkadotLib
export let wallet2: PolkadotLib
export let polkadotWallets: Record<string, PolkadotLib>
export let polkadotAddresses: string[]

let address1: string
let address2: string

/**
 * Utilities
 */
export function getPolkadotWallet(address: string) {
  let wallet = Object.entries(polkadotWallets).find(([walletAddress, _]) => {
    return addressEq(address, walletAddress)
  })
  return wallet?.[1]
}

export async function createOrRestorePolkadotWallet(seedPhrase: any) {
  const mnemonic1 = seedPhrase

  if (mnemonic1) {
    wallet1 = await PolkadotLib.init({ mnemonic: seedPhrase })
    // wallet2 = await PolkadotLib.init({ mnemonic: seedPhrase })
  } else {
    throw Error('Mnemonic not found')
  }

  address1 = wallet1.getAddress()
  // address2 = wallet2.getAddress()

  polkadotWallets = {
    [address1]: wallet1,
    // [address2]: wallet2
  }
  polkadotAddresses = Object.keys(polkadotWallets)

  return {
    polkadotWallets,
    polkadotAddresses
  }
}
