// src/pages/_app.tsx
import React from 'react';
import { useEffect } from 'react';
import { ChakraProvider, useColorMode } from '@chakra-ui/react';
import { NextUIProvider, createTheme } from '@nextui-org/react';
import { AppProps } from 'next/app';
import Onboarding from '@/pages/Onboarding'; // Adjust the import path as needed
import { PioneerProvider } from '@/pages/providers'; // Adjust the import path as needed
import { theme } from '@/styles/theme';

const ForceDarkMode = ({ children }: { children: React.ReactNode }) => {
    const { setColorMode } = useColorMode();

    useEffect(() => {
        setColorMode('dark');
    }, [setColorMode]);

    return <>{children}</>;
};

export default function App({ Component, pageProps }: AppProps) {
  return (
      <ChakraProvider theme={theme}>
          <ForceDarkMode>
            <NextUIProvider theme={createTheme({ type: 'dark' })}>
              <PioneerProvider>
                <Onboarding Component={Component} pageProps={pageProps} />
              </PioneerProvider>
            </NextUIProvider>
          </ForceDarkMode>
      </ChakraProvider>
  );
}
