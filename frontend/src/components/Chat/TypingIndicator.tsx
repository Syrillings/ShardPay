import { Bot } from 'lucide-react';
import { Card } from '../ui/Card';

export const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
        <Bot className="w-4 h-4" />
      </div>

      {/* Typing Animation */}
      <Card variant="default" padding="sm" className="animate-fade-in">
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground mr-2">Shard is thinking....give her a sec</span>
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </Card>
    </div>
  );
};