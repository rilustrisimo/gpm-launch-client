import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SenderPreset {
  id: string;
  name: string;
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  description?: string;
}

export const SENDER_PRESETS: SenderPreset[] = [
  {
    id: 'gravity-point',
    name: 'Gravity Point Media',
    fromName: 'Gravity Point Media',
    fromEmail: 'support@send.gravitypointmedia.com',
    replyToEmail: 'support@gravitypointmedia.com',
    description: 'Default company sender'
  },
  {
    id: 'manito-manita',
    name: 'Manito Manita',
    fromName: 'Manito Manita',
    fromEmail: 'info@manitomanita.com',
    replyToEmail: 'info@manitomanita.com',
    description: 'Manito Manita brand sender'
  },
  {
    id: 'custom',
    name: 'Custom',
    fromName: '',
    fromEmail: '',
    replyToEmail: '',
    description: 'Set your own sender details'
  }
];

interface SenderPresetsProps {
  selectedPresetId: string;
  onSelectPreset: (preset: SenderPreset) => void;
}

export function SenderPresets({ selectedPresetId, onSelectPreset }: SenderPresetsProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium mb-2 block">Quick Presets</Label>
        <p className="text-xs text-gray-500 mb-3">
          Choose a preset or select "Custom" to set your own sender details
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {SENDER_PRESETS.map((preset) => (
          <Button
            key={preset.id}
            type="button"
            variant={selectedPresetId === preset.id ? "default" : "outline"}
            className={cn(
              "justify-start text-left h-auto py-3 px-4",
              selectedPresetId === preset.id && "bg-brand-highlight hover:bg-brand-highlight/90"
            )}
            onClick={() => onSelectPreset(preset)}
          >
            <div className="flex flex-col gap-1">
              <span className="font-medium">{preset.name}</span>
              {preset.description && (
                <span className="text-xs opacity-80">{preset.description}</span>
              )}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}

// Helper function to get preset by ID
export function getPresetById(id: string): SenderPreset | undefined {
  return SENDER_PRESETS.find(preset => preset.id === id);
}

// Helper function to detect which preset matches current values
export function detectPreset(fromName: string, fromEmail: string): string {
  const matchedPreset = SENDER_PRESETS.find(
    preset => 
      preset.id !== 'custom' &&
      preset.fromName === fromName && 
      preset.fromEmail === fromEmail
  );
  return matchedPreset?.id || 'custom';
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
