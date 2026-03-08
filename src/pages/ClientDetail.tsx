import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, FolderOpen, Plus, UserPlus, Mail, Lock, Copy, Check, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { logAudit } from '@/lib/auditLog';

interface Client {
  id: string;
  company: string;
  industry: string | null;
  contact_name: string | null;
  contact_email: string | null;
  legal_form: string | null;
  founding_year: number | null;
  onboarding_status: string | null;
  user_id: string | null;
  tenant_id: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  status: string | null;
  workflow_status: string | null;
  created_at: string;
}

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const { effectiveTenantId } = useAuthContext();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);

  // Invite flow
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id || !effectiveTenantId) return;
    const fetch = async () => {
      setLoading(true);
      const [clientRes, projRes] = await Promise.all([
        supabase.from('clients').select('*').eq('id', id).eq('tenant_id', effectiveTenantId).single(),
        supabase.from('projects').select('id, name, status, workflow_status, created_at').eq('client_id', id).eq('tenant_id', effectiveTenantId).order('created_at', { ascending: false }),
      ]);
      setClient(clientRes.data);
      setProjects(projRes.data || []);
      setLoading(false);
    };
    fetch();
  }, [id, effectiveTenantId]);

  const handleInviteClient = async () => {
    if (!client || !effectiveTenantId) return;
    setInviting(true);
    setInviteLink(null);

    try {
      const { data, error } = await supabase.functions.invoke('invite-client', {
        body: {
          tenant_id: effectiveTenantId,
          client_id: client.id,
          email: inviteEmail.trim() || null,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const link = `${window.location.origin}/client-register?token=${data.token}`;
      setInviteLink(link);
      logAudit('client_user_created', 'client', client.id, { email: inviteEmail.trim(), type: 'invite_link' });
    } catch (err: any) {
      toast.error(err.message || 'Fehler beim Erstellen der Einladung.');
    } finally {
      setInviting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success('Link kopiert.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMailtoLink = () => {
    if (!inviteLink || !inviteEmail) return;
    const subject = encodeURIComponent(`Einladung zur Verfahrensdokumentation – ${client?.company || ''}`);
    const body = encodeURIComponent(
      `Sehr geehrte(r) ${client?.contact_name || 'Mandant'},\n\nSie wurden zur GoBD-Suite eingeladen. Bitte klicken Sie auf folgenden Link, um Ihr Konto zu erstellen:\n\n${inviteLink}\n\nDer Link ist 7 Tage gültig.\n\nMit freundlichen Grüßen`
    );
    window.open(`mailto:${inviteEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Mandant nicht gefunden.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/clients')}>Zurück</Button>
      </div>
    );
  }

  const infoRows = [
    { label: 'Branche', value: client.industry },
    { label: 'Ansprechpartner', value: client.contact_name },
    { label: 'E-Mail', value: client.contact_email },
    { label: 'Rechtsform', value: client.legal_form },
    { label: 'Gründungsjahr', value: client.founding_year },
    { label: 'Erstellt am', value: new Date(client.created_at).toLocaleDateString('de-DE') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{client.company}</h1>
          <p className="text-sm text-muted-foreground mt-1">Mandantendetails und Projekte</p>
        </div>
        <Badge variant="secondary">{client.onboarding_status || 'pending'}</Badge>
        {!client.user_id && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={() => {
              setInviteEmail(client.contact_email || '');
              setInviteLink(null);
              setCopied(false);
              setShowInvite(true);
            }}>
              <Send className="h-4 w-4" />
              Mandant einladen
            </Button>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => {
              setUserEmail(client.contact_email || '');
              setShowCreateUser(true);
            }}>
              <UserPlus className="h-4 w-4" />
              Zugang erstellen
            </Button>
          </div>
        )}
        {client.user_id && (
          <Badge variant="default" className="text-xs">Zugang aktiv</Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Stammdaten</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {infoRows.map((r) => (
              <div key={r.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="text-foreground font-medium">{r.value || '–'}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              Projekte ({projects.length})
            </CardTitle>
            <Button size="sm" className="gap-1" onClick={() => setShowNewProject(true)}>
              <Plus className="h-4 w-4" />
              Neues Projekt
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {projects.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">Noch keine Projekte vorhanden.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Erstellt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((p) => (
                    <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/projects/${p.id}`)}>
                      <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                      <TableCell><Badge variant="secondary">{p.status || 'draft'}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(p.created_at).toLocaleDateString('de-DE')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Project Dialog */}
      <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neues Projekt anlegen</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="text-sm font-medium text-foreground">Projektname</label>
            <Input
              placeholder="z.B. Verfahrensdokumentation 2025"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProject(false)}>Abbrechen</Button>
            <Button
              disabled={!newProjectName.trim() || creating}
              onClick={async () => {
                if (!id || !effectiveTenantId) return;
                setCreating(true);
                const { error } = await supabase.from('projects').insert({
                  tenant_id: effectiveTenantId,
                  client_id: id,
                  name: newProjectName.trim(),
                  status: 'draft',
                  workflow_status: 'onboarding',
                });
                setCreating(false);
                if (error) {
                  toast.error('Fehler beim Anlegen des Projekts.');
                  return;
                }
                toast.success('Projekt wurde angelegt.');
                logAudit('project_created', 'project', undefined, { name: newProjectName.trim(), client_id: id });
                setShowNewProject(false);
                setNewProjectName('');
                const { data } = await supabase
                  .from('projects')
                  .select('id, name, status, workflow_status, created_at')
                  .eq('client_id', id)
                  .eq('tenant_id', effectiveTenantId)
                  .order('created_at', { ascending: false });
                setProjects(data || []);
              }}
            >
              {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Anlegen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Direct User Creation Dialog */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mandanten-Zugang erstellen</DialogTitle>
            <DialogDescription>
              Erstellt einen Login-Account für {client.company} und verknüpft ihn automatisch.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="userEmail">E-Mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="userEmail"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="pl-10"
                  placeholder="mandant@beispiel.de"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="userPassword">Passwort</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="userPassword"
                  type="text"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="pl-10"
                  placeholder="Min. 8 Zeichen"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateUser(false)}>Abbrechen</Button>
            <Button
              disabled={!userEmail.trim() || !userPassword.trim() || userPassword.length < 8 || creatingUser}
              onClick={async () => {
                setCreatingUser(true);
                try {
                  const { data, error } = await supabase.functions.invoke('create-client-user', {
                    body: {
                      email: userEmail.trim(),
                      password: userPassword,
                      client_id: client.id,
                      tenant_id: client.tenant_id,
                    },
                  });
                  if (error) throw error;
                  if (data?.error) throw new Error(data.error);
                  toast.success(data.message || 'Zugang erstellt!');
                  logAudit('client_user_created', 'client', client.id, { email: userEmail.trim() });
                  setShowCreateUser(false);
                  setUserEmail('');
                  setUserPassword('');
                  const { data: updated } = await supabase.from('clients').select('*').eq('id', id!).eq('tenant_id', effectiveTenantId!).single();
                  if (updated) setClient(updated);
                } catch (err: any) {
                  toast.error(err.message || 'Fehler beim Erstellen des Zugangs.');
                } finally {
                  setCreatingUser(false);
                }
              }}
            >
              {creatingUser && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Zugang erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Client Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mandanten einladen</DialogTitle>
            <DialogDescription>
              Generieren Sie einen Einladungslink für {client.company}. Der Mandant erstellt damit selbst sein Konto.
            </DialogDescription>
          </DialogHeader>

          {!inviteLink ? (
            <>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>E-Mail des Mandanten</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="pl-10"
                      placeholder="mandant@beispiel.de"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInvite(false)}>Abbrechen</Button>
                <Button onClick={handleInviteClient} disabled={inviting}>
                  {inviting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Link generieren
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Einladungslink</Label>
                <div className="flex gap-2">
                  <Input value={inviteLink} readOnly className="font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={handleCopyLink}>
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Der Link ist 7 Tage gültig. Der Mandant erstellt damit sein eigenes Konto.
                </p>
              </div>
              <div className="flex gap-2">
                {inviteEmail && (
                  <Button variant="outline" size="sm" className="gap-1" onClick={handleMailtoLink}>
                    <Mail className="h-4 w-4" />
                    Per E-Mail senden
                  </Button>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInvite(false)}>Schließen</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
