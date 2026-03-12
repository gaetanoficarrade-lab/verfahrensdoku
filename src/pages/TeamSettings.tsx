import { useState, useEffect, useCallback } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Loader2, Mail, Copy, Check, Clock, UserX, ShieldCheck, RefreshCw, Send } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface TeamMember {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  roles: string[];
}

interface PendingInvite {
  id: string;
  token: string;
  role: string;
  email: string | null;
  created_at: string;
  expires_at: string;
}

export default function TeamSettings() {
  const { effectiveTenantId, user } = useAuthContext();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('tenant_user');
  const [inviting, setInviting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [showResendDialog, setShowResendDialog] = useState(false);
  const [selectedResendToken, setSelectedResendToken] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState('');
  const [resendingInvite, setResendingInvite] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!effectiveTenantId) return;
    setLoading(true);

    const [profilesRes, invitesRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .eq('tenant_id', effectiveTenantId),
      supabase
        .from('invite_tokens')
        .select('id, token, created_at, expires_at')
        .eq('tenant_id', effectiveTenantId)
        .eq('is_active', true)
        .is('client_id', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false }),
    ]);

    const profiles = profilesRes.data || [];
    const invites = invitesRes.data || [];

    // Fetch roles for all members
    if (profiles.length > 0) {
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

      // Only show tenant_admin and tenant_user members (not clients)
      setMembers(
        profiles
          .map((p) => ({ ...p, roles: roleMap[p.user_id] || [] }))
          .filter((m) => m.roles.some((r) => r === 'tenant_admin' || r === 'tenant_user'))
      );
    } else {
      setMembers([]);
    }

    setPendingInvites(invites.map((inv) => ({
      ...inv,
      role: 'tenant_user',
      email: null,
    })));

    setLoading(false);
  }, [effectiveTenantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInvite = async () => {
    if (!effectiveTenantId) return;
    setInviting(true);
    setGeneratedLink(null);

    try {
      const { data, error } = await supabase.functions.invoke('invite-team-member', {
        body: {
          tenant_id: effectiveTenantId,
          email: inviteEmail.trim() || null,
          role: inviteRole,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const link = `${window.location.origin}/register?token=${data.token}`;
      setGeneratedLink(link);
      logAudit('client_user_created', 'team_invite', data.invite_id, {
        email: inviteEmail.trim() || null,
        role: inviteRole,
      });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Fehler beim Erstellen der Einladung.');
    } finally {
      setInviting(false);
    }
  };

  const handleCopyLink = async (link: string) => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link in Zwischenablage kopiert.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevokeInvite = async (inviteId: string) => {
    const { error } = await supabase
      .from('invite_tokens')
      .update({ is_active: false })
      .eq('id', inviteId);
    if (error) {
      toast.error('Fehler beim Widerrufen.');
    } else {
      toast.success('Einladung widerrufen.');
      fetchData();
    }
  };

  const handleResendInvite = async () => {
    if (!selectedResendToken || !resendEmail.trim()) return;
    setResendingInvite(selectedResendToken);
    try {
      const { data, error } = await supabase.functions.invoke('resend-invite', {
        body: {
          invite_token: selectedResendToken,
          email: resendEmail.trim(),
          type: 'team',
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success('Einladung erneut versendet.');
      setShowResendDialog(false);
    } catch (err: any) {
      toast.error(err.message || 'Fehler beim erneuten Versenden.');
    } finally {
      setResendingInvite(null);
    }
  };

  const handleChangeRole = async (memberId: string, currentRoles: string[], newRole: string) => {
    if (memberId === user?.id) {
      toast.error('Sie können Ihre eigene Rolle nicht ändern.');
      return;
    }
    setChangingRole(memberId);

    try {
      const oldTenantRole = currentRoles.find((r) => r === 'tenant_admin' || r === 'tenant_user');
      if (oldTenantRole) {
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', memberId)
          .eq('role', oldTenantRole);
      }
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: memberId, role: newRole });
      if (error) throw error;

      toast.success('Rolle geändert.');
      logAudit('settings_updated', 'team_member', memberId, { new_role: newRole });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Fehler beim Ändern der Rolle.');
    } finally {
      setChangingRole(null);
    }
  };

  const handleDeactivate = async (memberId: string) => {
    if (memberId === user?.id) {
      toast.error('Sie können sich nicht selbst deaktivieren.');
      return;
    }

    // Remove tenant roles
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', memberId)
      .in('role', ['tenant_admin', 'tenant_user']);

    if (error) {
      toast.error('Fehler beim Deaktivieren.');
    } else {
      toast.success('Mitglied deaktiviert.');
      logAudit('settings_updated', 'team_member', memberId, { action: 'deactivated' });
      fetchData();
    }
  };

  const roleLabelMap: Record<string, string> = {
    tenant_admin: 'Admin',
    tenant_user: 'Mitarbeiter',
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

      {/* Active Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">{members.length} Mitglieder</CardTitle>
            <CardDescription>Aktive Benutzer in Ihrem Team</CardDescription>
          </div>
          <Button size="sm" className="gap-1" onClick={() => {
            setShowInvite(true);
            setGeneratedLink(null);
            setInviteEmail('');
            setInviteRole('tenant_user');
          }}>
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
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => {
                  const isSelf = m.user_id === user?.id;
                  const currentTenantRole = m.roles.find((r) => r === 'tenant_admin' || r === 'tenant_user') || 'tenant_user';

                  return (
                    <TableRow key={m.user_id}>
                      <TableCell className="font-medium">
                        {[m.first_name, m.last_name].filter(Boolean).join(' ') || '–'}
                        {isSelf && (
                          <span className="ml-2 text-xs text-muted-foreground">(Sie)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{m.email || '–'}</TableCell>
                      <TableCell>
                        {isSelf ? (
                          <Badge variant="secondary" className="text-xs">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            {roleLabelMap[currentTenantRole] || currentTenantRole}
                          </Badge>
                        ) : (
                          <Select
                            value={currentTenantRole}
                            onValueChange={(val) => handleChangeRole(m.user_id, m.roles, val)}
                            disabled={changingRole === m.user_id}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tenant_admin">Admin</SelectItem>
                              <SelectItem value="tenant_user">Mitarbeiter</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!isSelf && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivate(m.user_id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Ausstehende Einladungen ({pendingInvites.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Einladungslink</TableHead>
                  <TableHead>Erstellt</TableHead>
                  <TableHead>Läuft ab</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvites.map((inv) => {
                  const link = `${window.location.origin}/register?token=${inv.token}`;
                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-xs max-w-[200px] truncate">
                        {link}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(inv.created_at), 'dd.MM.yyyy', { locale: de })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(inv.expires_at), 'dd.MM.yyyy', { locale: de })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleCopyLink(link)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeInvite(inv.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <UserX className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Team-Mitglied einladen</DialogTitle>
            <DialogDescription>
              Generieren Sie einen Einladungslink. Die eingeladene Person erstellt damit selbst ihr Konto.
            </DialogDescription>
          </DialogHeader>

          {!generatedLink ? (
            <>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>E-Mail (optional)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="pl-10"
                      placeholder="mitarbeiter@beispiel.de"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Optional – der Link kann auch ohne E-Mail-Adresse geteilt werden.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Rolle</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tenant_user">Mitarbeiter</SelectItem>
                      <SelectItem value="tenant_admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInvite(false)}>Abbrechen</Button>
                <Button onClick={handleInvite} disabled={inviting}>
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
                  <Input value={generatedLink} readOnly className="font-mono text-xs" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyLink(generatedLink)}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Teilen Sie diesen Link mit dem neuen Team-Mitglied. Der Link ist 7 Tage gültig.
                </p>
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
