import { Keypair } from '@solana/web3.js'
import * as bip39 from 'bip39'
import { derivePath } from 'ed25519-hd-key'
import SolanaLib from '@/lib/SolanaLib'

export let wallet1: SolanaLib
export let wallet2: SolanaLib
export let solanaWallets: Record<string, SolanaLib>
export let solanaAddresses: string[]

let address1: string
let address2: string

/**
 * Utilities
 */
export async function createOrRestoreSolanaWallet(seedPhrase: string) {
  const deriveSolanaKey = (mnemonic: string, derivationPath: string) => {
    const seed = bip39.mnemonicToSeedSync(mnemonic)
    const derivedSeed = derivePath(derivationPath, seed.toString('hex')).key
    return Keypair.fromSeed(derivedSeed.slice(0, 32))
  }

  if (!seedPhrase) {
    throw new Error('seedPhrase not provided')
  }

  // Use standard Solana derivation paths
  const derivationPath1 = "m/44'/501'/0'/0'"
  const derivationPath2 = "m/44'/501'/1'/0'"
  const keypair1 = deriveSolanaKey(seedPhrase, derivationPath1)
  const keypair2 = deriveSolanaKey(seedPhrase, derivationPath2)

  wallet1 = SolanaLib.init({ secretKey: keypair1.secretKey })
  wallet2 = SolanaLib.init({ secretKey: keypair2.secretKey })

  address1 = await wallet1.getAddress()
  address2 = await wallet2.getAddress()

  solanaWallets = {
    [address1]: wallet1,
    [address2]: wallet2
  }
  solanaAddresses = Object.keys(solanaWallets)

  return {
    solanaWallets,
    solanaAddresses
  }
}
