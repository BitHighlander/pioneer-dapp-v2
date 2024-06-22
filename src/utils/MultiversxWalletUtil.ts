import MultiversxLib from '@/lib/MultiversxLib'

export let wallet1: MultiversxLib
export let wallet2: MultiversxLib
export let multiversxWallets: Record<string, MultiversxLib>
export let multiversxAddresses: string[]

let address1: string
let address2: string

/**
 * Utilities
 */
export async function createOrRestoreMultiversxWallet(seedPhrase) {
  if (seedPhrase) {
    wallet1 = await MultiversxLib.init({ mnemonic: seedPhrase })
  } else {
    throw Error('Mnemonic not found')
  }

  address1 = await wallet1.getAddress()
  // address2 = await wallet2.getAddress()

  multiversxWallets = {
    [address1]: wallet1,
    // [address2]: wallet2
  }
  multiversxAddresses = Object.keys(multiversxWallets)

  return {
    multiversxWallets,
    multiversxAddresses
  }
}
