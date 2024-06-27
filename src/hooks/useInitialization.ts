//use-client;
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSnapshot } from 'valtio';
import SettingsStore from '@/store/SettingsStore';
import { createOrRestoreCosmosWallet } from '@/utils/CosmosWalletUtil';
import { createOrRestoreEIP155Wallet } from '@/utils/EIP155WalletUtil';
import { createOrRestoreSolanaWallet } from '@/utils/SolanaWalletUtil';
import { createOrRestorePolkadotWallet } from '@/utils/PolkadotWalletUtil';
import { createOrRestoreNearWallet } from '@/utils/NearWalletUtil';
import { createOrRestoreMultiversxWallet } from '@/utils/MultiversxWalletUtil';
import { createOrRestoreTronWallet } from '@/utils/TronWalletUtil';
import { createOrRestoreTezosWallet } from '@/utils/TezosWalletUtil';
import { createWeb3Wallet, web3wallet } from '@/utils/WalletConnectUtil';
import { createOrRestoreKadenaWallet } from '@/utils/KadenaWalletUtil';
import useSmartAccounts from '@/hooks/useSmartAccounts';
const TAG = ' | hooks/useInitialization | '

const useInitialization = (seedPhrase: string | null, onInitialized: (status: boolean) => void, usePioneer: any) => {
    const { state } = usePioneer();
    const { app } = state;
    const [initialized, setInitialized] = useState(false);
    const prevRelayerURLValue = useRef<string>('');
    const { relayerRegionURL } = useSnapshot(SettingsStore.state);
    const { initializeSmartAccounts } = useSmartAccounts();

    const onInitialize = useCallback(async () => {
        let tag = TAG + ' | onInitialize | '
        try {
            console.log(tag, 'onInitialize')
            let ready = false;
            if (seedPhrase) {
                console.log(tag, 'checkpoint 1: seedPhrase: ', seedPhrase)
                const { eip155Addresses, eip155Wallets } = createOrRestoreEIP155Wallet(seedPhrase);
                const { cosmosAddresses } = await createOrRestoreCosmosWallet(seedPhrase);
                const { solanaAddresses } = await createOrRestoreSolanaWallet(seedPhrase);
                const { polkadotAddresses } = await createOrRestorePolkadotWallet(seedPhrase);
                // const { nearAddresses } = await createOrRestoreNearWallet(seedPhrase);
                const { multiversxAddresses } = await createOrRestoreMultiversxWallet(seedPhrase);
                const { tronAddresses } = await createOrRestoreTronWallet(seedPhrase);
                const { tezosAddresses } = await createOrRestoreTezosWallet(seedPhrase);
                // const { kadenaAddresses } = await createOrRestoreKadenaWallet(seedPhrase);

                await initializeSmartAccounts(eip155Wallets[eip155Addresses[0]].getPrivateKey());

                SettingsStore.setEIP155Address(eip155Addresses[0]);
                SettingsStore.setCosmosAddress(cosmosAddresses[0]);
                SettingsStore.setSolanaAddress(solanaAddresses[0]);
                SettingsStore.setPolkadotAddress(polkadotAddresses[0]);
                // SettingsStore.setNearAddress(nearAddresses[0]);
                SettingsStore.setMultiversxAddress(multiversxAddresses[0]);
                SettingsStore.setTronAddress(tronAddresses[0]);
                SettingsStore.setTezosAddress(tezosAddresses[0]);
                // SettingsStore.setKadenaAddress(kadenaAddresses[0]);
                ready = true;
            }

            if(app && app.pubkeys && app.pubkeys.length > 0) {
                console.log(tag, 'checkpoint 2: pioneer: ', seedPhrase)
                let eip155Addresses: string[] = [];
                let pubkey = app.pubkeys.filter((pubkey: { networks: string[] }) =>
                    pubkey.networks.some(network => network.includes('eip155:1'))
                );
                if (pubkey.length && pubkey[0].master) {
                    eip155Addresses.push(pubkey[0].master);
                    ready = true;
                }
            }

            if(ready){
                console.log(tag, 'checkpoint 3: ready: ', ready)
                await createWeb3Wallet(relayerRegionURL);
                setInitialized(true);
                onInitialized(true);
            }

        } catch (err: unknown) {
            console.error('Initialization failed', err);
            alert(err);
        }
    }, [relayerRegionURL, initializeSmartAccounts, onInitialized, seedPhrase, app]);

    const onRelayerRegionChange = useCallback(() => {
        try {
            web3wallet?.core?.relayer.restartTransport(relayerRegionURL);
            prevRelayerURLValue.current = relayerRegionURL;
        } catch (err: unknown) {
            alert(err);
        }
    }, [relayerRegionURL]);

    useEffect(() => {
        if (!initialized) {
            onInitialize();
        }
        if (prevRelayerURLValue.current !== relayerRegionURL) {
            onRelayerRegionChange();
        }
    }, [initialized, onInitialize, relayerRegionURL, onRelayerRegionChange]);

    return { initialized };
};

export default useInitialization;
