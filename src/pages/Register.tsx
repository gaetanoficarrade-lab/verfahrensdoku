import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/PasswordInput';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Register = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenData, setTokenData] = useState<any>(null);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [tenantBranding, setTenantBranding] = useState<{ brand_name?: string; logo_url?: string } | null>(null);
  const { signUp } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isTeamInvite = tokenData && !tokenData.client_id;

  useEffect(() => {
    if (!token) { setTokenValid(false); return; }
    const validate = async () => {
      const { data, error } = await supabase
        .from('invite_tokens')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();
      if (error || !data) { setTokenValid(false); return; }
      setTokenValid(true);
      setTokenData(data);
      // Load tenant branding
      if (data.tenant_id) {
        const { data: settings } = await supabase
          .from('tenant_settings')
          .select('brand_name, logo_url')
          .eq('tenant_id', data.tenant_id)
          .maybeSingle();
        if (settings) setTenantBranding(settings);
      }
    };
    validate();
  }, [token]);

  const brandName = tenantBranding?.brand_name || 'GoBD-Suite';
  const logoUrl = tenantBranding?.logo_url;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptPrivacy || !acceptTerms) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Bitte stimmen Sie den Datenschutzbestimmungen und AGB zu.' });
      return;
    }
    if (password !== passwordConfirm) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Die Passwörter stimmen nicht überein.' });
      return;
    }
    if (password.length < 8) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Das Passwort muss mindestens 8 Zeichen lang sein.' });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password, {
      first_name: firstName,
      last_name: lastName,
      invite_token: token,
      tenant_id: tokenData?.tenant_id,
      client_id: tokenData?.client_id || null,
      team_invite: isTeamInvite ? 'true' : null,
      consent_privacy: new Date().toISOString(),
      consent_terms: new Date().toISOString(),
    });

    if (error) {
      console.error('Registration error:', JSON.stringify(error, null, 2), error);
      const msg = error.message || error.error_description || error.msg || JSON.stringify(error);
      toast({ variant: 'destructive', title: 'Registrierung fehlgeschlagen', description: msg });
    } else {
      toast({
        title: 'Registrierung erfolgreich',
        description: 'Ihr Konto wurde erstellt. Sie können sich jetzt anmelden.',
      });
      navigate('/auth');
    }
    setIsLoading(false);
  };

  if (tokenValid === null) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!tokenValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Ungültiger Einladungslink</CardTitle>
            <CardDescription>Dieser Einladungslink ist ungültig oder abgelaufen.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          {logoUrl ? (
            <img src={logoUrl} alt={brandName} className="mx-auto mb-4 h-14 w-14 rounded-xl object-contain" />
          ) : (
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <Shield className="h-7 w-7 text-primary-foreground" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-foreground">{brandName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Konto erstellen</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registrierung</CardTitle>
            <CardDescription>
              Sie wurden eingeladen. Erstellen Sie jetzt Ihr Konto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Vorname</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="name@firma.de" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <PasswordInput id="password" placeholder="Min. 8 Zeichen" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">Passwort bestätigen</Label>
                <PasswordInput id="passwordConfirm" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required />
              </div>

              {/* GDPR Consent */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-start gap-2">
                  <Checkbox id="privacy" checked={acceptPrivacy} onCheckedChange={(v) => setAcceptPrivacy(v === true)} className="mt-1" />
                  <Label htmlFor="privacy" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                    Ich habe die <a href="/datenschutz" target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:text-primary">Datenschutzerklärung</a> gelesen und stimme zu.
                  </Label>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(v) => setAcceptTerms(v === true)} className="mt-1" />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                    Ich stimme den <a href="/agb" target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:text-primary">AGB</a> zu.
                  </Label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !acceptPrivacy || !acceptTerms}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Konto erstellen
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
