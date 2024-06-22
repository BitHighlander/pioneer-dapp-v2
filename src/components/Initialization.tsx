import React, { useEffect, useState, useRef, useCallback } from 'react';
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

const Initialization = ({ seedPhrase, onInitialized }:any) => {
    const [initialized, setInitialized] = useState(false);
    const prevRelayerURLValue = useRef<string>('');

    const { relayerRegionURL } = useSnapshot(SettingsStore.state);
    const { initializeSmartAccounts } = useSmartAccounts();

    const onInitialize = useCallback(async () => {
        try {
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
            await createWeb3Wallet(relayerRegionURL);
            setInitialized(true);
            onInitialized(true);
        } catch (err: unknown) {
            console.error('Initialization failed', err);
            alert(err);
        }
    }, [relayerRegionURL, initializeSmartAccounts, onInitialized, seedPhrase]);

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

    return null;
};

export default Initialization;
