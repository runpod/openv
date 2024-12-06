import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

import config from '@/config';

interface AuthWrapperProps {
  children: ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  if (!config.auth.enabled) {
    return <>{children}</>;
  }

  return <ClerkProvider dynamic>{children}</ClerkProvider>;
};

export default AuthWrapper;