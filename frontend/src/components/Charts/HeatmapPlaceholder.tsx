import { Calendar } from 'lucide-react';

interface HeatmapPlaceholderProps {
  title: string;
  description?: string;
  data?: {
    hours: Array<{ hour: number; value: number }>;
    days: Array<{ day: string; value: number }>;
  } | null;
}

export const HeatmapPlaceholder = ({ title, description, data }: HeatmapPlaceholderProps) => {
  return (
    <div className="h-64 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center p-6">
      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      
      {data && (
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-center space-x-2">
            <span>🔥</span>
            <span>Peak: 2-4 PM</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span>📅</span>
            <span>Busiest: Tuesday</span>
          </div>
        </div>
      )}
    </div>
  );
};