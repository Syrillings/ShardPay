import { PieChart } from 'lucide-react';

interface PiePlaceholderProps {
  title: string;
  description?: string;
  data?: Array<{
    category: string;
    value: number;
    color: string;
  }> | null;
}

export const PiePlaceholder = ({ title, description, data }: PiePlaceholderProps) => {
  return (
    <div className="h-64 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center p-6">
      <PieChart className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      
      {data && (
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          {data.slice(0, 4).map((item) => (
            <div key={item.category} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span>{item.category}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};