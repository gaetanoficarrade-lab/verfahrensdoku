import { useState, useRef, useCallback } from 'react';
import { LifeBuoy, X, Camera, Loader2, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export function SupportWidget() {
  const { user, effectiveTenantId, roles } = useAuthContext();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [screenshotting, setScreenshotting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshotBlob, setScreenshotBlob] = useState<Blob | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const formRef = useRef({ title: '', description: '' });

  const isSuperAdmin = roles.includes('super_admin');

  // Check if tenant has widget enabled — Super admins don't need the widget
  const { data: widgetEnabled = true } = useQuery({
    queryKey: ['support-widget-enabled', effectiveTenantId],
    queryFn: async () => {
      if (!effectiveTenantId) return true;
      try {
        const { data } = await supabase
          .from('tenants')
          .select('support_widget_disabled')
          .eq('id', effectiveTenantId)
          .maybeSingle();
        return data ? !data.support_widget_disabled : true;
      } catch {
        return true;
      }
    },
    enabled: !!effectiveTenantId && !isSuperAdmin,
  });

  if (isSuperAdmin || !widgetEnabled) return null;

  const takeScreenshot = async () => {
    formRef.current = { title, description };
    setOpen(false);
    setScreenshotting(true);

    // Wait for dialog to close
    await new Promise(r => setTimeout(r, 400));

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: 1,
        logging: false,
      });
      canvas.toBlob((blob) => {
        if (blob) {
          setScreenshotBlob(blob);
          setScreenshotPreview(URL.createObjectURL(blob));
        }
        setTitle(formRef.current.title);
        setDescription(formRef.current.description);
        setScreenshotting(false);
        setOpen(true);
      }, 'image/png');
    } catch (err) {
      console.error('Screenshot error:', err);
      setTitle(formRef.current.title);
      setDescription(formRef.current.description);
      setScreenshotting(false);
      setOpen(true);
      toast({ variant: 'destructive', title: 'Fehler', description: 'Screenshot konnte nicht erstellt werden.' });
    }
  };

  const removeScreenshot = () => {
    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    setScreenshotBlob(null);
    setScreenshotPreview(null);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Bitte geben Sie einen Titel ein.' });
      return;
    }
    if (!user || !effectiveTenantId) return;

    setSending(true);
    try {
      // Get user profile and tenant info
      const [profileRes, tenantRes] = await Promise.all([
        supabase.from('profiles').select('first_name, last_name, email').eq('user_id', user.id).maybeSingle(),
        supabase.from('tenants').select('name').eq('id', effectiveTenantId).maybeSingle(),
      ]);

      const userName = [profileRes.data?.first_name, profileRes.data?.last_name].filter(Boolean).join(' ') || user.email || '';
      const userEmail = profileRes.data?.email || user.email || '';
      const tenantName = tenantRes.data?.name || '';

      let screenshotUrl: string | null = null;

      // Upload screenshot if exists
      if (screenshotBlob) {
        const fileName = `${effectiveTenantId}/${Date.now()}.png`;
        const { error: uploadErr } = await supabase.storage
          .from('support-screenshots')
          .upload(fileName, screenshotBlob, { contentType: 'image/png' });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage
            .from('support-screenshots')
            .getPublicUrl(fileName);
          screenshotUrl = urlData.publicUrl;
        }
      }

      // Insert support request
      const { error: insertErr } = await supabase.from('support_requests').insert({
        tenant_id: effectiveTenantId,
        tenant_name: tenantName,
        user_id: user.id,
        user_email: userEmail,
        user_name: userName,
        title: title.trim(),
        description: description.trim() || null,
        screenshot_url: screenshotUrl,
      });

      if (insertErr) throw insertErr;

      // Notify admin via edge function
      await supabase.functions.invoke('send-support-notification', {
        body: {
          tenantName,
          userName,
          userEmail,
          title: title.trim(),
          description: description.trim(),
          screenshotUrl,
        },
      });

      toast({ title: 'Anfrage gesendet', description: 'Wir kümmern uns schnellstmöglich darum.' });
      setTitle('');
      setDescription('');
      removeScreenshot();
      setOpen(false);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Fehler', description: err.message || 'Anfrage konnte nicht gesendet werden.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="relative"
        disabled={screenshotting}
      >
        {screenshotting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LifeBuoy className="h-4 w-4" />
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Support-Anfrage</DialogTitle>
            <DialogDescription>Beschreiben Sie Ihr Anliegen – wir helfen Ihnen gerne.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titel *</Label>
              <Input
                placeholder="Kurze Beschreibung des Problems"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea
                placeholder="Optionale Details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={5000}
              />
            </div>

            {screenshotPreview ? (
              <div className="space-y-2">
                <Label>Screenshot</Label>
                <div className="relative rounded-lg border overflow-hidden">
                  <img src={screenshotPreview} alt="Screenshot" className="w-full h-auto max-h-40 object-contain bg-muted" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={removeScreenshot}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={takeScreenshot} className="gap-2">
                <Camera className="h-4 w-4" />
                Screenshot erstellen
              </Button>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Abbrechen</Button>
              <Button onClick={handleSubmit} disabled={sending || !title.trim()} className="gap-2">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Absenden
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
