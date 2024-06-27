import React, { useEffect, useState, useRef } from 'react';
import { set, get, del } from 'idb-keyval';
import { Toaster } from 'react-hot-toast';
import { createTheme, NextUIProvider, Container, Card, Loading } from '@nextui-org/react';
import { encryptAES, decryptAES } from '@/utils/crypto';
import Layout from '@/components/Layout';
import LoginForm from '@/components/LoginForm';
import CreateWalletForm from '@/components/CreateWalletForm';
import RestoreWalletForm from '@/components/RestoreWalletForm';
import ChoiceForm from '@/components/ChoiceForm';
import CreateSubWalletForm from '@/components/CreateSubWalletForm';
import useWalletConnectEventsManager from '@/hooks/useWalletConnectEventsManager';
import useInitialization from '@/hooks/useInitialization';
import { web3wallet } from '@/utils/WalletConnectUtil';
import { RELAYER_EVENTS } from '@walletconnect/core';
import { styledToast } from '@/utils/HelperUtil';
import { useOnStartApp } from '@/utils/onStart';
import { usePioneer } from "@coinmasters/pioneer-react";
const TAG = " | Onboarding.ts | "

const Onboarding = ({ Component, pageProps }: any) => {
    const { state, connectWallet } = usePioneer();
    const { app }: any = state || {}; // Ensure state and app are defined
    const [isConnecting, setIsConnecting] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [hasBackup, setHasBackup] = useState<boolean | null>(null);
    const [seedPhrase, setSeedPhrase] = useState<string | null>(null);
    const [shouldInitialize, setShouldInitialize] = useState(false);
    const [showCreateWallet, setShowCreateWallet] = useState(false);
    const [showRestoreWallet, setShowRestoreWallet] = useState(false);
    const [showCreateSubWallet, setShowCreateSubWallet] = useState(false);
    const [isKeepKeyPaired, setIsKeepKeyPaired] = useState(false);
    const onStartApp = useOnStartApp();
    const onStartAppCalled = useRef(false); // To track if onStartApp has been called
    const [initialized, setInitialized] = useState(false); // Move this here

    const onInitialized = (initStatus: any) => {
        console.log(TAG, 'onInitialized', initStatus);
        if(initStatus === true){
            setInitialized(initStatus);
            setShouldInitialize(false);
        }
    };

    // Initialize the hook at the top level
    const { initialized: hookInitialized } = useInitialization(seedPhrase, onInitialized, usePioneer);

    useEffect(() => {
        const checkForBackup = async () => {
            const encryptedPrivateKey = await get('encryptedPrivateKey');
            setHasBackup(!!encryptedPrivateKey);
        };
        checkForBackup();
    }, []);

    useEffect(() => {
        if (app?.pubkeys && app.pubkeys.some((pubkey: any) => pubkey.networks?.some((network: any) => network.includes('eip155:')))) {
            setIsKeepKeyPaired(true);
            setShowCreateSubWallet(true); // Show CreateSubWalletForm when KeepKey is paired
        }
    }, [app?.pubkeys]);

    const onStart = async function () {
        if (app && app.pairWallet && !isConnecting) {
            console.log('App loaded... connecting');
            // await connectWallet('KEEPKEY');
            // setIsConnecting(true);
            // await app.getPubkeys();
            // await app.getBalances();
            // setShouldInitialize(true); // Set shouldInitialize to true after fetching balances
        } else {
            console.error('App not loaded yet... cannot connect');
        }
    };

    useEffect(() => {
        onStart();
    }, [app, app?.assetContext, state.assets]);

    useEffect(() => {
        if (!seedPhrase) return;

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
                // onStartApp();
                // onStartAppCalled.current = true; // Mark as called
            } else {
                console.error('onStartApp is not defined');
            }
        }
    }, [onStartApp]);

    const handleLogin = async (password: string) => {
        let tag = TAG + " | handleLogin | ";
        const storedEncryptedPrivateKey = await get('encryptedPrivateKey');
        console.log(tag, "storedEncryptedPrivateKey: ", storedEncryptedPrivateKey);
        if (storedEncryptedPrivateKey) {
            try {
                const decryptedSeedPhrase = decryptAES(storedEncryptedPrivateKey, password);
                console.log(tag, ' decryptedSeedPhrase: ', decryptedSeedPhrase);
                if (decryptedSeedPhrase) {
                    console.log(tag, ' password correct! logging in...');
                    setSeedPhrase(decryptedSeedPhrase);
                    setLoggedIn(true);
                    setShouldInitialize(true);
                } else {
                    alert('Invalid password. Please try again.');
                }
            } catch (error) {
                console.error('Error decrypting seed phrase', error);
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
        setShouldInitialize(true);
    };

    const handleLogout = async () => {
        const storedEncryptedPrivateKey = await get('encryptedPrivateKey');
        if (storedEncryptedPrivateKey) {
            setSeedPhrase(null);
            setLoggedIn(false);
            setShouldInitialize(false);
        }
    };

    const clearSeed = () => {
        console.log(TAG + " | clearSeed | ", "Clearing seed phrase");
        setSeedPhrase(null);
        del('encryptedPrivateKey');
        setHasBackup(false);
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

    const renderContent = () => {
        console.log("RenderContent called");

        if (hasBackup === null) {
            console.log("RenderContent: hasBackup is null, showing Loading");
            return <Loading />;
        }

        if (hasBackup && !loggedIn) {
            console.log("RenderContent: hasBackup is true and not logged in, showing LoginForm");
            return <LoginForm onLogin={handleLogin} createNewWallet={createNewWallet} clearSeed={clearSeed} />;
        } else if (loggedIn) {
            console.log(`RenderContent: loggedIn is true, shouldInitialize is ${shouldInitialize}`);
            if (shouldInitialize) {
                console.log("RenderContent: Initialization in progress, showing Loading");
                return <Loading />; // Show loading while initialization happens
            } else {
                console.log("RenderContent: Initialization complete, showing Layout");
                return (
                    <Layout initialized={initialized} handleLogout={handleLogout}>
                        <Toaster />
                        <Component {...pageProps} />
                    </Layout>
                );
            }
        } else if (isKeepKeyPaired) {
            console.log(`RenderContent: isKeepKeyPaired is true, shouldInitialize is ${shouldInitialize}`);
            if (shouldInitialize) {
                console.log("RenderContent: Initialization in progress, showing Loading");
                return <Loading />; // Show loading while initialization happens
            } else {
                console.log("RenderContent: Initialization complete, showing Layout");
                return (
                    <Layout initialized={initialized} handleLogout={handleLogout}>
                        <Toaster />
                        <Component {...pageProps} />
                    </Layout>
                );
            }
        } else if (showCreateWallet) {
            console.log("RenderContent: showCreateWallet is true, showing CreateWalletForm");
            return <CreateWalletForm onCreateWallet={handleCreateWallet} onGoBack={onGoBack} />;
        } else if (showRestoreWallet) {
            console.log("RenderContent: showRestoreWallet is true, showing RestoreWalletForm");
            return <RestoreWalletForm handleCreateWallet={handleCreateWallet} onGoBack={onGoBack} />;
        } else if (showCreateSubWallet) {
            console.log("RenderContent: showCreateSubWallet is true, showing CreateSubWalletForm");
            return <CreateSubWalletForm usePioneer={usePioneer} onCreateWallet={handleCreateWallet} onGoBack={onGoBack} />;
        } else {
            console.log("RenderContent: Default case, showing ChoiceForm");
            return <ChoiceForm onCreateNewWallet={createNewWallet} onRestoreWallet={restoreWallet} onCreateSubWallet={createSubWallet} />;
        }
    };

    return (
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
                    {renderContent()}
                </Card>
            </Container>
        </NextUIProvider>
    );
};

export default Onboarding;
