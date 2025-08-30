import { Link } from 'react-router-dom';
import { Wallet, Send, Users, PiggyBank, TrendingUp, Zap, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { useWallet } from '../hooks/useWallet';
import { useVault } from '../hooks/useVault';

export const Home = () => {
  const { isConnected, onConnectWallet, isConnecting, balance } = useWallet();
  const { vaultSummary } = useVault();

  const formattedSaved = vaultSummary.saved ? parseFloat(vaultSummary.saved).toFixed(2) : '0.00';
  const formattedGoal = vaultSummary.goal ? parseFloat(vaultSummary.goal).toFixed(2) : '0.00';
  const progressPercentage = vaultSummary.progress ? Math.round(vaultSummary.progress * 10) / 10 : 0;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="mx-auto max-w-4xl px-4 py-8">
      
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Welcome to ShardPay
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The AI-powered PayFI wallet on Shardeum. Smart payments, micro-savings, and intelligent spending insights.
          </p>
          
          {!isConnected ? (
            <Card variant="glow" className="max-w-md mx-auto mb-8">
              <CardContent className="pt-6">
                <Wallet className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your Shardeum wallet to start using ShardPay
                </p>
                <Button 
                  variant="glow" 
                  onClick={onConnectWallet} 
                  disabled={isConnecting}
                  className="w-full"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card variant="elevated" className="max-w-md mx-auto mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-3 w-3 rounded-full bg-success mr-2 animate-pulse"></div>
                  <Chip variant="success">Connected</Chip>
                </div>
                <h3 className="text-2xl font-bold mb-2">{balance} SHM</h3>
                <p className="text-muted-foreground">Main Balance</p>
              </CardContent>
            </Card>
          )}
        </div>

        
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Zap className="mr-2 h-6 w-6 text-primary" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/pay">
              <Card variant="elevated" className="text-center hover:shadow-glow transition-all duration-300 group cursor-pointer">
                <CardContent className="pt-6">
                  <Send className="h-8 w-8 mx-auto mb-3 text-primary group-hover:animate-float" />
                  <h3 className="font-semibold">Send Payment</h3>
                  <p className="text-sm text-muted-foreground">Quick & secure</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/split">
              <Card variant="elevated" className="text-center hover:shadow-glow transition-all duration-300 group cursor-pointer">
                <CardContent className="pt-6">
                  <Users className="h-8 w-8 mx-auto mb-3 text-primary group-hover:animate-float" />
                  <h3 className="font-semibold">Split Bill</h3>
                  <p className="text-sm text-muted-foreground">AI-assisted</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/save">
              <Card variant="elevated" className="text-center hover:shadow-glow transition-all duration-300 group cursor-pointer">
                <CardContent className="pt-6">
                  <PiggyBank className="h-8 w-8 mx-auto mb-3 text-primary group-hover:animate-float" />
                  <h3 className="font-semibold">Save to Vault</h3>
                  <p className="text-sm text-muted-foreground">Micro-savings</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/chat">
              <Card variant="elevated" className="text-center hover:shadow-glow transition-all duration-300 group cursor-pointer">
                <CardContent className="pt-6">
                  <TrendingUp className="h-8 w-8 mx-auto mb-3 text-primary group-hover:animate-float" />
                  <h3 className="font-semibold">AI Insights</h3>
                  <p className="text-sm text-muted-foreground">Smart tips</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Balance Overview */}
        {isConnected && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card variant="gradient">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="mr-2 h-5 w-5" />
                  Main Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{balance} SHM</div>
                <div className="text-sm text-muted-foreground">≈ $2,845.67 USD</div>
                <div className="flex items-center mt-4 text-success">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  <span className="text-sm">+12.5% this month</span>
                </div>
              </CardContent>
            </Card>

            <Card variant="gradient">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PiggyBank className="mr-2 h-5 w-5" />
                  Savings Vault
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{formattedSaved} SHM</div>
                <div className="text-sm text-muted-foreground">
                  {vaultSummary.isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </div>
                  ) : (
                    `Goal: ${formattedGoal} SHM`
                  )}
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-primary h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features Showcase */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">Powered by AI on Shardeum</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card variant="glass">
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="font-semibold mb-2">Smart Insights</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered spending analysis and personalized recommendations
                </p>
              </CardContent>
            </Card>
            
            <Card variant="glass">
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-semibold mb-2">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">
                  Instant transactions on Shardeum's scalable network
                </p>
              </CardContent>
            </Card>
            
            <Card variant="glass">
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-semibold mb-2">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">
                  Your data stays private with optional anonymized insights
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};