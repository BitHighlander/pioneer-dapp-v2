import * as bip39 from 'bip39'
import * as hdkey from 'hdkey'
import TronLib from '@/lib/TronLib'

export let tronWeb1: TronLib
export let tronWeb2: TronLib
export let tronWallets: Record<string, TronLib>
export let tronAddresses: string[]

let address1: string
let address2: string

/**
 * Utilities
 */
export async function createOrRestoreTronWallet(seedPhrase: string) {
  const deriveTronPrivateKey = (mnemonic: string, derivationPath: string) => {
    const seed = bip39.mnemonicToSeedSync(mnemonic)
    const root = hdkey.fromMasterSeed(seed)
    const node = root.derive(derivationPath)
    return node.privateKey.toString('hex')
  }

  if (!seedPhrase) {
    throw new Error('seedPhrase not provided')
  }

  // Use standard derivation paths
  const derivationPath1 = "m/44'/195'/0'/0/0"
  const derivationPath2 = "m/44'/195'/0'/0/1"
  const privateKey1 = deriveTronPrivateKey(seedPhrase, derivationPath1)
  const privateKey2 = deriveTronPrivateKey(seedPhrase, derivationPath2)

  tronWeb1 = await TronLib.init({ privateKey: privateKey1 })
  tronWeb2 = await TronLib.init({ privateKey: privateKey2 })

  address1 = tronWeb1.getAddress()
  address2 = tronWeb2.getAddress()

  tronWallets = {
    [address1]: tronWeb1,
    [address2]: tronWeb2
  }

  tronAddresses = Object.keys(tronWallets)

  return {
    tronWallets,
    tronAddresses
  }
}
