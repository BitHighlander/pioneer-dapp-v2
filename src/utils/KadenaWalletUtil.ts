import * as bip39 from 'bip39'
import { derivePath } from 'ed25519-hd-key'
import KadenaLib from '@/lib/KadenaLib'

export let wallet: KadenaLib
export let kadenaWallets: Record<string, KadenaLib>
export let kadenaAddresses: string[]

/**
 * Utilities
 */
export async function createOrRestoreKadenaWallet(seedPhrase: string) {
  const deriveKadenaKey = (mnemonic: string, derivationPath: string) => {
    const seed = bip39.mnemonicToSeedSync(mnemonic)
    const derivedSeed = derivePath(derivationPath, seed.toString('hex')).key
    return derivedSeed.toString('hex')
  }

  if (!seedPhrase) {
    throw new Error('seedPhrase not provided')
  }

  // Use a standard derivation path
  const derivationPath = "m/44'/626'/0'/0/0"
  const secretKey = deriveKadenaKey(seedPhrase, derivationPath)

  wallet = KadenaLib.init({ secretKey })

  const address = wallet.getAddress()
  kadenaAddresses = [address]

  kadenaWallets = {
    [address]: wallet
  }

  return {
    kadenaWallets,
    kadenaAddresses
  }
}
