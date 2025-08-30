import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { Sparkles, PiggyBank, Percent } from 'lucide-react';
import { usePay } from '../../hooks/usePay';

interface AISuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
}

export const AISuggestionModal = ({ isOpen, onClose, amount }: AISuggestionModalProps) => {
  const { getAISuggestion } = usePay();
  const [suggestion, setSuggestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tipEnabled, setTipEnabled] = useState(false);
  const [microSaveEnabled, setMicroSaveEnabled] = useState(false);

  useEffect(() => {
    if (isOpen && amount) {
      loadSuggestion();
    }
  }, [isOpen, amount]);

  const loadSuggestion = async () => {
    setLoading(true);
    try {
      const result = await getAISuggestion(amount);
      setSuggestion(result);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    // TODO: integrate with payment flow
    console.log('AI suggestions applied:', { tipEnabled, microSaveEnabled, suggestion });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-primary" />
            AI Payment Suggestions
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Analyzing payment...</span>
          </div>
        ) : suggestion ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">{suggestion.message}</p>
            </div>

            {/* Tip Suggestion */}
            <Card 
              variant={tipEnabled ? 'glow' : 'outline'}
              className="cursor-pointer transition-all duration-300"
              onClick={() => setTipEnabled(!tipEnabled)}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Percent className="mr-3 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Add Tip</div>
                      <div className="text-sm text-muted-foreground">
                        Suggested: {suggestion.tip}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Chip variant={tipEnabled ? 'primary' : 'outline'} size="sm">
                      {tipEnabled ? '✓ Enabled' : 'Disabled'}
                    </Chip>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Micro-Save Suggestion */}
            <Card 
              variant={microSaveEnabled ? 'glow' : 'outline'}
              className="cursor-pointer transition-all duration-300"
              onClick={() => setMicroSaveEnabled(!microSaveEnabled)}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <PiggyBank className="mr-3 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Micro-Save</div>
                      <div className="text-sm text-muted-foreground">
                        Save ₦{suggestion.microSave} to vault
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Chip variant={microSaveEnabled ? 'primary' : 'outline'} size="sm">
                      {microSaveEnabled ? '✓ Enabled' : 'Disabled'}
                    </Chip>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Skip Suggestions
              </Button>
              <Button 
                variant="glow" 
                onClick={handleConfirm}
                className="flex-1"
                disabled={!tipEnabled && !microSaveEnabled}
              >
                Apply & Continue
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No suggestions available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};