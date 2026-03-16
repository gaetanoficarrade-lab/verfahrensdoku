import { useState, useEffect } from 'react';
import { FileText, Plus, Loader2, Trash2, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CHAPTER_TITLE_MAP } from '@/lib/chapter-structure';

interface Template {
  id: string;
  chapter_key: string;
  title: string;
  content: string;
  created_at: string;
}

export default function TemplateSettings() {
  const { effectiveTenantId, user } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', chapter_key: '_all', content: '' });
  const [saving, setSaving] = useState(false);

  const loadTemplates = async () => {
    if (!effectiveTenantId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('chapter_templates')
      .select('id, chapter_key, title, content, created_at')
      .eq('tenant_id', effectiveTenantId)
      .order('created_at', { ascending: false });
    setTemplates((data || []) as Template[]);
    setLoading(false);
  };

  useEffect(() => { loadTemplates(); }, [effectiveTenantId]);

  const handleSave = async () => {
    if (!effectiveTenantId || !user) return;
    setSaving(true);
    if (editId) {
      const { error } = await supabase.from('chapter_templates').update({
        title: form.title,
        chapter_key: form.chapter_key,
        content: form.content,
      }).eq('id', editId);
      if (error) toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
      else toast({ title: 'Vorlage aktualisiert' });
    } else {
      const { error } = await supabase.from('chapter_templates').insert({
        tenant_id: effectiveTenantId,
        title: form.title,
        chapter_key: form.chapter_key,
        content: form.content,
        created_by: user.id,
      });
      if (error) toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
      else toast({ title: 'Vorlage erstellt' });
    }
    setSaving(false);
    setDialogOpen(false);
    setEditId(null);
    setForm({ title: '', chapter_key: '_all', content: '' });
    loadTemplates();
  };

  const handleEdit = (t: Template) => {
    setEditId(t.id);
    setForm({ title: t.title, chapter_key: t.chapter_key, content: t.content });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('chapter_templates').delete().eq('id', id);
    toast({ title: 'Vorlage gelöscht' });
    loadTemplates();
  };

  const chapterOptions = Object.entries(CHAPTER_TITLE_MAP);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Vorlagen
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Mustertexte für häufige Kapitel</p>
        </div>
        <Button onClick={() => { setEditId(null); setForm({ title: '', chapter_key: '_all', content: '' }); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Vorlage
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Noch keine Vorlagen erstellt.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {templates.map(t => (
            <Card key={t.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{t.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {t.chapter_key === '_all' ? 'Alle Kapitel' : (CHAPTER_TITLE_MAP[t.chapter_key] || t.chapter_key)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(t.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editId ? 'Vorlage bearbeiten' : 'Neue Vorlage'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titel</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="z.B. Standard-Belegfluss" />
            </div>
            <div>
              <Label>Kapitel</Label>
              <Select value={form.chapter_key} onValueChange={v => setForm(f => ({ ...f, chapter_key: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Alle Kapitel</SelectItem>
                  {chapterOptions.map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Inhalt</Label>
              <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={12} className="font-mono text-sm" />
            </div>
            <Button onClick={handleSave} disabled={saving || !form.title.trim() || !form.content.trim()} className="w-full">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editId ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
