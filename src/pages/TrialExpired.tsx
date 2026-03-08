import { AlertTriangle, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function TrialExpired() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md border-destructive/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <CardTitle>Testphase abgelaufen</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Ihre kostenlose Testphase ist abgelaufen. Bitte wählen Sie einen Plan, um die GoBD-Suite weiterhin nutzen zu können.
          </p>
          <Button onClick={() => navigate('/settings/billing')} className="w-full">
            <CreditCard className="h-4 w-4 mr-2" />
            Plan auswählen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
