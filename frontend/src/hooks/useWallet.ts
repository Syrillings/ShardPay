/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { WalletState } from "../types";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    balance: null,
    isConnecting: false,
    isConnected: false,
    chainId: null,
  });

  const isMetaMaskInstalled =
    typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask;

  const formatAddress = (address: string) =>
    `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  const formatBalance = (balance: string) =>
    parseFloat(balance).toFixed(4);


  const updateWalletState = async (accounts: string[]) => {
    if (!accounts || accounts.length === 0) {
      disconnectWallet();
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const account = accounts[0];
      const balanceBigInt = await provider.getBalance(account);

      setWalletState({
        address: formatAddress(account),
        balance: formatBalance(ethers.formatEther(balanceBigInt)),
        isConnecting: false,
        isConnected: true,
        chainId: parseInt(window.ethereum.chainId, 16).toString(),
      });
    } catch (err) {
      console.error("Error updating wallet state:", err);
      disconnectWallet();
    }
  };

  // Effects: handle accounts + chain changes
  useEffect(() => {
    if (!isMetaMaskInstalled) return;

    const handleAccountsChanged = (accounts: string[]) => {
      updateWalletState(accounts);
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    // Check if already connected
    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          updateWalletState(accounts);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
        disconnectWallet();
      }
    };

    checkConnection();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [isMetaMaskInstalled]);

  // Connect wallet
  const onConnectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled) {
      window.open("https://metamask.io/download.html", "_blank");
      return;
    }

    setWalletState((prev) => ({ ...prev, isConnecting: true }));

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      await updateWalletState(accounts);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      setWalletState((prev) => ({
        ...prev,
        isConnecting: false,
        isConnected: false,
      }));
    }
  }, [isMetaMaskInstalled]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setWalletState({
      address: null,
      balance: null,
      isConnecting: false,
      isConnected: false,
      chainId: null,
    });
  }, []);

  return {
    ...walletState,
    onConnectWallet,
    disconnectWallet,
    isMetaMaskInstalled,
  };
};
