import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Upload, X, FileIcon, Send, ShieldCheck, Sparkles, AlertTriangle, CheckCircle2, Mic, PenLine, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { logAudit } from '@/lib/auditLog';
import { triggerWebhook } from '@/lib/webhookTrigger';
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
import { CHAPTER_LEITFRAGEN_BLOCKS } from '@/lib/chapter-leitfragen';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

const BLOCK_COLORS: Record<string, string> = {
  Auslöser: 'bg-primary/10 text-primary',
  Durchführung: 'bg-accent/20 text-accent-foreground',
  Nachweis: 'bg-secondary text-secondary-foreground',
  Aufbewahrung: 'bg-muted text-muted-foreground',
  Zusatz: 'bg-muted/50 text-muted-foreground',
};

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
  const [generateLoading, setGenerateLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [onboardingAnswers, setOnboardingAnswers] = useState<Record<string, any> | null>(null);
  const [editorTextSaving, setEditorTextSaving] = useState(false);
  const [savedPrecheckHints, setSavedPrecheckHints] = useState<string[]>([]);

  // Real-time precheck state
  const [precheckLoading, setPrecheckLoading] = useState(false);
  const [precheckResult, setPrecheckResult] = useState<PrecheckResult | null>(null);

  // Amendment mode
  const [isAmending, setIsAmending] = useState(false);

  const notesSpeech = useSpeechRecognition(useCallback((text: string) => {
    setNotes(prev => prev ? prev + ' ' + text : text);
  }, []));

  const editorSpeech = useSpeechRecognition(useCallback((text: string) => {
    setEditorText(prev => prev ? prev + ' ' + text : text);
  }, []));

  const title = CHAPTER_TITLE_MAP[chapterKey || ''] || chapterKey;
  const isSubmitted = status === 'client_submitted' || status === 'advisor_review' || status === 'approved' || status === 'advisor_approved';
  const canEdit = !isSubmitted || isAmending;

  const isAdvisor =
    roles.includes('tenant_admin') ||
    roles.includes('tenant_user') ||
    (isSuperAdmin && impersonation.isImpersonating);

  const isClient = roles.includes('client');
  const showAdvisorActions = isAdvisor && status === 'client_submitted';

  // Leitfragen blocks for this chapter
  const leitfragenBlocks = chapterKey ? (CHAPTER_LEITFRAGEN_BLOCKS[chapterKey] || []) : [];

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
        setSavedPrecheckHints(
          Array.isArray(chData.client_precheck_hints) ? chData.client_precheck_hints : []
        );

        const { data: filesData } = await supabase
          .from('chapter_files')
          .select('id, file_name, file_path, file_type')
          .eq('chapter_data_id', chData.id);
        setFiles(filesData || []);
      }
      setLoading(false);
    };
    fetchData();

    const fetchOnboarding = async () => {
      const { data } = await supabase
        .from('project_onboarding')
        .select('answers')
        .eq('project_id', projectId)
        .maybeSingle();
      if (data?.answers) setOnboardingAnswers(data.answers as Record<string, any>);
    };
    fetchOnboarding();
  }, [projectId, chapterKey]);

  // Manual precheck triggered by "Prüfen" button
  const handlePrecheck = async () => {
    setPrecheckLoading(true);
    setPrecheckResult(null);

    try {
      const cdId = await ensureChapterData();
      if (!cdId) { setPrecheckLoading(false); return; }

      const { data, error } = await supabase.functions.invoke('precheck-chapter-notes', {
        body: {
          project_id: projectId,
          chapter_key: chapterKey,
          client_notes: notes,
          onboarding_answers: onboardingAnswers,
        },
      });

      if (error) throw error;
      const result = data as PrecheckResult;
      setPrecheckResult(result);

      // Save hints to DB
      const allHints = [...(result.missing_fields || []), ...(result.hints || [])];
      await supabase
        .from('chapter_data')
        .update({ client_precheck_hints: allHints })
        .eq('id', cdId);
    } catch (err: any) {
      console.error('Precheck error:', err);
      toast({ title: 'Fehler bei der Prüfung', description: 'Die KI-Prüfung konnte nicht durchgeführt werden.', variant: 'destructive' });
    } finally {
      setPrecheckLoading(false);
    }
  };


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
      setIsAmending(false);
      logAudit('chapter_submitted', 'chapter', cdId, { chapter_key: chapterKey, project_id: projectId });
      triggerWebhook('kapitel_eingereicht', { chapter_key: chapterKey, project_id: projectId, chapter_data_id: cdId });
      toast({ title: 'Eingereicht', description: 'Das Kapitel wurde an Ihren Berater übermittelt.' });
    }
  };

  const handleAmend = () => {
    setIsAmending(true);
    // Reset status to client_draft so user can edit
    if (chapterDataId) {
      supabase
        .from('chapter_data')
        .update({ status: 'client_draft' })
        .eq('id', chapterDataId)
        .then(() => {
          setStatus('client_draft');
        });
    }
  };

  const handleGenerateText = async () => {
    if (!chapterDataId) return;
    setGenerateLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-chapter-text', {
        body: { project_id: projectId, chapter_key: chapterKey, client_notes: notes },
      });
      if (error) throw error;
      setEditorText(data.generated_text || '');
      logAudit('text_generated', 'chapter', chapterDataId!, { chapter_key: chapterKey, project_id: projectId });
      toast({ title: 'Text generiert', description: `Qualitätsscore: ${data.quality_score || 0}/100` });
    } catch (err: any) {
      toast({ title: 'Fehler', description: err.message || 'Textgenerierung fehlgeschlagen', variant: 'destructive' });
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleSaveEditorText = async () => {
    if (!chapterDataId) return;
    setEditorTextSaving(true);
    const { error } = await supabase.from('chapter_data').update({ editor_text: editorText }).eq('id', chapterDataId);
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
    const updatePayload: Record<string, any> = { status: 'advisor_approved' };
    if (editorText) updatePayload.editor_text = editorText;
    const { error } = await supabase.from('chapter_data').update(updatePayload).eq('id', chapterDataId);
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
    const { error: uploadError } = await supabase.storage.from('chapter-uploads').upload(filePath, file);
    if (uploadError) {
      toast({ title: 'Upload fehlgeschlagen', description: uploadError.message, variant: 'destructive' });
      setUploading(false);
      return;
    }
    const { data: fileRecord, error: insertError } = await supabase
      .from('chapter_files')
      .insert({ chapter_data_id: cdId, file_name: file.name, file_path: filePath, file_type: file.type || null, uploaded_by: user?.id })
      .select('id, file_name, file_path, file_type')
      .single();
    setUploading(false);
    if (insertError) {
      toast({ title: 'Fehler', description: insertError.message, variant: 'destructive' });
    } else if (fileRecord) {
      setFiles(prev => [...prev, fileRecord]);
      toast({ title: 'Hochgeladen', description: `${file.name} wurde hochgeladen.` });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteFile = async (fileId: string, filePath: string) => {
    await supabase.storage.from('chapter-uploads').remove([filePath]);
    await supabase.from('chapter_files').delete().eq('id', fileId);
    setFiles(prev => prev.filter(f => f.id !== fileId));
    toast({ title: 'Gelöscht', description: 'Datei wurde entfernt.' });
  };

  const handleBack = () => {
    if (isAdvisor) navigate(`/projects/${projectId}`);
    else navigate(`/client/projects/${projectId}`);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }


  const precheckHasIssues = precheckResult &&
    ((precheckResult.hints?.length || 0) > 0 || (precheckResult.missing_fields?.length || 0) > 0);

  const precheckIsClean = precheckResult &&
    (precheckResult.hints?.length || 0) === 0 &&
    (precheckResult.missing_fields?.length || 0) === 0;

  const precheckHasIssues = precheckResult &&
    ((precheckResult.hints?.length || 0) > 0 || (precheckResult.missing_fields?.length || 0) > 0);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
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

      {/* Client notes card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isAdvisor ? 'Mandanten-Angaben' : 'Ihre Angaben'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Leitfragen with 4-block structure */}
          {!isAdvisor && leitfragenBlocks.length > 0 && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Leitfragen – beantworten Sie diese Punkte:</p>
              <div className="grid gap-2">
                {leitfragenBlocks.map((block, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 mt-0.5 ${BLOCK_COLORS[block.label] || ''}`}>
                      {block.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{block.fragen[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Textarea with mic button bottom-right */}
          <div className="relative">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Beschreiben Sie hier die relevanten Informationen für dieses Kapitel. Orientieren Sie sich an den Leitfragen oben…"
              rows={12}
              disabled={isAdvisor || (isSubmitted && !isAmending)}
              className="font-mono text-sm pb-12"
            />
            {!isAdvisor && canEdit && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={notesSpeech.isListening ? 'destructive' : 'secondary'}
                      size="icon"
                      className={`absolute bottom-3 right-3 rounded-full h-10 w-10 shadow-md ${notesSpeech.isListening ? 'animate-pulse' : ''}`}
                      onClick={notesSpeech.toggle}
                      disabled={!notesSpeech.isSupported}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {notesSpeech.isSupported
                      ? notesSpeech.isListening ? 'Aufnahme stoppen' : 'Spracheingabe starten'
                      : 'Spracheingabe nicht unterstützt'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Action buttons for client */}
          {!isAdvisor && canEdit && (
            <div className="space-y-4">
              <div className="flex gap-3 items-center">
                <Button variant="outline" onClick={handleSave} disabled={saving || precheckLoading}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Speichern
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={precheckLoading || !notes.trim()}
                  className="gap-1.5"
                  onClick={handlePrecheck}
                >
                  {precheckLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                  {precheckLoading ? 'KI prüft…' : 'Prüfen'}
                </Button>
                <Button
                  disabled={submitting || !notes.trim()}
                  className="gap-2"
                  onClick={handleSubmit}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Einreichen
                </Button>
              </div>

              {/* Precheck result */}
              {precheckIsClean && (
                <div className="rounded-lg border border-green-500/40 bg-green-50 dark:bg-green-950/20 p-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                    Ihre Angaben sind vollständig ✓
                  </p>
                </div>
              )}

              {precheckHasIssues && (
                <div className="rounded-lg border border-yellow-500/40 bg-yellow-50 dark:bg-yellow-950/20 p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                      Hinweise zu Ihren Angaben:
                    </p>
                  </div>
                  {precheckResult!.missing_fields?.map((field, i) => (
                    <p key={`mf-${i}`} className="text-sm text-yellow-800 dark:text-yellow-300 pl-7">• {field}</p>
                  ))}
                  {precheckResult!.hints?.map((hint, i) => (
                    <p key={`h-${i}`} className="text-sm text-yellow-700 dark:text-yellow-400 pl-7">• {hint}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submitted state with amend option */}
          {isClient && isSubmitted && !isAmending && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-sm text-muted-foreground">
                Dieses Kapitel wurde eingereicht.
              </p>
              {status === 'client_submitted' && (
                <Button variant="outline" size="sm" className="gap-1" onClick={handleAmend}>
                  <PenLine className="h-3.5 w-3.5" />
                  Ergänzen
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved precheck hints (visible to advisor) */}
      {isAdvisor && savedPrecheckHints.length > 0 && (
        <Card className="border-yellow-500/40">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              KI-Precheck-Hinweise (vom Mandanten)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {savedPrecheckHints.map((hint, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                  {hint}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Advisor action buttons */}
      {showAdvisorActions && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">Berater-Aktionen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleGenerateText} disabled={generateLoading} className="gap-2">
                {generateLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Text generieren
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={approveLoading} className="gap-2">
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

      {/* Editor text (advisor only) */}
      {isAdvisor && editorText && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generierter / Bearbeiteter Text</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                value={editorText}
                onChange={(e) => setEditorText(e.target.value)}
                rows={15}
                disabled={status === 'advisor_approved'}
                className="font-mono text-sm pr-12"
              />
              {status !== 'advisor_approved' && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant={editorSpeech.isListening ? 'destructive' : 'secondary'}
                        size="icon"
                        className={`absolute bottom-3 right-3 rounded-full h-10 w-10 shadow-md ${editorSpeech.isListening ? 'animate-pulse' : ''}`}
                        onClick={editorSpeech.toggle}
                        disabled={!editorSpeech.isSupported}
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {editorSpeech.isSupported
                        ? editorSpeech.isListening ? 'Aufnahme stoppen' : 'Spracheingabe starten'
                        : 'Spracheingabe nicht unterstützt'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
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
              {files.map(f => (
                <div key={f.id} className="flex items-center gap-3 rounded-md border border-border p-3">
                  <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 text-sm text-foreground truncate">{f.file_name}</span>
                  {canEdit && !isAdvisor && (
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

          {canEdit && !isAdvisor && (
            <div>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
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
