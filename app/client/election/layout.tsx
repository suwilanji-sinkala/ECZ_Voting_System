'use client';

import { ChakraProvider } from '@chakra-ui/react';

export default function ElectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Blockchain Voting | ECZ</title>
        <meta name="description" content="Vote securely on the blockchain with ECZ's decentralized voting system" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <ChakraProvider>
          {children}
        </ChakraProvider>
      </body>
    </html>
  );
}
