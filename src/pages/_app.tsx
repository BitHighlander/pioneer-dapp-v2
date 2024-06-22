import React, { useState, useEffect } from 'react';
import { set, get, del, keys } from 'idb-keyval';
import { Toaster } from 'react-hot-toast';
import { createTheme, NextUIProvider, Container, Card, Loading } from '@nextui-org/react';
import { AppProps } from 'next/app';
import { encryptAES, decryptAES } from '@/utils/crypto';
import Layout from '@/components/Layout';
import LoginForm from '@/components/LoginForm';
import CreateWalletForm from '@/components/CreateWalletForm';
import useWalletConnectEventsManager from '@/hooks/useWalletConnectEventsManager';
import Initialization from '@/components/Initialization';
import { web3wallet } from '@/utils/WalletConnectUtil';
import { RELAYER_EVENTS } from '@walletconnect/core';
import '../../public/main.css';
import { styledToast } from '@/utils/HelperUtil';
const TAG  = ' | _app.tsx | '

export default function App({ Component, pageProps }: AppProps) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [hasBackup, setHasBackup] = useState<boolean | null>(null);
  const [seedPhrase, setSeedPhrase] = useState<string | null>(null);
  const [shouldInitialize, setShouldInitialize] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useWalletConnectEventsManager(!!seedPhrase);

  useEffect(() => {
    const checkForBackup = async () => {
      const encryptedPrivateKey = await get('encryptedPrivateKey');
      if (encryptedPrivateKey) {
        setHasBackup(true);
      } else {
        setHasBackup(false);
      }
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

  const handleLogin = async (password: string) => {
    let tag = TAG+ " | handleLogin | "
    try{
      const storedEncryptedPrivateKey = await get('encryptedPrivateKey');
      console.log(tag,'storedEncryptedPrivateKey: ',storedEncryptedPrivateKey)
      if (storedEncryptedPrivateKey) {
        try {
          const decryptedSeedPhrase = decryptAES(storedEncryptedPrivateKey, password);
          if (decryptedSeedPhrase) {
            setSeedPhrase(decryptedSeedPhrase);
            setLoggedIn(true);
          } else {
            alert("Invalid password. Please try again.");
          }
        } catch (error) {
          alert("Invalid password. Please try again.");
        }
      } else {
        alert("No backup found.");
      }
    }catch(e){
      console.error(tag,e)
    }
  };

  const handleCreateWallet = async (password: string, seedPhrase: string) => {
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

  const createNewWallet = async () => {
    handleLogout();
  };

  const onInitialized = (initStatus:any) => {
    setInitialized(initStatus);
  };

  if (hasBackup === null) {
    return <Loading />;
  }

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
            ) : (
                <CreateWalletForm onCreateWallet={handleCreateWallet} />
            )}
          </Card>
        </Container>
      </NextUIProvider>
  );
}
