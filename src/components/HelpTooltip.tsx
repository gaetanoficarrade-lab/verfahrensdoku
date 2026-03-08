import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HELP_TEXTS } from '@/lib/help-texts';

interface Props {
  textKey: keyof typeof HELP_TEXTS;
  className?: string;
}

export function HelpTooltip({ textKey, className = '' }: Props) {
  const text = HELP_TEXTS[textKey];
  if (!text) return null;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button type="button" className={`inline-flex items-center text-muted-foreground hover:text-foreground transition-colors ${className}`}>
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
