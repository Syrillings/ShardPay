import { useState, useCallback, useEffect } from 'react';
import { VaultSummary, Transaction } from '../types';
import { ethers } from 'ethers';
import { toast } from 'sonner';

// Vault contract ABI (replace with your actual vault contract ABI)
const VAULT_ABI = [
  'function deposit(uint256 amount) external',
  'function withdraw(uint256 amount) external',
  'function getUserBalance(address user) external view returns (uint256)',
  'function getGoal(address user) external view returns (uint256)',
  'function setGoal(uint256 amount) external',
  'function toggleMicroSave(bool enabled) external',
  'function getMicroSaveStatus(address user) external view returns (bool)'
];


const VAULT_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; 

export const useVault = () => {
  const [vaultSummary, setVaultSummary] = useState<VaultSummary>({
    goal: '0',
    saved: '0',
    progress: 0,
    microSaveEnabled: false,
    isLoading: true,
  });

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  const getVaultSummary = useCallback(async (walletAddress?: string) => {
    if (!walletAddress) {
      setVaultSummary(prev => ({
        ...prev,
        saved: '0',
        goal: '0',
        progress: 0,
        isLoading: false
      }));
      return;
    }
  
    try {
      const provider = new ethers.BrowserProvider(window.ethereum, {
        name: 'custom',
        chainId: parseInt(window.ethereum.chainId, 16),
      });
      
      const signer = await provider.getSigner();
      const vaultContract = new ethers.Contract(VAULT_CONTRACT_ADDRESS, VAULT_ABI, signer);
  
      const address = ethers.getAddress(walletAddress);
  
      const [savedBalance, goal, microSaveEnabled] = await Promise.all([
        vaultContract.getUserBalance(address),
        vaultContract.getGoal(address),
        vaultContract.getMicroSaveStatus(address)
      ]);
  
      const saved = ethers.formatEther(savedBalance);
      const goalAmount = ethers.formatEther(goal);
      const progress = parseFloat(saved) / parseFloat(goalAmount) * 100;
  
      setVaultSummary({
        saved,
        goal: goalAmount,
        progress: isNaN(progress) ? 0 : progress,
        microSaveEnabled,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching vault summary:', error);
      toast.error('Failed to load vault data');
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
      await getVaultSummary(walletAddress);
      
      toast.success('Goal updated successfully');
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
      throw error;
    }
  }, [getVaultSummary]);

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
      await getVaultSummary(walletAddress);
      
      toast.success('Deposit successful');
    } catch (error) {
      console.error('Error depositing to vault:', error);
      toast.error('Failed to deposit to vault');
      throw error;
    }
  }, [getVaultSummary]);

  
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
          await getVaultSummary(walletAddress);
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
  }, [getVaultSummary, fetchRecentTransactions]);

  return {
    vaultSummary,
    recentTransactions,
    setMicroSaveToggle,
    createOrUpdateGoal,
    addToVault,
    refreshVault: getVaultSummary,
  };
};