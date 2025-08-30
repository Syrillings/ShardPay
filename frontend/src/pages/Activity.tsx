/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Activity as ActivityIcon, Filter, Search, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MyInput } from '../components/ui/MyInput';
import { Chip } from '../components/ui/Chip';
import { Transaction } from '../types';
import { useWallet } from '../hooks/useWallet';
import { ethers } from 'ethers';

type BlockchainTransaction = Omit<Transaction, 'date'> & {
  timestamp: number;
  from: string;
  to: string;
  value: string;
  hash: string;
};

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Payments', value: 'payment' },
  { label: 'Received', value: 'receive' },
  { label: 'Saves', value: 'save' },
  { label: 'Splits', value: 'split' },
];

export const Activity = () => {
  const  walletState  = useWallet();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionStats, setTransactionStats] = useState({
    totalReceived: 0,
    totalSent: 0,
    totalSaved: 0
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!walletState.address) return;
      
      setIsLoading(true);
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const currentBlock = await provider.getBlockNumber();
        
     
        const fromBlock = Math.max(0, currentBlock - 1000);
     
        const filter = {
          address: walletState.address,
          fromBlock: fromBlock,
          toBlock: 'latest',
        };
        
        const logs = await provider.getLogs({
          ...filter,
          topics: [ethers.id('Transfer(address,address,uint256)')]
        });
        
     
        const processedTxs = await Promise.all(logs.map(async (log) => {
          const tx = await provider.getTransaction(log.transactionHash);
          const receipt = await tx.wait();
  
          const txType = tx.from.toLowerCase() === walletState.address?.toLowerCase() 
            ? 'payment' as const 
            : 'receive' as const;
          
          const block = await provider.getBlock(receipt.blockNumber);
          const txDate = block?.timestamp ? new Date(block.timestamp * 1000) : new Date();
          
          return {
            id: tx.hash,
            type: txType,
            amount: ethers.formatEther(tx.value),
            currency: 'SHM',
            from: tx.from,
            to: tx.to || '',
            memo: '',
            date: txDate,
            status: receipt.status === 1 ? 'success' : 'failed',
            hash: tx.hash
          } as const;
        }));
        
        // Calculate stats
        const stats = processedTxs.reduce((acc, tx) => {
          const amount = parseFloat(tx.amount);
          if (tx.type === 'receive') {
            acc.totalReceived += amount;
          } else {
            acc.totalSent += amount;
          }
          return acc;
        }, { totalReceived: 0, totalSent: 0, totalSaved: 0 });
        
        setTransactions(processedTxs);
        setTransactionStats(stats);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransactions();
  }, [walletState.address]);

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'payment' && tx.type === 'payment') ||
      (activeFilter === 'receive' && tx.type === 'receive');
      
    const matchesSearch = !searchQuery || 
      tx.memo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.to?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.from?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment': return '💳';
      case 'receive': return '📥';
      case 'save': return '🏦';
      case 'split': return '🧾';
      default: return '💰';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'destructive';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (!walletState.isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please connect your wallet to view transaction history.
            </p>
            <Button className="w-full">Connect Wallet</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center">
            <ActivityIcon className="mr-3 h-8 w-8 text-primary" />
            Transaction Activity
          </h1>
          <p className="text-muted-foreground">
            View and manage your transaction history
          </p>
        </div>

        {/* Filters and Search */}
        <Card variant="elevated" className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <MyInput
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Date Filter */}
              <Button variant="outline" className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                This Month
              </Button>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              {filterOptions.map((filter) => (
                <Chip
                  key={filter.value}
                  variant={activeFilter === filter.value ? 'primary' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setActiveFilter(filter.value)}
                >
                  {filter.label}
                </Chip>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transaction Summary */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <Card variant="glass">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-success">
                +{transactionStats.totalReceived.toFixed(4)}
              </div>
              <div className="text-sm text-muted-foreground">Total Received</div>
            </CardContent>
          </Card>
          
          <Card variant="glass">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary">
                -{transactionStats.totalSent.toFixed(4)}
              </div>
              <div className="text-sm text-muted-foreground">Total Sent</div>
            </CardContent>
          </Card>
          
          <Card variant="glass">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-secondary">
                {transactionStats.totalSaved.toFixed(4)}
              </div>
              <div className="text-sm text-muted-foreground">Total Saved</div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Transactions</span>
              <span className="text-sm font-normal text-muted-foreground">
                {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length > 0 ? (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg">{getTransactionIcon(transaction.type)}</span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {transaction.type === 'payment' 
                            ? `Sent to ${transaction.to.substring(0, 6)}...${transaction.to.substring(transaction.to.length - 4)}`
                            : transaction.type === 'receive'
                            ? `Received from ${transaction.from.substring(0, 6)}...${transaction.from.substring(transaction.from.length - 4)}`
                            : transaction.memo || 'Transaction'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.date.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${transaction.type === 'receive' ? 'text-success' : 'text-foreground'}`}>
                        {transaction.type === 'receive' ? '+' : '-'}{transaction.amount} {transaction.currency}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <a 
                          href={`https://etherscan.io/tx/${transaction.hash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          View on Etherscan
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchQuery || activeFilter !== 'all' 
                    ? 'No matching transactions found.' 
                    : 'No transactions found.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};