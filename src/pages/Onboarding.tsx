// src/components/Onboarding.tsx
import React, { useEffect, useState, useRef } from 'react';
import { set, get } from 'idb-keyval';
import { Toaster } from 'react-hot-toast';
import { createTheme, NextUIProvider, Container, Card, Loading } from '@nextui-org/react';
import { ChakraProvider } from '@chakra-ui/react';
import { encryptAES, decryptAES } from '@/utils/crypto';
import Layout from '@/components/Layout';
import LoginForm from '@/components/LoginForm';
import CreateWalletForm from '@/components/CreateWalletForm';
import RestoreWalletForm from '@/components/RestoreWalletForm';
import ChoiceForm from '@/components/ChoiceForm';
import CreateSubWalletForm from '@/components/CreateSubWalletForm'; // Import CreateSubWalletForm
import useWalletConnectEventsManager from '@/hooks/useWalletConnectEventsManager';
import Initialization from '@/components/Initialization';
import { web3wallet } from '@/utils/WalletConnectUtil';
import { RELAYER_EVENTS } from '@walletconnect/core';
import { styledToast } from '@/utils/HelperUtil';
import { useOnStartApp } from '@/utils/onStart';
import { usePioneer } from "@coinmasters/pioneer-react";

// @ts-ignore
const Onboarding = ({ Component, pageProps }) => {
    const { state, connectWallet } = usePioneer();
    const { api, app, assets, context } = state;
    const [isConnecting, setIsConnecting] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [hasBackup, setHasBackup] = useState<boolean | null>(null);
    const [seedPhrase, setSeedPhrase] = useState<string | null>(null);
    const [shouldInitialize, setShouldInitialize] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [showCreateWallet, setShowCreateWallet] = useState(false);
    const [showRestoreWallet, setShowRestoreWallet] = useState(false);
    const [showCreateSubWallet, setShowCreateSubWallet] = useState(false);
    const [isKeepKeyPaired, setIsKeepKeyPaired] = useState(false);

    const onStartApp = useOnStartApp();
    const onStartAppCalled = useRef(false); // To track if onStartApp has been called

    useEffect(() => {
        if (app?.pubkeys && app.pubkeys.some((pubkey: { networks: string[] }) => pubkey.networks?.some(network => network.includes('eip155:')))) {
            setIsKeepKeyPaired(true);
            setShowCreateSubWallet(true); // Show CreateSubWalletForm when KeepKey is paired
        }
    }, [app?.pubkeys]);

    let onStart = async function () {
        if (app && app.pairWallet && !isConnecting) {
            console.log('App loaded... connecting');

            await connectWallet('KEEPKEY');
            setIsConnecting(true);

            await app.getPubkeys();
            await app.getBalances();
        } else {
            console.error(e)
            console.log('App not loaded yet... can not connect');
        }
    };

    useEffect(() => {
        onStart();
    }, [app, app?.assetContext, assets]);

    useEffect(() => {
        const checkForBackup = async () => {
            const encryptedPrivateKey = await get('encryptedPrivateKey');
            setHasBackup(!!encryptedPrivateKey);
        };
        checkForBackup();
    }, []);

    useEffect(() => {
        if (!seedPhrase) return;

        setShouldInitialize(true);

        web3wallet?.core.relayer.on(RELAYER_EVENTS.connect, () => {
            styledToast('Network connection is restored!', 'success');
        });

        web3wallet?.core.relayer.on(RELAYER_EVENTS.disconnect, () => {
            styledToast('Network connection lost.', 'error');
        });
    }, [seedPhrase]);

    useEffect(() => {
        if (!onStartAppCalled.current) {
            if (onStartApp) {
                onStartApp();
                onStartAppCalled.current = true; // Mark as called
            } else {
                console.error('onStartApp is not defined');
            }
        }
    }, [onStartApp]);

    const handleLogin = async (password: string) => {
        const storedEncryptedPrivateKey = await get('encryptedPrivateKey');
        if (storedEncryptedPrivateKey) {
            try {
                const decryptedSeedPhrase = decryptAES(storedEncryptedPrivateKey, password);
                if (decryptedSeedPhrase) {
                    setSeedPhrase(decryptedSeedPhrase);
                    useWalletConnectEventsManager(!!seedPhrase);
                    setLoggedIn(true);
                } else {
                    alert('Invalid password. Please try again.');
                }
            } catch (error) {
                alert('Invalid password. Please try again.');
            }
        } else {
            alert('No backup found.');
        }
    };

    const handleCreateWallet = async (password: string, seedPhrase: string) => {
        const encryptedPrivateKey = encryptAES(seedPhrase, password);
        await set('encryptedPrivateKey', encryptedPrivateKey);
        setSeedPhrase(seedPhrase);
        setLoggedIn(true);
    };

    const handleRestoreWallet = async (password: string, seedPhrase: string) => {
        const encryptedPrivateKey = encryptAES(seedPhrase, password);
        await set('encryptedPrivateKey', encryptedPrivateKey);
        setSeedPhrase(seedPhrase);
        setLoggedIn(true);
    };

    const handleLogout = async () => {
        const storedEncryptedPrivateKey = await get('encryptedPrivateKey');
        if (storedEncryptedPrivateKey) {
            setSeedPhrase(null);
            setLoggedIn(false);
            setInitialized(false);
            setShouldInitialize(false);
        }
    };

    const createNewWallet = () => {
        handleLogout();
        setShowCreateWallet(true);
        setShowRestoreWallet(false);
    };

    const restoreWallet = () => {
        handleLogout();
        setShowCreateWallet(false);
        setShowRestoreWallet(true);
    };

    const createSubWallet = () => {
        handleLogout();
        setShowCreateSubWallet(true);
    };

    const onGoBack = () => {
        setShowCreateWallet(false);
        setShowRestoreWallet(false);
        setShowCreateSubWallet(false);
    };

    const onInitialized = (initStatus: any) => {
        setInitialized(initStatus);
    };

    if (hasBackup === null) {
        return <Loading />;
    }

    return (
        <ChakraProvider>
            <NextUIProvider theme={createTheme({ type: 'dark' })}>
                <Container display="flex" justify="center" alignItems="center" style={{ height: '100vh' }}>
                    <Card
                        bordered={{ '@initial': false, '@xs': true }}
                        borderWeight={{ '@initial': 'light', '@xs': 'light' }}
                        css={{
                            height: '100%',
                            width: '100%',
                            justifyContent: initialized ? 'normal' : 'center',
                            alignItems: initialized ? 'normal' : 'center',
                            borderRadius: 0,
                            paddingBottom: 5,
                            '@xs': {
                                borderRadius: '$lg',
                                height: '95vh',
                                maxWidth: '450px',
                            },
                        }}
                    >
                        {initialized ? (
                            <Layout initialized={initialized} handleLogout={handleLogout}>
                                <Toaster />
                                <Component {...pageProps} />
                            </Layout>
                        ) : loggedIn ? (
                            <>
                                {shouldInitialize && <Initialization seedPhrase={seedPhrase} onInitialized={onInitialized} />}
                                <Loading />
                            </>
                        ) : hasBackup ? (
                            <LoginForm onLogin={handleLogin} createNewWallet={createNewWallet} />
                        ) : showCreateWallet ? (
                            <CreateWalletForm onCreateWallet={handleCreateWallet} onGoBack={onGoBack} />
                        ) : showRestoreWallet ? (
                            <RestoreWalletForm onRestoreWallet={handleRestoreWallet} onGoBack={onGoBack} />
                        ) : showCreateSubWallet ? (
                            <CreateSubWalletForm usePioneer={usePioneer} onCreateWallet={handleCreateWallet} onGoBack={onGoBack} />
                        ) : (
                            <ChoiceForm onCreateNewWallet={createNewWallet} onRestoreWallet={restoreWallet} onCreateSubWallet={createSubWallet} />
                        )}
                    </Card>
                </Container>
            </NextUIProvider>
        </ChakraProvider>
    );
};

export default Onboarding;
