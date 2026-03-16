import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/PasswordInput';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SetPassword = () => {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Store the initial session so it survives failed attempts
  const capturedSessionRef = useRef<{ access_token: string; refresh_token: string } | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    if (hash.includes('type=recovery') || hash.includes('type=invite') || params.get('type') === 'invite') {
      setIsRecovery(true);
    }

    // Listen for the session that Supabase establishes from the URL token
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (sess && !capturedSessionRef.current) {
        capturedSessionRef.current = {
          access_token: sess.access_token,
          refresh_token: sess.refresh_token,
        };
        setSessionReady(true);
        setInitialLoading(false);
      }
    });

    // Also check if there's already a session
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      if (sess) {
        capturedSessionRef.current = {
          access_token: sess.access_token,
          refresh_token: sess.refresh_token,
        };
        setSessionReady(true);
      }
      setInitialLoading(false);
    });

    // Timeout after 10s
    const timeout = setTimeout(() => {
      setInitialLoading(false);
      setSessionReady(true);
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Restore session if it was lost (e.g. after a failed updateUser call)
  const ensureSession = async (): Promise<boolean> => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession) return true;

    // Session lost – restore from captured tokens
    if (capturedSessionRef.current) {
      const { error } = await supabase.auth.setSession(capturedSessionRef.current);
      if (!error) return true;
      console.error('Failed to restore session:', error.message);
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Die Passwörter stimmen nicht überein.',
      });
      return;
    }
    if (password.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
      });
      return;
    }

    setIsLoading(true);

    // Ensure we have a valid session before attempting
    const hasSession = await ensureSession();
    if (!hasSession) {
      toast({
        variant: 'destructive',
        title: 'Sitzung abgelaufen',
        description: 'Bitte nutzen Sie den Einladungslink erneut.',
      });
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error.message,
      });
    } else {
      toast({
        title: 'Passwort gesetzt',
        description: 'Sie werden weitergeleitet...',
      });
      setTimeout(() => navigate('/'), 1500);
    }
    setIsLoading(false);
  };

  if (initialLoading || (!sessionReady && window.location.hash.includes('access_token'))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Sitzung wird hergestellt...</p>
        </div>
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
          <img src="/images/logo.png" alt="Logo" className="mx-auto mb-4 h-12 object-contain" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {isRecovery ? 'Neues Passwort setzen' : 'Passwort festlegen'}
            </CardTitle>
            <CardDescription>
              Wählen Sie ein sicheres Passwort (min. 8 Zeichen).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Neues Passwort</Label>
                <PasswordInput
                  id="password"
                  placeholder="Min. 8 Zeichen"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">Passwort bestätigen</Label>
                <PasswordInput
                  id="passwordConfirm"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Passwort speichern
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SetPassword;
