'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { AreaSummaryProvider } from '@/contexts/AreaSummaryContext';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <AreaSummaryProvider>
        {children}
      </AreaSummaryProvider>
    </AuthProvider>
  );
}
