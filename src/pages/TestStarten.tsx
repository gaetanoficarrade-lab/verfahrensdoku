import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, Building2, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function TestStarten() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptPrivacy || !acceptTerms) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Bitte stimmen Sie den Datenschutzbestimmungen und AGB zu.' });
      return;
    }
    if (password.length < 8) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Das Passwort muss mindestens 8 Zeichen lang sein.' });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-trial-account', {
        body: {
          email: email.trim(),
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          company_name: companyName.trim(),
        },
      });

      if (error) {
        // Try to parse response body
        let msg = 'Unbekannter Fehler';
        try {
          const ctx = error?.context;
          if (ctx && typeof ctx.text === 'function') {
            const raw = await ctx.text();
            const parsed = JSON.parse(raw);
            msg = parsed?.error || msg;
          }
        } catch {}
        throw new Error(msg);
      }

      if (data?.error) throw new Error(data.error);

      // Now sign in
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInErr) {
        toast({
          title: 'Konto erstellt',
          description: 'Ihr Testzugang wurde angelegt. Sie können sich jetzt anmelden.',
        });
        navigate('/auth');
      } else {
        toast({
          title: 'Willkommen!',
          description: '7 Tage kostenlos testen – viel Spaß beim Erkunden!',
        });
        navigate('/');
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Registrierung fehlgeschlagen',
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <img src="/images/logo.png" alt="Logo" className="mx-auto mb-4 h-14 object-contain" />
          <p className="mt-1 text-sm text-muted-foreground">
            7 Tage kostenlos testen – keine Zahlungsdaten erforderlich
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kostenlosen Test starten</CardTitle>
            <CardDescription>
              Erstellen Sie Ihr Testkonto und erkunden Sie alle Funktionen mit einem Muster-Mandanten.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Vorname</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@firma.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Firmenname</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="companyName"
                    placeholder="Ihre Firma GmbH"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 Zeichen"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* GDPR Consent */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="privacy"
                    checked={acceptPrivacy}
                    onCheckedChange={(v) => setAcceptPrivacy(v === true)}
                    className="mt-1"
                  />
                  <Label htmlFor="privacy" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                    Ich habe die <Link to="/datenschutz" target="_blank" className="text-foreground underline hover:text-primary">Datenschutzerklärung</Link> gelesen und stimme zu.
                  </Label>
                  </Label>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(v) => setAcceptTerms(v === true)}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                    Ich stimme den <Link to="/agb" target="_blank" className="text-foreground underline hover:text-primary">AGB</Link> zu.
                  </Label>
                  </Label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !acceptPrivacy || !acceptTerms}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Kostenlos testen
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Bereits ein Konto?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="text-primary hover:underline"
                >
                  Anmelden
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
