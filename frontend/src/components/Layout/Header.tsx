import { Wallet, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useWallet } from '../../hooks/useWallet';

const navigation = [
  { name: 'Home', href: '/', icon: '🏠' },
  { name: 'Pay', href: '/pay', icon: '💳' },
  { name: 'Split', href: '/split', icon: '🧾' },
  { name: 'Save', href: '/save', icon: '🏦' },
  { name: 'Chat', href: '/chat', icon: '💬' },
  { name: 'Activity', href: '/activity', icon: '📊' },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { address, balance, isConnected, onConnectWallet, isConnecting } = useWallet();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="h-12 w-12 rounded-lg overflow-hidden flex items-center justify-center bg-gradient-primary group-hover:shadow-glow transition-all duration-300">
              <img src="/shardpay.png" alt="ShardPay Logo" className="h-4/5 w-4/5 object-contain" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ShardPay
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary shadow-soft'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <Card variant="outline" padding="none" className="px-3 py-2 bg-card/50">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
                  <span className="text-sm font-medium">{address}</span>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm font-semibold">{balance} SHM</span>
                </div>
              </Card>
            ) : (
              <Button
                variant="hero"
                size="sm"
                onClick={onConnectWallet}
                disabled={isConnecting}
                className="hidden sm:inline-flex"
              >
                <Wallet className="mr-2 h-4 w-4" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? 'bg-primary/10 text-primary shadow-soft'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
              
              {!isConnected && (
                <Button
                  variant="hero"
                  onClick={() => {
                    onConnectWallet();
                    setMobileMenuOpen(false);
                  }}
                  disabled={isConnecting}
                  className="mt-4"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};