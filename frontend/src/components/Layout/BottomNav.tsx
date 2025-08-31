import { Link, useLocation } from 'react-router-dom';
import { Home, CreditCard, PiggyBank, MessageCircle, Activity } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Pay', href: '/pay', icon: CreditCard },
  { name: 'Save', href: '/save', icon: PiggyBank },
  { name: 'Chat', href: '/chat', icon: MessageCircle },
  { name: 'Activity', href: '/activity', icon: Activity },
];

export const BottomNav = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border backdrop-blur-sm z-40">
      <div className="flex items-center justify-around py-2">
        {navigation.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300 ${
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <IconComponent className={`h-5 w-5 ${active ? 'animate-bounce-in' : ''}`} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};