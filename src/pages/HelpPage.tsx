import { useState } from 'react';
import { HelpCircle, ChevronDown, Video, Mail, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { resetFirstStepsGuide } from '@/components/FirstStepsGuide';

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

export default function HelpPage() {
  const { toast } = useToast();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate sending
    await new Promise(r => setTimeout(r, 1000));
    toast({ title: 'Nachricht gesendet', description: 'Wir melden uns schnellstmöglich bei Ihnen.' });
    setContactForm({ name: '', email: '', message: '' });
    setSending(false);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <HelpCircle className="h-6 w-6" />
          Hilfe & Support
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Häufige Fragen, Anleitungen und Kontakt</p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => {
          resetFirstStepsGuide();
          toast({ title: 'Erste-Schritte-Guide zurückgesetzt', description: 'Der Guide wird beim nächsten Seitenaufruf angezeigt.' });
        }}>
          Erste-Schritte-Guide erneut starten
        </Button>
      </div>

      {/* FAQ */}
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

      {/* Video placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Video className="h-4 w-4" />
            Erklärvideos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center space-y-2">
              <Video className="h-12 w-12 text-muted-foreground/40 mx-auto" />
              <p className="text-sm text-muted-foreground">Erklärvideos werden in Kürze verfügbar sein.</p>
              <p className="text-xs text-muted-foreground/60">YouTube-Einbettung möglich</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Support kontaktieren
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={contactForm.name} onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>E-Mail</Label>
                <Input type="email" value={contactForm.email} onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nachricht</Label>
              <Textarea value={contactForm.message} onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))} rows={4} required />
            </div>
            <Button type="submit" disabled={sending}>
              {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Absenden
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
