import React, { createContext, useContext, ReactNode } from 'react';
import { WalletState } from '../types';

interface WalletContextType {
  walletState: WalletState;
  // Add any wallet-related methods here if needed
  // For example:
  // connect: () => Promise<void>;
  // disconnect: () => void;
}

// Create the context with a default value
const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
  value: WalletContextType;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children, value }) => {
  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export default WalletContext;
