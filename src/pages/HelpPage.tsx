import { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, Send, Loader2, MessageSquarePlus, Clock, CheckCircle2, AlertCircle, CircleDot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';


const FAQ = [
  { q: 'Was ist eine Verfahrensdokumentation?', a: 'Eine Verfahrensdokumentation beschreibt die in einem Unternehmen eingesetzten IT-gestützten Geschäftsprozesse gemäß den GoBD (Grundsätze zur ordnungsmäßigen Führung und Aufbewahrung von Büchern, Aufzeichnungen und Unterlagen in elektronischer Form). Sie ist für alle buchführungspflichtigen Unternehmen verpflichtend.' },
  { q: 'Wie funktioniert der Workflow?', a: 'Der Workflow besteht aus: 1) Onboarding (Stammdaten erfassen), 2) Mandant füllt Kapitel-Angaben aus, 3) KI-Precheck prüft auf Vollständigkeit, 4) Berater prüft und generiert professionelle Texte, 5) Freigabe der Kapitel, 6) Erstellung der finalen Verfahrensdokumentation als PDF.' },
  { q: 'Kann der Mandant seine Angaben ändern?', a: 'Ja, solange das Kapitel noch nicht vom Berater freigegeben wurde. Auch nach dem Einreichen kann der Mandant über "Änderung einreichen" seine Angaben aktualisieren.' },
  { q: 'Was passiert nach der Freigabe?', a: 'Nach der Freigabe aller Kapitel kann der Berater die vollständige Verfahrensdokumentation als PDF erstellen. Das PDF enthält alle freigegebenen Kapitel mit dem professionell formulierten Text.' },
  { q: 'Wie funktioniert die KI-Textgenerierung?', a: 'Die KI analysiert die Mandantenangaben und die Onboarding-Daten und erstellt daraus einen professionellen, GoBD-konformen Text. Der Berater kann den Text anschließend im Editor bearbeiten.' },
  { q: 'Was bedeuten die verschiedenen Status?', a: '"Offen" = noch keine Angaben, "Entwurf" = Mandant hat begonnen, "Eingereicht" = an Berater übermittelt, "Freigegeben" = vom Berater geprüft und genehmigt, "Nicht relevant" = Kapitel ist für diesen Mandanten nicht zutreffend.' },
  { q: 'Wie lade ich Mandanten ein?', a: 'Gehen Sie zur Mandantendetailseite und klicken Sie auf "Mandant einladen". Der Mandant erhält eine E-Mail mit einem Einladungslink und kann sich dann selbst registrieren.' },
  { q: 'Was ist der Unterschied zwischen Mandant und Teammitglied?', a: 'Mandanten sind Ihre Kunden, die ihre eigenen Angaben erfassen. Teammitglieder sind Ihre Kollegen, die gemeinsam an der Prüfung und Erstellung der Verfahrensdokumentation arbeiten.' },
];

const categoryLabels: Record<string, string> = {
  bug: 'Fehler melden',
  feature_request: 'Funktionswunsch',
  question: 'Frage',
  other: 'Sonstiges',
};

const priorityLabels: Record<string, string> = {
  low: 'Niedrig',
  medium: 'Mittel',
  high: 'Hoch',
};

const statusConfig: Record<string, { label: string; icon: React.ElementType; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  open: { label: 'Offen', icon: CircleDot, variant: 'default' },
  in_progress: { label: 'In Bearbeitung', icon: Clock, variant: 'secondary' },
  resolved: { label: 'Gelöst', icon: CheckCircle2, variant: 'outline' },
  closed: { label: 'Geschlossen', icon: AlertCircle, variant: 'outline' },
};

interface Ticket {
  id: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

export default function HelpPage() {
  const { toast } = useToast();
  const { user, effectiveTenantId } = useAuthContext();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    category: 'question',
    priority: 'medium',
    message: '',
  });

  const loadTickets = async () => {
    if (!effectiveTenantId) { setLoadingTickets(false); return; }
    setLoadingTickets(true);
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('tenant_id', effectiveTenantId)
      .order('created_at', { ascending: false });
    setTickets((data as Ticket[]) || []);
    setLoadingTickets(false);
  };

  useEffect(() => {
    loadTickets();
  }, [effectiveTenantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveTenantId || !user) return;

    if (!form.subject.trim() || !form.message.trim()) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Bitte füllen Sie Betreff und Nachricht aus.' });
      return;
    }

    setSending(true);
    const { error } = await supabase.from('support_tickets').insert({
      tenant_id: effectiveTenantId,
      user_id: user.id,
      subject: form.subject.trim(),
      message: form.message.trim(),
      category: form.category,
      priority: form.priority,
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Fehler', description: error.message });
    } else {
      toast({ title: 'Ticket erstellt', description: 'Wir kümmern uns schnellstmöglich um Ihr Anliegen.' });
      setForm({ subject: '', category: 'question', priority: 'medium', message: '' });
      loadTickets();
    }
    setSending(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Tabs defaultValue="tickets" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tickets" className="gap-1.5">
            <MessageSquarePlus className="h-4 w-4" />
            Support-Tickets
          </TabsTrigger>
          <TabsTrigger value="faq" className="gap-1.5">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </TabsTrigger>
        </TabsList>

        {/* TICKETS TAB */}
        <TabsContent value="tickets" className="space-y-6">
          {/* New ticket form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquarePlus className="h-4 w-4" />
                Neues Ticket erstellen
              </CardTitle>
              <CardDescription>Beschreiben Sie Ihr Anliegen – wir melden uns schnellstmöglich.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-1">
                    <Label>Betreff</Label>
                    <Input
                      placeholder="Kurze Beschreibung"
                      value={form.subject}
                      onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                      maxLength={200}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Kategorie</Label>
                    <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priorität</Label>
                    <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorityLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nachricht</Label>
                  <Textarea
                    placeholder="Beschreiben Sie Ihr Anliegen so detailliert wie möglich..."
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    rows={5}
                    maxLength={5000}
                    required
                  />
                </div>
                <Button type="submit" disabled={sending}>
                  {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Ticket absenden
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Ticket list */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Ihre Tickets {tickets.length > 0 && `(${tickets.length})`}
            </h3>
            {loadingTickets ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : tickets.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  Sie haben noch keine Tickets erstellt.
                </CardContent>
              </Card>
            ) : (
              tickets.map(ticket => {
                const sc = statusConfig[ticket.status] || statusConfig.open;
                const StatusIcon = sc.icon;
                return (
                  <Card key={ticket.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm text-foreground">{ticket.subject}</span>
                            <Badge variant="outline" className="text-xs">{categoryLabels[ticket.category] || ticket.category}</Badge>
                            <Badge variant={sc.variant} className="text-xs gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {sc.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{ticket.message}</p>
                          {ticket.admin_notes && (
                            <div className="mt-2 rounded-md bg-muted p-3">
                              <p className="text-xs font-medium text-foreground mb-1">Antwort vom Support:</p>
                              <p className="text-sm text-muted-foreground">{ticket.admin_notes}</p>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(ticket.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* FAQ TAB */}
        <TabsContent value="faq" className="space-y-6">
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={async () => {
              if (user) {
                await supabase.from('profiles').update({ onboarding_completed: false }).eq('user_id', user.id);
              }
              toast({ title: 'Erste-Schritte-Guide zurückgesetzt', description: 'Der Guide wird beim nächsten Seitenaufruf angezeigt.' });
            }}>
              Erste-Schritte-Guide erneut starten
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Häufig gestellte Fragen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {FAQ.map((faq, i) => (
                <Collapsible key={i} open={openFaq === i} onOpenChange={() => setOpenFaq(openFaq === i ? null : i)}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-md hover:bg-muted/50 transition-colors text-left">
                    <span className="text-sm font-medium text-foreground">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 pb-3">
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </CardContent>
          </Card>

        </TabsContent>
      </Tabs>
    </div>
  );
}
