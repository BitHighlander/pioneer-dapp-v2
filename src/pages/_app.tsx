// src/pages/_app.tsx
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { NextUIProvider, createTheme } from '@nextui-org/react';
import { AppProps } from 'next/app';
import Onboarding from '@/pages/Onboarding'; // Adjust the import path as needed
import { PioneerProvider } from '@/pages/providers'; // Adjust the import path as needed

export default function App({ Component, pageProps }: AppProps) {
  return (
      <ChakraProvider>
        <NextUIProvider theme={createTheme({ type: 'dark' })}>
          <PioneerProvider>
            <Onboarding Component={Component} pageProps={pageProps} />
          </PioneerProvider>
        </NextUIProvider>
      </ChakraProvider>
  );
}
