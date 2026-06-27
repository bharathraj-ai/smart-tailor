'use client';

import { SessionProvider } from 'next-auth/react';

export default function SessionProviderWrapper({ children }) {
  return (
    <SessionProvider basePath="/api/auth" refetchInterval={5 * 60}>
      {children}
    </SessionProvider>
  );
}
