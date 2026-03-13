import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [legalSettings, setLegalSettings] = useState<{ imprint_url?: string; privacy_url?: string; imprint_text?: string; privacy_text?: string }>({});
  const { signIn, resetPassword, session, loading } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch platform legal settings (no auth needed)
  useEffect(() => {
    const fetchLegal = async () => {
      const { data } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'legal')
        .maybeSingle();
      if (data?.value) {
        setLegalSettings(data.value as typeof legalSettings);
      }
    };
    fetchLegal();
  }, []);

  // Check for recovery/invite tokens in hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      navigate('/set-password');
    } else if (hash.includes('type=invite')) {
      navigate('/set-password');
    }
  }, [navigate]);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && session) {
      navigate('/');
    }
  }, [session, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Anmeldung fehlgeschlagen',
        description: error.message,
      });
    }
    setIsLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await resetPassword(email);
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error.message,
      });
    } else {
      toast({
        title: 'E-Mail gesendet',
        description: 'Prüfen Sie Ihr Postfach für den Passwort-Reset-Link.',
      });
      setIsResetMode(false);
    }
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">GoBD-Suite</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verfahrensdokumentation nach GoBD
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isResetMode ? 'Passwort zurücksetzen' : 'Anmelden'}</CardTitle>
            <CardDescription>
              {isResetMode
                ? 'Geben Sie Ihre E-Mail-Adresse ein.'
                : 'Melden Sie sich mit Ihren Zugangsdaten an.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isResetMode ? handleReset : handleLogin} className="space-y-4">
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

              {!isResetMode && (
                <div className="space-y-2">
                  <Label htmlFor="password">Passwort</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
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
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isResetMode ? 'Link senden' : 'Anmelden'}
              </Button>

              <button
                type="button"
                onClick={() => setIsResetMode(!isResetMode)}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isResetMode ? 'Zurück zur Anmeldung' : 'Passwort vergessen?'}
              </button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <a href="https://gaetanoficarra.de/datenschutz" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline-offset-4 hover:underline">
            Datenschutz
          </a>
          <span>·</span>
          <a href="https://gaetanoficarra.de/impressum" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline-offset-4 hover:underline">
            Impressum
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
