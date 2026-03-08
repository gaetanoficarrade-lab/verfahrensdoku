import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Upload, X, FileIcon, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const CHAPTER_TITLES: Record<string, string> = {
  org_environment: 'Organisatorisches Umfeld',
  it_environment: 'IT-Umfeld',
  processes: 'Geschäftsprozesse',
  archiving: 'Archivierung',
  ics: 'Internes Kontrollsystem',
};

interface ChapterFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
}

export default function ChapterEditor() {
  const { id: projectId, chapterKey } = useParams<{ id: string; chapterKey: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [chapterDataId, setChapterDataId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('empty');
  const [files, setFiles] = useState<ChapterFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const title = CHAPTER_TITLES[chapterKey || ''] || chapterKey;
  const isSubmitted = status === 'client_submitted' || status === 'advisor_review' || status === 'approved';

  useEffect(() => {
    if (!projectId || !chapterKey) return;
    const fetch = async () => {
      setLoading(true);
      const { data: chData } = await supabase
        .from('chapter_data')
        .select('id, client_notes, status')
        .eq('project_id', projectId)
        .eq('chapter_key', chapterKey)
        .maybeSingle();

      if (chData) {
        setChapterDataId(chData.id);
        setNotes(chData.client_notes || '');
        setStatus(chData.status || 'empty');

        // Fetch files
        const { data: filesData } = await supabase
          .from('chapter_files')
          .select('id, file_name, file_path, file_type')
          .eq('chapter_data_id', chData.id);
        setFiles(filesData || []);
      }
      setLoading(false);
    };
    fetch();
  }, [projectId, chapterKey]);

  const ensureChapterData = async (): Promise<string | null> => {
    if (chapterDataId) return chapterDataId;
    const { data, error } = await supabase
      .from('chapter_data')
      .insert({ project_id: projectId!, chapter_key: chapterKey!, status: 'client_draft' })
      .select('id')
      .single();
    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
      return null;
    }
    setChapterDataId(data.id);
    setStatus('client_draft');
    return data.id;
  };

  const handleSave = async () => {
    setSaving(true);
    const cdId = await ensureChapterData();
    if (!cdId) { setSaving(false); return; }

    const { error } = await supabase
      .from('chapter_data')
      .update({ client_notes: notes, status: status === 'empty' ? 'client_draft' : status })
      .eq('id', cdId);

    setSaving(false);
    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    } else {
      if (status === 'empty') setStatus('client_draft');
      toast({ title: 'Gespeichert', description: 'Ihre Notizen wurden gespeichert.' });
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const cdId = await ensureChapterData();
    if (!cdId) { setSubmitting(false); return; }

    const { error } = await supabase
      .from('chapter_data')
      .update({
        client_notes: notes,
        submitted_client_notes: notes,
        submitted_at: new Date().toISOString(),
        status: 'client_submitted',
      })
      .eq('id', cdId);

    setSubmitting(false);
    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    } else {
      setStatus('client_submitted');
      toast({ title: 'Eingereicht', description: 'Das Kapitel wurde an Ihren Berater übermittelt.' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const cdId = await ensureChapterData();
    if (!cdId) { setUploading(false); return; }

    const filePath = `${projectId}/${chapterKey}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('chapter-uploads')
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: 'Upload fehlgeschlagen', description: uploadError.message, variant: 'destructive' });
      setUploading(false);
      return;
    }

    const { data: fileRecord, error: insertError } = await supabase
      .from('chapter_files')
      .insert({
        chapter_data_id: cdId,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type || null,
        uploaded_by: user?.id,
      })
      .select('id, file_name, file_path, file_type')
      .single();

    setUploading(false);
    if (insertError) {
      toast({ title: 'Fehler', description: insertError.message, variant: 'destructive' });
    } else if (fileRecord) {
      setFiles((prev) => [...prev, fileRecord]);
      toast({ title: 'Hochgeladen', description: `${file.name} wurde hochgeladen.` });
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteFile = async (fileId: string, filePath: string) => {
    await supabase.storage.from('chapter-uploads').remove([filePath]);
    await supabase.from('chapter_files').delete().eq('id', fileId);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    toast({ title: 'Gelöscht', description: 'Datei wurde entfernt.' });
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/client/projects/${projectId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">Kapitel bearbeiten und einreichen</p>
        </div>
        <Badge variant="secondary">
          {status === 'empty' && 'Offen'}
          {status === 'client_draft' && 'Entwurf'}
          {status === 'client_submitted' && 'Eingereicht'}
          {status === 'advisor_review' && 'In Prüfung'}
          {status === 'approved' && 'Freigegeben'}
        </Badge>
      </div>

      {/* Notes editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ihre Angaben</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Beschreiben Sie hier die relevanten Informationen für dieses Kapitel..."
            rows={10}
            disabled={isSubmitted}
            className="font-mono text-sm"
          />
          {!isSubmitted && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Speichern
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={submitting || !notes.trim()} className="gap-2">
                    <Send className="h-4 w-4" />
                    Einreichen
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Kapitel einreichen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Nach dem Einreichen können Sie keine Änderungen mehr vornehmen. Ihr Berater wird das Kapitel prüfen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit}>
                      {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Einreichen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          {isSubmitted && (
            <p className="text-sm text-muted-foreground">
              Dieses Kapitel wurde eingereicht und kann nicht mehr bearbeitet werden.
            </p>
          )}
        </CardContent>
      </Card>

      {/* File uploads */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dokumente & Anhänge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f) => (
                <div key={f.id} className="flex items-center gap-3 rounded-md border border-border p-3">
                  <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 text-sm text-foreground truncate">{f.file_name}</span>
                  {!isSubmitted && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteFile(f.id, f.file_path)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!isSubmitted && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Datei hochladen
              </Button>
            </div>
          )}

          {files.length === 0 && (
            <p className="text-sm text-muted-foreground">Noch keine Dateien hochgeladen.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
