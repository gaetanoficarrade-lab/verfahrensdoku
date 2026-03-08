import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { logAudit } from '@/lib/auditLog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Users, UserPlus, Loader2, Mail, Lock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  roles: string[];
}

export default function TeamSettings() {
  const { effectiveTenantId, user } = useAuthContext();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviting, setInviting] = useState(false);

  const fetchMembers = async () => {
    if (!effectiveTenantId) return;
    setLoading(true);

    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, email')
      .eq('tenant_id', effectiveTenantId);

    if (!profiles || profiles.length === 0) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const userIds = profiles.map((p) => p.user_id);
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', userIds);

    const roleMap: Record<string, string[]> = {};
    for (const r of roles || []) {
      if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
      roleMap[r.user_id].push(r.role);
    }

    setMembers(
      profiles.map((p) => ({
        ...p,
        roles: roleMap[p.user_id] || [],
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, [effectiveTenantId]);

  const handleInvite = async () => {
    if (!effectiveTenantId) return;
    setInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-client-user', {
        body: {
          email: email.trim(),
          password,
          tenant_id: effectiveTenantId,
          client_id: null,
          role: 'tenant_user',
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Team-Mitglied ${email} eingeladen.`);
      logAudit('client_user_created', 'team_member', undefined, { email: email.trim(), role: 'tenant_user' });
      setShowInvite(false);
      setEmail('');
      setPassword('');
      fetchMembers();
    } catch (err: any) {
      toast.error(err.message || 'Fehler beim Einladen.');
    } finally {
      setInviting(false);
    }
  };

  const roleLabelMap: Record<string, string> = {
    tenant_admin: 'Admin',
    tenant_user: 'Mitarbeiter',
    super_admin: 'Super-Admin',
    client: 'Mandant',
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6" />
          Team-Verwaltung
        </h1>
        <p className="text-muted-foreground mt-1">
          Verwalten Sie Ihre Team-Mitglieder und laden Sie neue Benutzer ein.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">{members.length} Mitglieder</CardTitle>
            <CardDescription>Alle Benutzer in Ihrem Team</CardDescription>
          </div>
          <Button size="sm" className="gap-1" onClick={() => setShowInvite(true)}>
            <UserPlus className="h-4 w-4" />
            Einladen
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {members.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Noch keine Team-Mitglieder.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Rolle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.user_id}>
                    <TableCell className="font-medium">
                      {[m.first_name, m.last_name].filter(Boolean).join(' ') || '–'}
                      {m.user_id === user?.id && (
                        <span className="ml-2 text-xs text-muted-foreground">(Sie)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{m.email || '–'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {m.roles.map((r) => (
                          <Badge key={r} variant="secondary" className="text-xs">
                            {roleLabelMap[r] || r}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Team-Mitglied einladen</DialogTitle>
            <DialogDescription>
              Erstellt einen neuen Benutzer-Account mit der Rolle "Mitarbeiter" (tenant_user).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">E-Mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="inviteEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="mitarbeiter@beispiel.de"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invitePassword">Passwort</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="invitePassword"
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="Min. 8 Zeichen"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>Abbrechen</Button>
            <Button
              disabled={!email.trim() || !password.trim() || password.length < 8 || inviting}
              onClick={handleInvite}
            >
              {inviting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Einladen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
