import { useState, useEffect, useRef } from 'react';
import { seedBlogArticleVD2025 } from '@/lib/seedBlogArticle';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  category: string;
  reading_time_minutes: number;
  published: boolean;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = ['GoBD', 'Buchhaltung', 'Steuer', 'Digitalisierung', 'Tool-Updates'];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const emptyPost = {
  title: '', slug: '', excerpt: '', content: '', cover_image_url: '',
  category: 'GoBD', reading_time_minutes: 5, published: false,
  published_at: '', meta_title: '', meta_description: '',
};

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyPost);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  async function load() {
    setLoading(true);
    let query = supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if (filter === 'published') query = query.eq('published', true);
    if (filter === 'draft') query = query.eq('published', false);
    const { data } = await query;
    setPosts((data as BlogPost[]) ?? []);
    setLoading(false);
  }

  const seeded = useRef(false);
  useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      seedBlogArticleVD2025().then(() => load());
    } else {
      load();
    }
  }, [filter]);

  function openNew() {
    setEditing(null);
    setForm(emptyPost);
    setPreview(false);
    setDialogOpen(true);
  }

  function openEdit(post: BlogPost) {
    setEditing(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      cover_image_url: post.cover_image_url ?? '',
      category: post.category,
      reading_time_minutes: post.reading_time_minutes,
      published: post.published,
      published_at: post.published_at ? post.published_at.slice(0, 16) : '',
      meta_title: post.meta_title ?? '',
      meta_description: post.meta_description ?? '',
    });
    setPreview(false);
    setDialogOpen(true);
  }

  async function save() {
    if (!form.title || !form.slug) {
      toast({ title: 'Titel und Slug sind erforderlich', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      cover_image_url: form.cover_image_url || null,
      category: form.category,
      reading_time_minutes: form.reading_time_minutes,
      published: form.published,
      published_at: form.published_at ? new Date(form.published_at).toISOString() : (form.published ? new Date().toISOString() : null),
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      updated_at: new Date().toISOString(),
    };

    if (editing) {
      const { error } = await supabase.from('blog_posts').update(payload).eq('id', editing);
      if (error) toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
      else toast({ title: 'Artikel aktualisiert' });
    } else {
      const { error } = await supabase.from('blog_posts').insert(payload);
      if (error) toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
      else toast({ title: 'Artikel erstellt' });
    }

    setSaving(false);
    setDialogOpen(false);
    load();
  }

  async function deletePost(id: string) {
    if (!confirm('Artikel wirklich löschen?')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    toast({ title: 'Artikel gelöscht' });
    load();
  }

  function handleTitleChange(title: string) {
    setForm(f => ({
      ...f,
      title,
      slug: !editing ? slugify(title) : f.slug,
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog verwalten</h1>
        <Button onClick={openNew}><Plus size={16} className="mr-2" /> Neuer Artikel</Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'published', 'draft'] as const).map(f => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
            {f === 'all' ? 'Alle' : f === 'published' ? 'Veröffentlicht' : 'Entwurf'}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titel</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Laden...</TableCell></TableRow>
            ) : posts.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Keine Artikel gefunden</TableCell></TableRow>
            ) : posts.map(post => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell><Badge variant="secondary">{post.category}</Badge></TableCell>
                <TableCell>
                  <Badge variant={post.published ? 'default' : 'outline'}>
                    {post.published ? 'Veröffentlicht' : 'Entwurf'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {post.published_at ? new Date(post.published_at).toLocaleDateString('de-DE') : '–'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {post.published && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"><Eye size={16} /></a>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => openEdit(post)}><Pencil size={16} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deletePost(post.id)}><Trash2 size={16} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Editor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Artikel bearbeiten' : 'Neuer Artikel'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Titel *</Label>
                <Input value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="Artikel-Titel" />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="url-slug" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategorie</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Lesezeit (Minuten)</Label>
                <Input type="number" min={1} value={form.reading_time_minutes} onChange={e => setForm(f => ({ ...f, reading_time_minutes: parseInt(e.target.value) || 1 }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kurzbeschreibung (Excerpt)</Label>
              <Textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Inhalt (Markdown)</Label>
                <Button variant="ghost" size="sm" onClick={() => setPreview(!preview)}>
                  {preview ? 'Editor' : 'Vorschau'}
                </Button>
              </div>
              {preview ? (
                <div className="border rounded-lg p-4 min-h-[200px] prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(form.content) }} />
                </div>
              ) : (
                <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={12} className="font-mono text-sm" placeholder="## Überschrift&#10;&#10;Absatz..." />
              )}
            </div>

            <div className="space-y-2">
              <Label>Titelbild URL</Label>
              <Input value={form.cover_image_url} onChange={e => setForm(f => ({ ...f, cover_image_url: e.target.value }))} placeholder="https://..." />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Meta-Titel (SEO)</Label>
                <Input value={form.meta_title} onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))} placeholder="SEO-Titel" />
              </div>
              <div className="space-y-2">
                <Label>Meta-Description (SEO) <span className="text-xs text-muted-foreground ml-1">{(form.meta_description || '').length}/160</span></Label>
                <Textarea value={form.meta_description} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value.slice(0, 160) }))} rows={2} placeholder="SEO-Beschreibung" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Veröffentlichungsdatum</Label>
                <Input type="datetime-local" value={form.published_at} onChange={e => setForm(f => ({ ...f, published_at: e.target.value }))} />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={form.published} onCheckedChange={v => setForm(f => ({ ...f, published: v }))} />
                <Label>Veröffentlicht</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Speichern...' : 'Speichern'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function simpleMarkdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])(.+)$/gm, '<p>$1</p>');
}
