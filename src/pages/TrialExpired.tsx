import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PlanSelection from '@/components/PlanSelection';

export default function TrialExpired() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8">
      <Card className="border-destructive/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <CardTitle>Testzugang abgelaufen</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Ihre kostenlose Testphase ist abgelaufen. Wählen Sie einen Plan, um die GoBD-Suite weiterhin nutzen zu können.
          </p>
          <p className="text-xs text-muted-foreground">
            Ihre Daten bleiben erhalten und sind nach der Aktivierung sofort verfügbar.
          </p>
        </CardContent>
      </Card>

      <PlanSelection />
    </div>
  );
}
