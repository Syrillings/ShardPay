/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from 'react';
import { VaultSummary, Transaction } from '../types';
import { ethers } from 'ethers';
import { toast } from 'sonner';

const VAULT_ABI = [
  'function deposit(uint256 amount) external',
  'function withdraw(uint256 amount) external',
  'function getUserBalance(address user) external view returns (uint256)',
  'function getGoal(address user) external view returns (uint256)',
  'function setGoal(uint256 amount) external',
  'function toggleMicroSave(bool enabled) external',
  'function getMicroSaveStatus(address user) external view returns (bool)'
];

const VAULT_CONTRACT_ADDRESS = import.meta.env.VITE_PUBLIC_VAULT_CONTRACT_ADDRESS;
console.log('Vault Contract Address:', VAULT_CONTRACT_ADDRESS);

export const useVault = () => {
  const [vaultSummary, setVaultSummary] = useState<VaultSummary>({
    goal: '0',
    saved: '0',
    progress: 0,
    microSaveEnabled: false,
    isLoading: true,
  });

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  const fetchVaultSummary = useCallback(async (walletAddress: string) => {
    if (!walletAddress) {
      console.log('No wallet address provided');
      return;
    }

    try {
      if (!window.ethereum) {
        throw new Error('No Ethereum provider found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      console.log('Connected to network:', network);

      const expectedChainIdHex = "0x1f90"; 
if (network.chainId !== BigInt(8080)) {
  try {
   
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: expectedChainIdHex }],
    });
  } catch (switchError: any) {
        if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: expectedChainIdHex,
          chainName: "Shardeum Sphinx 1.X",
          nativeCurrency: { name: "SHM", symbol: "SHM", decimals: 18 },
          rpcUrls: ["https://sphinx.shardeum.org/"],
          blockExplorerUrls: ["https://explorer-sphinx.shardeum.org/"],
        }],
      });
    } else {
      throw switchError;
    }
  }
}

      const vaultContract = new ethers.Contract(
        VAULT_CONTRACT_ADDRESS,
        VAULT_ABI,
        provider
      );

      console.log('Contract address:', VAULT_CONTRACT_ADDRESS);

      const address = walletAddress;
      console.log('Fetching data for address:', address);

      // Test a simple call with a function that exists in the contract
      try {
        // Using getUserBalance function selector: keccak256('getUserBalance(address)') = 0x27e235e3...
        // But we'll use the contract method directly for better error handling
        const testCall = await vaultContract.getUserBalance(address);
        console.log('Test call successful, user balance:', testCall.toString());
      } catch (testError) {
        console.error('Test call failed:', testError);
        throw new Error(`Failed to call contract at ${VAULT_CONTRACT_ADDRESS}. Make sure the contract is deployed and the address is correct.`);
      }

      // Make individual calls instead of Promise.all for better error handling
      const savedBalance = await vaultContract.getUserBalance(address);
      const goal = await vaultContract.getGoal(address);
      const microSaveStatus = await vaultContract.getMicroSaveStatus(address);
  
      // Format values
      const saved = ethers.formatEther(savedBalance);
      const goalAmount = ethers.formatEther(goal);
      const progress = parseFloat(goalAmount) > 0 
        ? (parseFloat(saved) / parseFloat(goalAmount)) * 100 
        : 0;
  
      setVaultSummary({
        saved,
        goal: goalAmount,
        progress: isNaN(progress) ? 0 : progress,
        microSaveEnabled: microSaveStatus,
        isLoading: false
      });
    } catch (error) {
      console.error('Error in fetchVaultSummary:', {
        error,
        contractAddress: VAULT_CONTRACT_ADDRESS,
        walletAddress,
        network: window.ethereum?.networkVersion ? 
          `Chain ID: ${window.ethereum.chainId}` : 'Not connected'
      });
      
      toast.error('Failed to load vault data. Please check your network connection and try again.');
      setVaultSummary(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  }, []);

  const setMicroSaveToggle = useCallback(async (enabled: boolean) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum, {
        name: 'custom',
        chainId: parseInt(window.ethereum.chainId, 16),
        ensAddress: undefined,
      });
      const signer = await provider.getSigner();
      const vaultContract = new ethers.Contract(VAULT_CONTRACT_ADDRESS, VAULT_ABI, signer);
      
      const tx = await vaultContract.toggleMicroSave(enabled);
      await tx.wait();
      
      setVaultSummary(prev => ({
        ...prev,
        microSaveEnabled: enabled,
      }));
      
      toast.success(`Micro-save ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error toggling micro-save:', error);
      toast.error('Failed to update micro-save preference');
      throw error;
    }
  }, []);

  const createOrUpdateGoal = useCallback(async (amount: string) => {
    try {
      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error('Invalid goal amount');
      }

      const provider = new ethers.BrowserProvider(window.ethereum, {
        name: 'custom',
        chainId: parseInt(window.ethereum.chainId, 16),
        ensAddress: undefined,
      });
      const signer = await provider.getSigner();
      const vaultContract = new ethers.Contract(VAULT_CONTRACT_ADDRESS, VAULT_ABI, signer);
      
      const tx = await vaultContract.setGoal(ethers.parseEther(amount));
      await tx.wait();
  
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const walletAddress = accounts[0];
      await fetchVaultSummary(walletAddress);
      
      toast.success('Goal updated successfully');
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
      throw error;
    }
  }, [fetchVaultSummary]);

  const addToVault = useCallback(async (amount: string, memo?: string) => {
    try {
      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error('Invalid deposit amount');
      }

      const provider = new ethers.BrowserProvider(window.ethereum, {
        name: 'custom',
        chainId: parseInt(window.ethereum.chainId, 16),
        ensAddress: undefined, 
      });
      const signer = await provider.getSigner();
      const vaultContract = new ethers.Contract(VAULT_CONTRACT_ADDRESS, VAULT_ABI, signer);
      
      const tx = await vaultContract.deposit(ethers.parseEther(amount));
      const receipt = await tx.wait();
      
      // Add to recent transactions
      const newTransaction: Transaction = {
        id: receipt.transactionHash,
        type: 'save',
        amount: amount,
        currency: 'SHM',
        memo: memo || 'Manual deposit',
        date: new Date(),
        status: 'success',
      };
      
      setRecentTransactions(prev => [newTransaction, ...prev].slice(0, 10)); // Keep only last 10 transactions
      
      // Refresh the vault summary
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const walletAddress = accounts[0];
      await fetchVaultSummary(walletAddress);
      
      toast.success('Deposit successful');
    } catch (error) {
      console.error('Error depositing to vault:', error);
      toast.error('Failed to deposit to vault');
      throw error;
    }
  }, [fetchVaultSummary]);

  
  const fetchRecentTransactions = useCallback(async (walletAddress: string) => {
    try {
       return [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }, []);

    useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const walletAddress = accounts[0];
          await fetchVaultSummary(walletAddress);
          const transactions = await fetchRecentTransactions(walletAddress);
          setRecentTransactions(transactions);
        } else {
          setVaultSummary(prev => ({
            ...prev,
            isLoading: false
          }));
        }
      }
    };

    checkWalletConnection();
  }, [fetchVaultSummary, fetchRecentTransactions]);

  return {
    vaultSummary,
    recentTransactions,
    setMicroSaveToggle,
    createOrUpdateGoal,
    addToVault,
    refreshVault: fetchVaultSummary,
  };
};


