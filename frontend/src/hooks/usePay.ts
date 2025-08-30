import { useState, useCallback, useContext } from 'react';
import { ethers } from 'ethers';
import { PaymentFormData, Transaction } from '../types';
import { useWallet } from './useWallet';

export const usePay = () => {
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    to: '',
    amount: '',
    memo: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  const validatePayment = useCallback((data: PaymentFormData) => {
    const newErrors: Partial<PaymentFormData> = {};
    
    if (!data.to.trim()) {
      newErrors.to = 'Recipient address is required';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(data.to)) {
      newErrors.to = 'Invalid wallet address format';
    }
    
    if (!data.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(data.amount)) || Number(data.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    return newErrors;
  }, []);

  const preparePayment = useCallback((data: PaymentFormData) => {
    const validationErrors = validatePayment(data);
    setErrors(validationErrors);
    setPaymentData(data);
    
    return Object.keys(validationErrors).length === 0;
  }, [validatePayment]);

  const  walletState  = useWallet();

  const submitPayment = useCallback(async () => {
    if (Object.keys(errors).length > 0) return null;
    if (!walletState.isConnected) {
      throw new Error('Wallet is not connected');
    }
    
    setIsProcessing(true);
    
    try {
      // Create provider with ENS disabled for custom networks
      const provider = new ethers.BrowserProvider(window.ethereum, {
        name: 'custom',
        chainId: parseInt(window.ethereum.chainId, 16),
        ensAddress: undefined, // Disable ENS resolution
      });
      
      const signer = await provider.getSigner();
      
      // Validate address format
      if (!ethers.isAddress(paymentData.to)) {
        throw new Error('Invalid recipient address format');
      }
      
      // Convert amount to wei (assuming 18 decimals for SHM token)
      const amountInWei = ethers.parseEther(paymentData.amount);
      
      // Send transaction
      const tx = await signer.sendTransaction({
        to: paymentData.to,
        value: amountInWei,
        data: paymentData.memo ? ethers.hexlify(ethers.toUtf8Bytes(paymentData.memo)) : '0x',
      });
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      const transaction: Transaction = {
        id: receipt.hash,
        type: 'payment',
        amount: paymentData.amount,
        currency: 'SHM',
        to: paymentData.to,
        from: walletState.address || '',
        memo: paymentData.memo,
        date: new Date(),
        status: receipt.status === 1 ? 'success' : 'failed',
        hash: receipt.hash,
      };
      
      setLastTransaction(transaction);
      setIsProcessing(false);
      setPaymentData({ to: '', amount: '', memo: '' });
      
      return transaction;
    } catch (error) {
      console.error('Payment failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [paymentData, errors, walletState]);

  const getAISuggestion = useCallback(async (amount: string) => {
    // TODO: integrate AI suggestion logic
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const tipPercentage = Math.floor(Math.random() * 5) + 10; // 10-15%
    const microSaveAmount = Math.floor(Number(amount) * 0.05); // 5% of payment
    
    return {
      tip: tipPercentage,
      microSave: microSaveAmount,
      message: `Suggested tip: ${tipPercentage}% • Micro-save: ₦${microSaveAmount}`
    };
  }, []);

  return {
    paymentData,
    isProcessing,
    errors,
    lastTransaction,
    preparePayment,
    submitPayment,
    getAISuggestion,
  };
};