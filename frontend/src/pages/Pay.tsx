import { useState } from 'react';
import { Send, Sparkles, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MyInput } from '../components/ui/MyInput';
import { Chip } from '../components/ui/Chip';
import { usePay } from '../hooks/usePay';
import { AISuggestionModal } from '../components/Modals/AISuggestionModal';

export const Pay = () => {
  const [showAIModal, setShowAIModal] = useState(false);
  const [formData, setFormData] = useState({
    to: '',
    amount: '',
    memo: '',
  });

  const { 
    isProcessing, 
    errors, 
    lastTransaction, 
    preparePayment, 
    submitPayment,
    getAISuggestion 
  } = usePay();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAIAssist = async () => {
    if (formData.amount) {
      setShowAIModal(true);
    }
  };

  const handleSubmit = async () => {
    const isValid = preparePayment(formData);
    if (isValid) {
      await submitPayment();
    }
  };

  if (lastTransaction) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20 md:pb-8">
        <Card variant="glow" className="max-w-md mx-auto animate-bounce-in">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-success" />
            <h2 className="text-2xl font-bold mb-2">Payment Sent!</h2>
            <p className="text-muted-foreground mb-6">
              Your payment has been successfully processed on Shardeum
            </p>
            
            <div className="bg-muted rounded-xl p-4 mb-6">
              <div className="text-sm text-muted-foreground mb-1">Transaction Hash</div>
              <div className="font-mono text-xs break-all">{lastTransaction.hash}</div>
            </div>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">{lastTransaction.amount} SHM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To:</span>
                <span className="font-mono text-sm">{lastTransaction.to?.slice(0, 10)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Chip variant="success">{lastTransaction.status}</Chip>
              </div>
            </div>
            
            <Button 
              variant="hero" 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Send Another Payment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center">
            <Send className="mr-3 h-8 w-8 text-primary" />
            Send Payment
          </h1>
          <p className="text-muted-foreground">
            Send SHM to any wallet address on Shardeum
          </p>
        </div>

        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Recipient Address
              </label>
              <MyInput
                variant={errors.to ? 'error' : 'default'}
                placeholder="0x742d35Cc6c4165CC3c346F0CFBC846DC"
                value={formData.to}
                onChange={(e) => handleInputChange('to', e.target.value)}
              />
              {errors.to && (
                <p className="text-destructive text-sm mt-1">{errors.to}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Amount (SHM)
              </label>
              <MyInput
                variant={errors.amount ? 'error' : 'default'}
                placeholder="0.00"
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
              />
              {errors.amount && (
                <p className="text-destructive text-sm mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Memo (Optional)
              </label>
              <MyInput
                placeholder="Payment for coffee..."
                value={formData.memo}
                onChange={(e) => handleInputChange('memo', e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleAIAssist}
                disabled={!formData.amount}
                className="flex-1"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Ask AI for Suggestions
              </Button>
              
              <Button
                variant="glow"
                onClick={handleSubmit}
                disabled={isProcessing || !formData.to || !formData.amount}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : 'Send Payment'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Features Preview */}
        <Card variant="glass">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <Sparkles className="mr-2 h-5 w-5 text-primary" />
              <h3 className="font-semibold">AI-Powered Features</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <span className="mr-2">💡</span>
                <span>Smart tip suggestions</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">🏦</span>
                <span>Micro-saving recommendations</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">📊</span>
                <span>Spending pattern analysis</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">🛡️</span>
                <span>Transaction safety checks</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <AISuggestionModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          amount={formData.amount}
        />
      </div>
    </div>
  );
};