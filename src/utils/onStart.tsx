// src/utils/onStartApp.tsx
import { usePioneer } from "@coinmasters/pioneer-react";
import { WalletOption, availableChainsByWallet } from '@coinmasters/types';
export const useOnStartApp = () => {
    console.log('usePioneer:', usePioneer);
    const pioneer = usePioneer();
    console.log('usePioneer2:', pioneer);

    if (!pioneer) {
        console.error('usePioneer did not return a valid object');
        return;
    }

    const { onStart } = pioneer;

    if (typeof onStart !== 'function') {
        console.error('onStart is not a function:', onStart);
        return;
    }

    const onStartApp = async () => {
        try {
            let walletsVerbose = [];
            const { keepkeyWallet } = await import("@coinmasters/wallet-keepkey");

            const pioneerSetup: any = {
                appName: "Pioneer",
                appIcon: "https://pioneers.dev/coins/pioneerMan.png",
            };

            const walletKeepKey = {
                type: WalletOption.KEEPKEY,
                icon: "https://pioneers.dev/coins/keepkey.png",
                chains: availableChainsByWallet[WalletOption.KEEPKEY],
                wallet: keepkeyWallet,
                status: "offline",
                isConnected: false,
            };

            const { evmWallet } = await import("@coinmasters/wallet-evm-extensions");
            const walletMetamask = {
                type: "METAMASK",
                icon: "https://pioneers.dev/coins/evm.png",
                chains: availableChainsByWallet[WalletOption.METAMASK],
                wallet: evmWallet,
                status: "offline",
                isConnected: false,
            };
            walletsVerbose.push(walletMetamask);

            const { walletconnectWallet } = await import("@coinmasters/wallet-wc");
            const walletWalletConnect = {
                type: WalletOption.WALLETCONNECT,
                icon: "https://pioneers.dev/coins/walletconnect.png",
                chains: availableChainsByWallet[WalletOption.WALLETCONNECT],
                wallet: walletconnectWallet,
                status: "offline",
                isConnected: false,
            };
            walletsVerbose.push(walletWalletConnect);

            walletsVerbose.push(walletKeepKey);
            onStart(walletsVerbose, pioneerSetup);
        } catch (e) {
            console.error("Failed to start app!", e);
        }
    };

    return onStartApp;
};
