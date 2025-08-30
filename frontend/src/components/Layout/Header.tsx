import { Wallet, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
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
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { address, balance, isConnected, onConnectWallet, isConnecting } = useWallet();

  const isActive = (path: string) => location.pathname === path;

    useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Format wallet address for mobile
  const formatAddress = (address: string) => {
    if (!address) return '';
    if (window.innerWidth >= 640) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header 
      className={`sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm transition-shadow duration-300 ${
        scrolled ? 'shadow-sm' : ''
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg overflow-hidden flex items-center justify-center bg-gradient-primary group-hover:shadow-glow transition-all duration-300">
              <img 
                src="/shardpay.png" 
                alt="ShardPay Logo" 
                className="h-4/5 w-4/5 object-contain" 
              />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ShardPay
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
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

          <div className="flex items-center space-x-2 sm:space-x-4">
            {isConnected ? (
              <Card 
                variant="outline" 
                padding="none" 
                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-card/50 max-w-[180px] sm:max-w-none overflow-hidden"
              >
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm font-medium truncate">
                    {formatAddress(address || '')}
                  </span>
                  <span className="text-muted-foreground hidden sm:inline">•</span>
                  <span className="text-xs sm:text-sm font-semibold truncate">
                    {balance} SHM
                  </span>
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
                <Wallet className="mr-2 h-4 w-4 flex-shrink-0" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        <div 
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            mobileMenuOpen ? 'max-h-96 py-3' : 'max-h-0 py-0'
          }`}
        >
          <nav className="flex flex-col space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary shadow-soft'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <span className="text-base mr-3 w-6 text-center">{item.icon}</span>
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
                className="mt-2 w-full justify-center"
              >
                <Wallet className="mr-2 h-4 w-4" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};