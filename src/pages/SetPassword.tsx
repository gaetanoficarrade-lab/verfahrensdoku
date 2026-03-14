import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/PasswordInput';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';

const SetPassword = () => {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const { updatePassword, session, loading } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Wait for Supabase to process the token from the URL and establish a session
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    if (hash.includes('type=recovery') || hash.includes('type=invite') || params.get('type') === 'invite') {
      setIsRecovery(true);
    }

    // If there's a hash with access_token, Supabase needs time to process it
    if (hash.includes('access_token')) {
      // onAuthStateChange in AuthContext will set the session
      // We just need to wait for it
      const checkSession = setInterval(() => {
        if (session) {
          setSessionReady(true);
          clearInterval(checkSession);
        }
      }, 200);
      // Timeout after 10s
      const timeout = setTimeout(() => {
        clearInterval(checkSession);
        setSessionReady(true); // Allow form to show even if session failed
      }, 10000);
      return () => {
        clearInterval(checkSession);
        clearTimeout(timeout);
      };
    } else if (session) {
      setSessionReady(true);
    }
  }, [session]);

  // Also set ready when session arrives later
  useEffect(() => {
    if (session) setSessionReady(true);
  }, [session]);

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
    const { error } = await updatePassword(password);
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

  if (loading || (!sessionReady && window.location.hash.includes('access_token'))) {
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
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">GoBD-Suite</h1>
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
