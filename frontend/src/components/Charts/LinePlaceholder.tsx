import { TrendingUp } from 'lucide-react';

interface LinePlaceholderProps {
  title: string;
  description?: string;
}

export const LinePlaceholder = ({ title, description }: LinePlaceholderProps) => {
  return (
    <div className="h-64 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center p-6">
      <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
        <div className="flex items-center">
          <div className="w-3 h-0.5 bg-primary mr-2"></div>
          <span>Savings Growth</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-0.5 bg-secondary mr-2"></div>
          <span>Monthly Target</span>
        </div>
      </div>
    </div>
  );
};