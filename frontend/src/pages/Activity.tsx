/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Activity as ActivityIcon, Filter, Search, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MyInput } from '../components/ui/MyInput';
import { Chip } from '../components/ui/Chip';
import { Transaction } from '../types';

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'payment',
    amount: '25.50',
    currency: 'SHM',
    to: '0x742d...35Cc',
    memo: 'Coffee at StarBucks',
    date: new Date(Date.now() - 86400000),
    status: 'success',
    hash: '0xabc123...'
  },
  {
    id: '2',
    type: 'receive',
    amount: '100.00',
    currency: 'SHM',
    from: '0x956a...12Fd',
    memo: 'Payment from Alice',
    date: new Date(Date.now() - 172800000),
    status: 'success',
    hash: '0xdef456...'
  },
  {
    id: '3',
    type: 'save',
    amount: '5.00',
    currency: 'SHM',
    memo: 'Micro-save from payment',
    date: new Date(Date.now() - 259200000),
    status: 'success',
  },
  {
    id: '4',
    type: 'split',
    amount: '45.67',
    currency: 'SHM',
    memo: 'Dinner split with friends',
    date: new Date(Date.now() - 345600000),
    status: 'pending',
  },
  {
    id: '5',
    type: 'payment',
    amount: '12.30',
    currency: 'SHM',
    to: '0x123a...89Bc',
    memo: 'Uber ride',
    date: new Date(Date.now() - 432000000),
    status: 'failed',
  }
];

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Payments', value: 'payment' },
  { label: 'Received', value: 'receive' },
  { label: 'Saves', value: 'save' },
  { label: 'Splits', value: 'split' },
];

export const Activity = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions] = useState(mockTransactions);

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = activeFilter === 'all' || tx.type === activeFilter;
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
              <div className="text-2xl font-bold text-success">+245.67</div>
              <div className="text-sm text-muted-foreground">Total Received</div>
            </CardContent>
          </Card>
          
          <Card variant="glass">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary">-123.45</div>
              <div className="text-sm text-muted-foreground">Total Sent</div>
            </CardContent>
          </Card>
          
          <Card variant="glass">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-secondary">32.50</div>
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
                {filteredTransactions.length} results
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
                      
                      <div className="flex-1">
                        <div className="font-medium">{transaction.memo || 'No description'}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.date.toLocaleDateString()} • {transaction.date.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        {(transaction.to || transaction.from) && (
                          <div className="text-xs text-muted-foreground font-mono">
                            {transaction.type === 'receive' ? 'From:' : 'To:'} {transaction.to || transaction.from}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-semibold ${
                        transaction.type === 'receive' ? 'text-success' : 'text-foreground'
                      }`}>
                        {transaction.type === 'receive' ? '+' : '-'}{transaction.amount} {transaction.currency}
                      </div>
                      <Chip variant={getStatusColor(transaction.status) as any} size="sm">
                        {transaction.status}
                      </Chip>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ActivityIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Load More */}
        {filteredTransactions.length > 0 && (
          <div className="text-center mt-6">
            <Button variant="outline">Load More Transactions</Button>
          </div>
        )}
      </div>
    </div>
  );
};