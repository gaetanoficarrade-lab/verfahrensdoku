import { useState, useEffect } from 'react';
import { Shield, Loader2, KeyRound, ScrollText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { HelpTooltip } from '@/components/HelpTooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface LoginLog {
  id: string;
  user_agent: string | null;
  ip_hash: string | null;
  created_at: string;
}

export default function SecuritySettings() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [qrUri, setQrUri] = useState('');
  const [factorId, setFactorId] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // Check MFA status on load
  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.mfa.listFactors();
      if (data?.totp && data.totp.length > 0) {
        const verified = data.totp.some(f => f.status === 'verified');
        setMfaEnabled(verified);
      }
      setLoading(false);
    };
    check();
  }, []);

  // Load login logs
  useEffect(() => {
    if (!user) return;
    const loadLogs = async () => {
      setLogsLoading(true);
      const { data } = await supabase
        .from('login_logs')
        .select('id, user_agent, ip_hash, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      setLoginLogs((data || []) as LoginLog[]);
      setLogsLoading(false);
    };
    loadLogs();
  }, [user]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'GoBD-Suite TOTP',
      });
      if (error) throw error;
      setQrUri(data.totp.uri);
      setFactorId(data.id);
    } catch (err: any) {
      toast({ title: 'Fehler', description: err.message, variant: 'destructive' });
    }
    setEnrolling(false);
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: verifyCode,
      });
      if (verifyError) throw verifyError;

      setMfaEnabled(true);
      setQrUri('');
      toast({ title: '2FA aktiviert', description: 'Zwei-Faktor-Authentifizierung wurde erfolgreich eingerichtet.' });
    } catch (err: any) {
      toast({ title: 'Verifizierung fehlgeschlagen', description: err.message, variant: 'destructive' });
    }
    setVerifying(false);
  };

  const handleUnenroll = async () => {
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      const factor = data?.totp?.find(f => f.status === 'verified');
      if (factor) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
        if (error) throw error;
        setMfaEnabled(false);
        toast({ title: '2FA deaktiviert', description: 'Zwei-Faktor-Authentifizierung wurde deaktiviert.' });
      }
    } catch (err: any) {
      toast({ title: 'Fehler', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Sicherheit
          <HelpTooltip textKey="two_factor" />
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Verwalten Sie Ihre Sicherheitseinstellungen</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Zwei-Faktor-Authentifizierung (2FA)
          </CardTitle>
          <CardDescription>
            Schützen Sie Ihr Konto mit einem zusätzlichen Verifizierungsschritt bei der Anmeldung.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground">Status:</span>
            <Badge variant={mfaEnabled ? 'default' : 'secondary'}>
              {mfaEnabled ? 'Aktiviert' : 'Nicht aktiviert'}
            </Badge>
          </div>

          {!mfaEnabled && !qrUri && (
            <Button onClick={handleEnroll} disabled={enrolling}>
              {enrolling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              2FA einrichten
            </Button>
          )}

          {qrUri && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Scannen Sie den QR-Code mit einer Authenticator-App (z.B. Google Authenticator, Authy):
              </p>
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrUri)}&size=200x200`} alt="2FA QR Code" className="w-48 h-48" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Verifizierungscode eingeben:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verifyCode}
                    onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm text-center tracking-widest font-mono"
                    maxLength={6}
                  />
                  <Button onClick={handleVerify} disabled={verifying || verifyCode.length !== 6}>
                    {verifying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Bestätigen
                  </Button>
                </div>
              </div>
            </div>
          )}

          {mfaEnabled && (
            <Button variant="destructive" onClick={handleUnenroll}>
              2FA deaktivieren
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Login Protocol */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5" />
            Login-Protokoll
          </CardTitle>
          <CardDescription>Ihre letzten Anmeldungen</CardDescription>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : loginLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine Anmeldungen protokolliert.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zeitpunkt</TableHead>
                  <TableHead>Browser / Gerät</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {new Date(log.created_at).toLocaleString('de-DE')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate max-w-xs">
                      {log.user_agent || 'Unbekannt'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
