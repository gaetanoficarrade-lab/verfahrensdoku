import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Upload, X, FileIcon, Send, ShieldCheck, Sparkles, ClipboardCheck, AlertTriangle, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
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

import { CHAPTER_TITLE_MAP } from '@/lib/chapter-structure';
import { CHAPTER_LEITFRAGEN } from '@/lib/chapter-leitfragen';

interface ChapterFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
}

interface PrecheckResult {
  hints: string[];
  missing_fields: string[];
  confidence: number;
}

export default function ChapterEditor() {
  const { id: projectId, chapterKey } = useParams<{ id: string; chapterKey: string }>();
  const { user, roles, isSuperAdmin, impersonation } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [chapterDataId, setChapterDataId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [editorText, setEditorText] = useState('');
  const [status, setStatus] = useState('empty');
  const [files, setFiles] = useState<ChapterFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [precheckLoading, setPrecheckLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [precheckResult, setPrecheckResult] = useState<PrecheckResult | null>(null);
  const [editorTextSaving, setEditorTextSaving] = useState(false);

  const title = CHAPTER_TITLE_MAP[chapterKey || ''] || chapterKey;
  const isSubmitted = status === 'client_submitted' || status === 'advisor_review' || status === 'approved' || status === 'advisor_approved';

  // Determine if user is an advisor (tenant_admin/tenant_user or super_admin impersonating)
  const isAdvisor =
    roles.includes('tenant_admin') ||
    roles.includes('tenant_user') ||
    (isSuperAdmin && impersonation.isImpersonating);

  // Determine if user is a client
  const isClient = roles.includes('client');

  // Show advisor actions when status is client_submitted and user is advisor
  const showAdvisorActions = isAdvisor && status === 'client_submitted';

  useEffect(() => {
    if (!projectId || !chapterKey) return;
    const fetchData = async () => {
      setLoading(true);
      const { data: chData } = await supabase
        .from('chapter_data')
        .select('id, client_notes, status, editor_text, generated_text, client_precheck_hints')
        .eq('project_id', projectId)
        .eq('chapter_key', chapterKey)
        .maybeSingle();

      if (chData) {
        setChapterDataId(chData.id);
        setNotes(chData.client_notes || '');
        setEditorText(chData.editor_text || chData.generated_text || '');
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
    fetchData();
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

  const handlePrecheck = async () => {
    if (!chapterDataId) return;
    setPrecheckLoading(true);
    setPrecheckResult(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('precheck-chapter-notes', {
        body: {
          project_id: projectId,
          chapter_key: chapterKey,
          client_notes: notes,
        },
      });

      if (error) throw error;
      setPrecheckResult(data as PrecheckResult);
      toast({ title: 'Precheck abgeschlossen', description: `${data.hints?.length || 0} Hinweise gefunden.` });
    } catch (err: any) {
      console.error('Precheck error:', err);
      toast({ title: 'Fehler', description: err.message || 'Precheck fehlgeschlagen', variant: 'destructive' });
    } finally {
      setPrecheckLoading(false);
    }
  };

  const handleGenerateText = async () => {
    if (!chapterDataId) return;
    setGenerateLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-chapter-text', {
        body: {
          project_id: projectId,
          chapter_key: chapterKey,
          client_notes: notes,
        },
      });

      if (error) throw error;
      const generatedText = data.generated_text || '';
      setEditorText(generatedText);
      toast({ title: 'Text generiert', description: `Qualitätsscore: ${data.quality_score || 0}/100` });
    } catch (err: any) {
      console.error('Generate error:', err);
      toast({ title: 'Fehler', description: err.message || 'Textgenerierung fehlgeschlagen', variant: 'destructive' });
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleSaveEditorText = async () => {
    if (!chapterDataId) return;
    setEditorTextSaving(true);

    const { error } = await supabase
      .from('chapter_data')
      .update({ editor_text: editorText })
      .eq('id', chapterDataId);

    setEditorTextSaving(false);
    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Gespeichert', description: 'Editor-Text wurde gespeichert.' });
    }
  };

  const handleApprove = async () => {
    if (!chapterDataId) return;
    setApproveLoading(true);

    // Save editor_text first if present
    const updatePayload: Record<string, any> = { status: 'advisor_approved' };
    if (editorText) updatePayload.editor_text = editorText;

    const { error } = await supabase
      .from('chapter_data')
      .update(updatePayload)
      .eq('id', chapterDataId);

    setApproveLoading(false);
    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    } else {
      setStatus('advisor_approved');
      toast({ title: 'Freigegeben', description: 'Das Kapitel wurde freigegeben.' });
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

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteFile = async (fileId: string, filePath: string) => {
    await supabase.storage.from('chapter-uploads').remove([filePath]);
    await supabase.from('chapter_files').delete().eq('id', fileId);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    toast({ title: 'Gelöscht', description: 'Datei wurde entfernt.' });
  };

  // Determine back navigation based on role
  const handleBack = () => {
    if (isAdvisor) {
      navigate(`/projects/${projectId}`);
    } else {
      navigate(`/client/projects/${projectId}`);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdvisor ? 'Kapitel prüfen und bearbeiten' : 'Kapitel bearbeiten und einreichen'}
          </p>
        </div>
        <Badge variant="secondary">
          {status === 'empty' && 'Offen'}
          {status === 'client_draft' && 'Entwurf'}
          {status === 'client_submitted' && 'Eingereicht'}
          {status === 'advisor_review' && 'In Prüfung'}
          {status === 'approved' && 'Freigegeben'}
          {status === 'advisor_approved' && 'Freigegeben'}
        </Badge>
      </div>

      {/* Client notes (read-only for advisor, editable for client) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isAdvisor ? 'Mandanten-Angaben' : 'Ihre Angaben'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAdvisor && chapterKey && CHAPTER_LEITFRAGEN[chapterKey] && (
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Leitfragen</p>
              {CHAPTER_LEITFRAGEN[chapterKey].map((frage, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{frage}</span>
                </div>
              ))}
            </div>
          )}
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Beschreiben Sie hier die relevanten Informationen für dieses Kapitel..."
            rows={10}
            disabled={isAdvisor || isSubmitted}
            className="font-mono text-sm"
          />
          {!isAdvisor && !isSubmitted && (
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
          {isClient && isSubmitted && (
            <p className="text-sm text-muted-foreground">
              Dieses Kapitel wurde eingereicht und kann nicht mehr bearbeitet werden.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Advisor action buttons */}
      {showAdvisorActions && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">Berater-Aktionen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handlePrecheck}
                disabled={precheckLoading}
                className="gap-2"
              >
                {precheckLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
                Precheck starten
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerateText}
                disabled={generateLoading}
                className="gap-2"
              >
                {generateLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Text generieren
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={approveLoading}
                    className="gap-2"
                  >
                    {approveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    Kapitel freigeben
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Kapitel freigeben?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Das Kapitel wird als freigegeben markiert. Der aktuelle Editor-Text wird gespeichert.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleApprove}>Freigeben</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Precheck results */}
      {precheckResult && (
        <Card className="border-orange-300 dark:border-orange-700">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Precheck-Ergebnisse
              <Badge variant="secondary" className="ml-auto">
                Confidence: {precheckResult.confidence}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {precheckResult.hints.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Hinweise:</p>
                <ul className="space-y-1">
                  {precheckResult.hints.map((hint, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      {hint}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {precheckResult.missing_fields.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Fehlende Felder:</p>
                <div className="flex flex-wrap gap-2">
                  {precheckResult.missing_fields.map((field, i) => (
                    <Badge key={i} variant="outline" className="text-destructive border-destructive/30">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Editor text (advisor only, after generation or if exists) */}
      {isAdvisor && editorText && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generierter / Bearbeiteter Text</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={editorText}
              onChange={(e) => setEditorText(e.target.value)}
              rows={15}
              disabled={status === 'advisor_approved'}
              className="font-mono text-sm"
            />
            {status !== 'advisor_approved' && (
              <Button variant="outline" onClick={handleSaveEditorText} disabled={editorTextSaving}>
                {editorTextSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Text speichern
              </Button>
            )}
          </CardContent>
        </Card>
      )}

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
                  {!isSubmitted && !isAdvisor && (
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

          {!isSubmitted && !isAdvisor && (
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
