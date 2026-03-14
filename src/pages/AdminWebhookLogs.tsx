import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, AlertCircle, CheckCircle2, Clock, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WebhookLog {
  id: string;
  source: string;
  event_type: string;
  customer_email: string | null;
  status: string;
  error_message: string | null;
  payload: any;
  created_at: string;
}

const AdminWebhookLogs = () => {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) {
      toast({ variant: 'destructive', title: 'Fehler', description: error.message });
    }
    setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleRetry = async (log: WebhookLog) => {
    // Re-invoke the webhook function with the original payload
    const { error } = await supabase.functions.invoke('funnelpay-webhook', {
      body: log.payload,
    });
    if (error) {
      toast({ variant: 'destructive', title: 'Fehler beim erneuten Verarbeiten', description: error.message });
    } else {
      toast({ title: 'Webhook erneut verarbeitet' });
      fetchLogs();
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" />Verarbeitet</Badge>;
      case 'error':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Fehler</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />In Bearbeitung</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Webhook-Protokoll</h1>
          <p className="text-sm text-muted-foreground mt-1">Eingehende Funnelpay Webhooks</p>
        </div>
        <Button variant="outline" onClick={fetchLogs} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Aktualisieren
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Datum</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Event</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kunde</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fehler</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      Noch keine Webhooks empfangen.
                    </td>
                  </tr>
                )}
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {new Date(log.created_at).toLocaleString('de-DE')}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{log.event_type}</code>
                    </td>
                    <td className="px-4 py-3">{log.customer_email || '–'}</td>
                    <td className="px-4 py-3">{statusBadge(log.status)}</td>
                    <td className="px-4 py-3 text-destructive text-xs max-w-[200px] truncate">
                      {log.error_message || '–'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {log.status === 'error' && (
                        <Button variant="ghost" size="sm" onClick={() => handleRetry(log)} className="gap-1">
                          <RotateCcw className="h-3 w-3" />
                          Wiederholen
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWebhookLogs;
