import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RatePresetButtonsProps {
  currentRate: number;
  onRateChange: (rate: number) => void;
  disabled?: boolean;
}

const presets = [
  { rate: 10, label: '10/min', emoji: '🐌', color: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700', tip: 'Ultra slow - Best deliverability' },
  { rate: 30, label: '30/min', emoji: '🐢', color: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700', tip: 'Slow - Excellent deliverability' },
  { rate: 60, label: '60/min', emoji: '🚶', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700', tip: 'Steady - Good deliverability' },
  { rate: 120, label: '120/min', emoji: '🏃', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700', tip: 'Fast - Moderate deliverability' },
  { rate: 300, label: '300/min', emoji: '🚗', color: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700', tip: 'Very fast - Lower deliverability' },
  { rate: 600, label: '600/min', emoji: '🚀', color: 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700', tip: 'Maximum - Risk of blocking' },
];

export const RatePresetButtons: React.FC<RatePresetButtonsProps> = ({
  currentRate,
  onRateChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium text-gray-700">Quick Rate Presets</h4>
        <Badge variant="secondary" className="text-xs">
          Recommended
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2" role="radiogroup" aria-label="Email sending rate presets">
        {presets.map(({ rate, label, emoji, color, tip }) => {
          const isSelected = currentRate === rate;
          
          return (
            <Button
              key={rate}
              onClick={() => onRateChange(rate)}
              disabled={disabled}
              variant="outline"
              size="sm"
              role="radio"
              aria-checked={isSelected}
              aria-label={`Set rate to ${label}. ${tip}`}
              title={tip}
              className={cn(
                'flex flex-col items-center gap-1 h-auto py-3 px-2 text-xs transition-all duration-200',
                color,
                isSelected && 'ring-2 ring-blue-500 ring-offset-1 shadow-md scale-105',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span className="text-lg leading-none" aria-hidden="true">{emoji}</span>
              <span className="font-medium">{label}</span>
              {isSelected && (
                <Badge variant="default" className="text-xs px-1 py-0 bg-blue-600" aria-label="Currently selected">
                  Selected
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
      
      {/* Deliverability guide */}
      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h5 className="text-xs font-medium text-blue-800 mb-2">📋 Deliverability Guide</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-700">
          <div className="flex items-center gap-1">
            <span>🐌 10-30/min:</span>
            <span>Maximum deliverability</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🚶 60-120/min:</span>
            <span>Balanced speed/quality</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🚗 300+/min:</span>
            <span>Speed over deliverability</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🚀 600/min:</span>
            <span>Maximum risk of blocking</span>
          </div>
        </div>
      </div>
    </div>
  );
};
