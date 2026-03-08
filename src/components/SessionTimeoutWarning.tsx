import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Clock } from 'lucide-react';

interface Props {
  open: boolean;
  remainingSeconds: number;
  onDismiss: () => void;
}

export function SessionTimeoutWarning({ open, remainingSeconds, onDismiss }: Props) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-destructive" />
            Sitzung läuft ab
          </AlertDialogTitle>
          <AlertDialogDescription>
            Sie werden in {minutes}:{seconds.toString().padStart(2, '0')} Minuten aufgrund von Inaktivität automatisch abgemeldet.
            Klicken Sie auf "Weiter arbeiten" um angemeldet zu bleiben.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onDismiss}>Weiter arbeiten</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
