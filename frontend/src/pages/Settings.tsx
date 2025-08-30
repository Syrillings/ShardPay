import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Globe, Shield, Trash2, Moon, Sun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MyInput } from '../components/ui/MyInput';
import { Chip } from '../components/ui/Chip';

export const Settings = () => {
  const [currency, setCurrency] = useState('SHM');
  const [theme, setTheme] = useState('system');
  const [notifications, setNotifications] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const currencyOptions = [
    { value: 'SHM', label: 'SHM (Shardeum)', symbol: 'Ş' },
    { value: 'USD', label: 'US Dollar', symbol: '$' },
    { value: 'EUR', label: 'Euro', symbol: '€' },
    { value: 'NGN', label: 'Nigerian Naira', symbol: '₦' },
  ];

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: SettingsIcon },
  ];

  const handleResetData = () => {
    // TODO: integrate data reset functionality
    console.log('Resetting mock data...');
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center">
            <SettingsIcon className="mr-3 h-8 w-8 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your preferences and account settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Display Name</label>
                <MyInput
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <MyInput
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button variant="hero" className="w-full sm:w-auto">
                Save Profile
              </Button>
            </CardContent>
          </Card>

          {/* Display Preferences */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                Display Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Currency Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">Primary Currency</label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {currencyOptions.map((option) => (
                    <Card
                      key={option.value}
                      variant={currency === option.value ? 'glow' : 'outline'}
                      padding="sm"
                      className="cursor-pointer transition-all duration-300"
                      onClick={() => setCurrency(option.value)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-muted-foreground">{option.symbol}</div>
                        </div>
                        {currency === option.value && (
                          <Chip variant="primary" size="sm">✓</Chip>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {themeOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <Card
                        key={option.value}
                        variant={theme === option.value ? 'glow' : 'outline'}
                        padding="sm"
                        className="cursor-pointer text-center transition-all duration-300"
                        onClick={() => setTheme(option.value)}
                      >
                        <IconComponent className="h-5 w-5 mx-auto mb-2" />
                        <div className="text-sm font-medium">{option.label}</div>
                        {theme === option.value && (
                          <Chip variant="primary" size="sm" className="mt-2">✓</Chip>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Get notified about transactions and savings goals
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      notifications ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Data */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Privacy & Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Anonymous Data Sharing</div>
                    <div className="text-sm text-muted-foreground">
                      Help improve ShardPay by sharing anonymized usage data
                    </div>
                  </div>
                  <button
                    onClick={() => setDataSharing(!dataSharing)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      dataSharing ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        dataSharing ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card variant="outline" className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <Trash2 className="mr-2 h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="font-medium">Reset Mock Data</div>
                  <div className="text-sm text-muted-foreground">
                    Clear all demo transactions and reset to initial state
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={handleResetData}
                  className="w-full sm:w-auto"
                >
                  Reset Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card variant="glass">
            <CardContent className="pt-6 text-center">
              <div className="mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary-foreground font-bold text-lg">S</span>
                </div>
                <h3 className="font-bold text-lg">ShardPay</h3>
                <p className="text-sm text-muted-foreground">Version 1.0.0 Beta</p>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Built on Shardeum • Powered by AI</p>
                <p>© 2024 ShardPay. All rights reserved.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};