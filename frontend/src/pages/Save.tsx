import { useState, useEffect } from 'react';
import { PiggyBank, Target, TrendingUp, Plus, Settings, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MyInput } from '../components/ui/MyInput';
import { Chip } from '../components/ui/Chip';
import { useVault } from '../hooks/useVault';
import { useWallet } from '../hooks/useWallet';
import { LinePlaceholder } from '../components/Charts/LinePlaceholder';
import { toast } from 'sonner';

export const Save = () => {
  const { address: walletAddress, isConnected, onConnectWallet } = useWallet();
  const {
    vaultSummary,
    recentTransactions,
    setMicroSaveToggle,
    createOrUpdateGoal,
    addToVault,
    refreshVault
  } = useVault();

  const [newGoal, setNewGoal] = useState(vaultSummary.goal);
  const [depositAmount, setDepositAmount] = useState('');
  const [isUpdatingGoal, setIsUpdatingGoal] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);

  // Refresh vault data when wallet connects/disconnects
  useEffect(() => {
    if (walletAddress) {
      refreshVault(walletAddress);
    } else {
      refreshVault(undefined);
    }
  }, [walletAddress, refreshVault]);

  const handleUpdateGoal = async () => {
    if (!isConnected) {
      await onConnectWallet();
      return;
    }

    setIsUpdatingGoal(true);
    try {
      await createOrUpdateGoal(newGoal);
      toast.success('Goal updated successfully');
    } catch (error) {
      console.error('Failed to update goal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update goal';
      toast.error(errorMessage);
    } finally {
      setIsUpdatingGoal(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount) return;
    
    if (!isConnected) {
      await onConnectWallet();
      return;
    }
    
    setIsDepositing(true);
    try {
      await addToVault(depositAmount, 'Manual deposit');
      setDepositAmount('');
      toast.success('Deposit successful');
    } catch (error) {
      console.error('Failed to deposit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process deposit';
      toast.error(errorMessage);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await onConnectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const progressPercentage = Math.min(vaultSummary.progress, 100);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center">
            <PiggyBank className="mr-3 h-8 w-8 text-primary" />
            Savings Vault
          </h1>
          <p className="text-muted-foreground">
            Automated micro-savings and goal tracking
          </p>
        </div>

        {!isConnected ? (
          <Card className="mb-8">
            <CardContent className="pt-6 text-center">
              <PiggyBank className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground mb-6">Connect your wallet to start saving and track your goals</p>
              <Button 
                variant="glow" 
                onClick={handleConnectWallet}
                className="mx-auto"
              >
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        ) : vaultSummary.isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Goal Card */}
            <Card variant="glow" className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    Savings Goal
                  </span>
                  </CardTitle>
                  <Chip variant={progressPercentage >= 100 ? 'success' : 'primary'}>
                    {progressPercentage.toFixed(1)}%
                  </Chip>
                </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <div className="text-3xl font-bold">{vaultSummary.saved} SHM</div>
                      <div className="text-muted-foreground">of {vaultSummary.goal} SHM goal</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-success">
                        +{Math.floor(progressPercentage * 10)} SHM
                      </div>
                      <div className="text-sm text-muted-foreground">this week</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-3 mb-4">
                    <div 
                      className="bg-gradient-primary h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Wallet: {walletAddress}</span>
                    <span>{progressPercentage >= 100 ? 'Goal Reached! 🎉' : `${(100 - progressPercentage).toFixed(1)}% to go`}</span>
                  </div>
                </div>
               

                <div className="flex gap-3">
                  <MyInput
                    type="number"
                    placeholder="Update goal amount (SHM)"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    className="flex-1"
                    min="0"
                    step="0.01"
                  />
                  <Button
                    variant="hero"
                    onClick={handleUpdateGoal}
                    disabled={isUpdatingGoal || newGoal === vaultSummary.goal || !newGoal}
                  >
                    {isUpdatingGoal ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : 'Update Goal'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Micro-Save Toggle */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Auto-Save
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Micro-Savings</div>
                      <div className="text-sm text-muted-foreground">
                        Auto-save from payments
                      </div>
                    </div>
                    <button
                      onClick={() => setMicroSaveToggle(!vaultSummary.microSaveEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        vaultSummary.microSaveEnabled ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          vaultSummary.microSaveEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex gap-2">
                      <MyInput
                        placeholder="Amount to deposit (SHM)"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        type="number"
                        min="0"
                        step="0.0001"
                      />
                    </div>
                    <Button
                      variant="glow"
                      onClick={handleDeposit}
                      disabled={isDepositing || !depositAmount}
                      className="w-full mt-2"
                    >
                      {isDepositing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add to Vault
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {/* Savings Chart */}
        <Card variant="elevated" className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Savings Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LinePlaceholder 
              title="Savings Over Time" 
              description="Track your savings growth month by month"
            />
          </CardContent>
        </Card>

        {/* Recent Vault Transactions */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Recent Vault Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent transactions</p>
                <p className="text-sm">Your deposit history will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <PiggyBank className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{transaction.memo}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.date.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-success">
                        +{transaction.amount} {transaction.currency}
                      </div>
                      <Chip variant="success" size="sm">
                        {transaction.status}
                      </Chip>
                    </div>
                  </div>
                ))}
              </div>
            )}
           </CardContent>
        </Card>

        {/* Tips */}
        <Card variant="glass" className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <span className="mr-2 text-xl">💡</span>
              <h3 className="font-semibold">Smart Savings Tips</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <span className="mr-2">🎯</span>
                <span>Set realistic monthly goals</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">🔄</span>
                <span>Enable micro-save for automatic deposits</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">📊</span>
                <span>Track progress weekly</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">🚀</span>
                <span>Increase goal as income grows</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};