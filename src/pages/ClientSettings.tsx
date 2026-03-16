import { useState } from 'react';
import { Settings, Download, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { HelpTooltip } from '@/components/HelpTooltip';

export default function ClientSettings() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletionRequested, setDeletionRequested] = useState(false);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      // Fetch client data
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user?.id);

      if (!clientData || clientData.length === 0) {
        toast({ title: 'Keine Daten', description: 'Es wurden keine Daten gefunden.', variant: 'destructive' });
        setExportLoading(false);
        return;
      }

      const clientIds = clientData.map(c => c.id);
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name')
        .in('client_id', clientIds);

      const projectIds = (projects || []).map(p => p.id);
      const { data: chapters } = await supabase
        .from('chapter_data')
        .select('chapter_key, client_notes, editor_text, generated_text')
        .in('project_id', projectIds);

      const { data: onboardings } = await supabase
        .from('project_onboarding')
        .select('answers')
        .in('project_id', projectIds);

      // Create text file
      let content = '=== DATENEXPORT ===\n\n';
      content += '--- Kundendaten ---\n';
      clientData.forEach(c => {
        content += `Firma: ${c.company}\nBranche: ${c.industry || '-'}\nKontakt: ${c.contact_name || '-'}\n\n`;
      });

      content += '\n--- Onboarding-Antworten ---\n';
      (onboardings || []).forEach((o: any) => {
        content += JSON.stringify(o.answers, null, 2) + '\n\n';
      });

      content += '\n--- Kapitel ---\n';
      (chapters || []).forEach(ch => {
        content += `\n[${ch.chapter_key}]\n`;
        content += `Notizen: ${ch.client_notes || '-'}\n`;
        content += `Text: ${ch.editor_text || ch.generated_text || '-'}\n`;
      });

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `datenexport_${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: 'Export erstellt', description: 'Ihre Daten wurden heruntergeladen.' });
    } catch (err: any) {
      toast({ title: 'Fehler', description: err.message, variant: 'destructive' });
    }
    setExportLoading(false);
  };

  const handleDeletionRequest = async () => {
    setDeleteLoading(true);
    try {
      const { error } = await supabase.from('deletion_requests').insert({
        user_id: user?.id,
        status: 'pending',
      });
      if (error) throw error;
      setDeletionRequested(true);
      toast({ title: 'Löschantrag eingereicht', description: 'Ihr Antrag wird schnellstmöglich bearbeitet.' });
    } catch (err: any) {
      toast({ title: 'Fehler', description: err.message, variant: 'destructive' });
    }
    setDeleteLoading(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Einstellungen
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Datenschutz und Datenmanagement</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Daten exportieren
            <HelpTooltip textKey="data_export" />
          </CardTitle>
          <CardDescription>Laden Sie alle Ihre personenbezogenen Daten herunter (DSGVO Art. 20).</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExport} disabled={exportLoading}>
            {exportLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Meine Daten exportieren
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Datenlöschung beantragen
            <HelpTooltip textKey="data_deletion" />
          </CardTitle>
          <CardDescription>
            Nach der Löschung werden alle personenbezogenen Daten anonymisiert. Verfahrensdokumentationen bleiben für die gesetzliche Aufbewahrungspflicht erhalten.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deletionRequested ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              Ihr Löschantrag wurde eingereicht und wird bearbeitet.
            </div>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleteLoading}>
                  {deleteLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Datenlöschung beantragen
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Datenlöschung beantragen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre personenbezogenen Daten werden unwiderruflich anonymisiert.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeletionRequest} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Ja, Löschung beantragen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
