import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, FileText, CheckCircle2, Clock, AlertCircle, Circle, ChevronDown, Ban, Eye, FileDown, Plus, ShieldCheck, History, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import OnboardingWizard from '@/components/OnboardingWizard';
import { GOBD_CHAPTERS, CHAPTER_TITLE_MAP } from '@/lib/chapter-structure';
import { generateVerfahrensdokumentation } from '@/lib/generatePdf';
import type { OnboardingAnswers } from '@/lib/onboarding-variables';
import { useTrialRestrictions } from '@/hooks/useTrialRestrictions';

const statusConfig: Record<string, { label: string; icon: typeof Circle; className: string }> = {
  empty: { label: 'Offen', icon: Circle, className: 'text-muted-foreground bg-muted' },
  client_draft: { label: 'Entwurf', icon: Clock, className: 'text-primary bg-primary/10' },
  client_submitted: { label: 'Eingereicht', icon: CheckCircle2, className: 'text-accent-foreground bg-accent/20' },
  advisor_review: { label: 'In Prüfung', icon: AlertCircle, className: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30' },
  approved: { label: 'Freigegeben', icon: CheckCircle2, className: 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30' },
  advisor_approved: { label: 'Freigegeben', icon: CheckCircle2, className: 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30' },
  inactive: { label: 'Nicht relevant', icon: Ban, className: 'text-muted-foreground bg-muted/50' },
};

const workflowLabels: Record<string, string> = {
  onboarding: 'Onboarding',
  data_collection: 'Datenerfassung',
  data_entry: 'Datenerfassung',
  review: 'Review',
  finalization: 'Finalisierung',
  completed: 'Abgeschlossen',
};

const statusLabels: Record<string, string> = {
  draft: 'Entwurf',
  active: 'Aktiv',
  completed: 'Abgeschlossen',
  archived: 'Archiviert',
};

interface ChapterData {
  id: string;
  chapter_key: string;
  status: string | null;
  client_notes: string | null;
  editor_text: string | null;
  generated_text: string | null;
}

interface Project {
  id: string;
  name: string;
  status: string | null;
  workflow_status: string | null;
  client_id: string;
}

interface Onboarding {
  id: string;
  answers: OnboardingAnswers;
  completed_at: string | null;
}

interface DocumentVersion {
  id: string;
  version_number: number;
  version_label: string | null;
  is_draft: boolean;
  status: string;
  notes: string | null;
  chapters_snapshot: any;
  change_log: any[];
  created_by: string | null;
  created_at: string;
  profiles?: { first_name: string; last_name: string } | null;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthContext();
  const { maxEditableChapters, pdfWatermark, isTrialing } = useTrialRestrictions();
  const [project, setProject] = useState<Project | null>(null);
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null);
  const [loading, setLoading] = useState(true);
  const [openChapters, setOpenChapters] = useState<string[]>(['1']);
  const [companyName, setCompanyName] = useState('');
  const [createDocOpen, setCreateDocOpen] = useState(false);
  const [docNotes, setDocNotes] = useState('');
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [documentVersions, setDocumentVersions] = useState<DocumentVersion[]>([]);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [downloadingVersion, setDownloadingVersion] = useState<string | null>(null);

  // Batch approval
  const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set());
  const [batchApproving, setBatchApproving] = useState(false);

  const getNextVersionLabel = (): string => {
    if (documentVersions.length === 0) return '1.0';
    const last = documentVersions[0]; // sorted desc
    const lastLabel = last.version_label || `1.${last.version_number - 1}`;
    const parts = lastLabel.split('.');
    const major = parseInt(parts[0]) || 1;
    const minor = parseInt(parts[1] || '0');
    return `${major}.${minor + 1}`;
  };

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    const [projRes, chapRes, onbRes, docRes] = await Promise.all([
      supabase.from('projects').select('id, name, status, workflow_status, client_id').eq('id', id).single(),
      supabase.from('chapter_data').select('id, chapter_key, status, client_notes, editor_text, generated_text').eq('project_id', id),
      supabase.from('project_onboarding').select('id, answers, completed_at').eq('project_id', id).maybeSingle(),
      supabase.from('document_versions')
        .select('id, version_number, version_label, is_draft, status, notes, chapters_snapshot, change_log, created_by, created_at, profiles:created_by(first_name, last_name)')
        .eq('project_id', id)
        .order('version_number', { ascending: false }),
    ]);
    setProject(projRes.data);
    setChapters(chapRes.data || []);
    setOnboarding(onbRes.data as Onboarding | null);
    setDocumentVersions((docRes.data || []) as unknown as DocumentVersion[]);

    if (projRes.data?.client_id) {
      const { data: clientData } = await supabase.from('clients').select('company').eq('id', projRes.data.client_id).single();
      if (clientData) setCompanyName(clientData.company);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [id]);

  const answers: OnboardingAnswers = (onboarding?.answers as OnboardingAnswers) || {};
  const hasApprovedChapters = chapters.some(c => c.status === 'advisor_approved' || c.status === 'approved');

  const getSubChapterStatus = (key: string, isActive: boolean) => {
    if (!isActive) return 'inactive';
    const ch = chapters.find((c) => c.chapter_key === key);
    return ch?.status || 'empty';
  };

  const getMainChapterProgress = (subKeys: string[]) => {
    let done = 0;
    for (const key of subKeys) {
      const ch = chapters.find((c) => c.chapter_key === key);
      if (ch?.status === 'approved' || ch?.status === 'advisor_approved') done++;
    }
    return { done, total: subKeys.length };
  };

  const toggleChapter = (key: string) => {
    setOpenChapters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleSelectChapter = (chapterId: string) => {
    setSelectedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  const handleBatchApprove = async () => {
    if (selectedChapters.size === 0) return;
    setBatchApproving(true);
    const promises = Array.from(selectedChapters).map(chId =>
      supabase.from('chapter_data').update({ status: 'advisor_approved' }).eq('id', chId)
    );
    await Promise.all(promises);
    toast({ title: 'Batch-Freigabe', description: `${selectedChapters.size} Kapitel wurden freigegeben.` });
    setSelectedChapters(new Set());
    setBatchApproving(false);
    loadData();
  };

  const batchEligible = chapters.filter(c => c.status === 'client_submitted');

  /** Build change log by comparing current chapters to last snapshot */
  const buildChangeLog = async (): Promise<any[]> => {
    if (documentVersions.length === 0) {
      // First version: all chapters are "Erstversion"
      return chapters
        .filter(c => c.editor_text || c.generated_text)
        .map(c => ({
          chapter: CHAPTER_TITLE_MAP[c.chapter_key] || c.chapter_key,
          chapter_key: c.chapter_key,
          description: 'Erstversion',
        }));
    }

    const lastSnapshot = documentVersions[0]?.chapters_snapshot;
    const changes: any[] = [];

    // Find changes since last snapshot
    for (const ch of chapters) {
      const currentText = ch.editor_text || ch.generated_text || '';
      const prevText = lastSnapshot?.[ch.chapter_key]?.editor_text || lastSnapshot?.[ch.chapter_key]?.generated_text || '';

      if (currentText !== prevText && currentText) {
        // Check for change reasons in chapter_versions since last finalization
        const lastDate = documentVersions[0]?.created_at;
        const { data: recentVersions } = await supabase
          .from('chapter_versions')
          .select('change_reason, change_type')
          .eq('chapter_data_id', ch.id)
          .gt('created_at', lastDate)
          .order('created_at', { ascending: false });

        const reasons = recentVersions
          ?.filter(v => v.change_reason)
          .map(v => v.change_reason) || [];

        changes.push({
          chapter: CHAPTER_TITLE_MAP[ch.chapter_key] || ch.chapter_key,
          chapter_key: ch.chapter_key,
          description: reasons.length > 0 ? reasons[0] : 'Überarbeitung',
        });
      }
    }

    return changes.length > 0 ? changes : [{ chapter: '–', chapter_key: '', description: 'Keine inhaltlichen Änderungen' }];
  };

  const handleCreateDocument = async () => {
    if (!id || !project) return;
    setCreatingDoc(true);
    try {
      const versionLabel = getNextVersionLabel();
      const nextVersionNum = (documentVersions[0]?.version_number || 0) + 1;

      // Build snapshot of all chapters
      const chaptersSnapshot: Record<string, any> = {};
      for (const c of chapters) {
        chaptersSnapshot[c.chapter_key] = {
          editor_text: c.editor_text,
          generated_text: c.generated_text,
          status: c.status,
        };
      }

      // Build change log
      const changeLog = await buildChangeLog();

      // Build version entries for PDF (all versions including this one)
      const allVersionEntries = [
        {
          version: versionLabel,
          date: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          changedBy: user ? `${(user as any).user_metadata?.first_name || ''} ${(user as any).user_metadata?.last_name || ''}`.trim() || user.email || '–' : '–',
          description: changeLog.map(c => c.description).join('; '),
          chapter: changeLog.map(c => c.chapter).join(', '),
        },
        ...documentVersions.map(dv => ({
          version: dv.version_label || `1.${dv.version_number - 1}`,
          date: new Date(dv.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          changedBy: dv.profiles ? `${dv.profiles.first_name || ''} ${dv.profiles.last_name || ''}`.trim() : '–',
          description: (dv.change_log || []).map((c: any) => c.description).join('; ') || dv.notes || 'Erstversion',
          chapter: (dv.change_log || []).map((c: any) => c.chapter).join(', ') || '–',
        })),
      ];

      // Insert document version
      const { error } = await supabase.from('document_versions').insert({
        project_id: id,
        version_number: nextVersionNum,
        version_label: versionLabel,
        is_draft: false,
        status: 'finalized',
        notes: docNotes || `Version ${versionLabel}`,
        chapters_snapshot: chaptersSnapshot,
        change_log: changeLog,
        created_by: user?.id,
      });
      if (error) throw error;

      // Generate PDF
      const doc = generateVerfahrensdokumentation({
        companyName,
        projectName: project.name,
        chapters: chapters.map(c => ({
          chapter_key: c.chapter_key,
          editor_text: c.editor_text,
          generated_text: c.generated_text,
        })),
        answers,
        isFinal: true,
        versions: allVersionEntries,
        watermarkText: pdfWatermark,
      });
      doc.save(`${companyName || 'Verfahrensdokumentation'}_V${versionLabel}.pdf`);

      toast({ title: `Version ${versionLabel} finalisiert`, description: 'PDF wurde heruntergeladen.' });
      setCreateDocOpen(false);
      setDocNotes('');
      loadData();
    } catch (err: any) {
      toast({ title: 'Fehler', description: err.message, variant: 'destructive' });
    }
    setCreatingDoc(false);
  };

  /** Re-download a previously finalized version from its snapshot */
  const handleDownloadVersion = (dv: DocumentVersion) => {
    if (!project || !dv.chapters_snapshot) {
      toast({ title: 'Fehler', description: 'Kein Snapshot für diese Version vorhanden.', variant: 'destructive' });
      return;
    }
    setDownloadingVersion(dv.id);
    try {
      const snapshotChapters = Object.entries(dv.chapters_snapshot).map(([key, val]: [string, any]) => ({
        chapter_key: key,
        editor_text: val.editor_text,
        generated_text: val.generated_text,
      }));

      // Build version entries up to and including this version
      const vIdx = documentVersions.findIndex(v => v.id === dv.id);
      const versionsUpTo = documentVersions.slice(vIdx).reverse();
      const versionEntries = versionsUpTo.map(v => ({
        version: v.version_label || `1.${v.version_number - 1}`,
        date: new Date(v.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        changedBy: v.profiles ? `${v.profiles.first_name || ''} ${v.profiles.last_name || ''}`.trim() : '–',
        description: (v.change_log || []).map((c: any) => c.description).join('; ') || v.notes || 'Erstversion',
        chapter: (v.change_log || []).map((c: any) => c.chapter).join(', ') || '–',
      }));

      const label = dv.version_label || `1.${dv.version_number - 1}`;
      const doc = generateVerfahrensdokumentation({
        companyName,
        projectName: project.name,
        chapters: snapshotChapters,
        answers,
        isFinal: true,
        versions: versionEntries,
      });
      doc.save(`${companyName || 'Verfahrensdokumentation'}_V${label}.pdf`);
      toast({ title: 'PDF heruntergeladen', description: `Version ${label}` });
    } catch (err: any) {
      toast({ title: 'Fehler', description: err.message, variant: 'destructive' });
    }
    setDownloadingVersion(null);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Projekt nicht gefunden.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1 as any)}>Zurück</Button>
      </div>
    );
  }

  if (!onboarding || !onboarding.completed_at) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/clients/${project.client_id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
            <p className="text-sm text-muted-foreground">Projekt-Onboarding</p>
          </div>
        </div>
        <OnboardingWizard
          projectId={project.id}
          onboardingId={onboarding?.id || ''}
          initialAnswers={((onboarding?.answers as OnboardingAnswers) || {})}
          onComplete={() => {
            setOnboarding(prev => prev ? { ...prev, completed_at: new Date().toISOString() } : prev);
            loadData();
          }}
        />
      </div>
    );
  }

  const nextVersionLabel = getNextVersionLabel();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/clients/${project.client_id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{statusLabels[project.status || ''] || project.status}</Badge>
            <Badge variant="secondary">{workflowLabels[project.workflow_status || ''] || project.workflow_status}</Badge>
            {documentVersions.length > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                V{documentVersions[0].version_label || `1.${documentVersions[0].version_number - 1}`}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {documentVersions.length > 0 && (
            <Button variant="outline" onClick={() => setVersionHistoryOpen(true)}>
              <History className="h-4 w-4 mr-2" />
              Versionen ({documentVersions.length})
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate(`/projects/${id}/preview`)}>
            <Eye className="h-4 w-4 mr-2" />
            Vorschau
          </Button>
          {hasApprovedChapters && (
            <Dialog open={createDocOpen} onOpenChange={setCreateDocOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FileDown className="h-4 w-4 mr-2" />
                  {documentVersions.length === 0 ? 'Finalisieren (V1.0)' : `Neue Version (V${nextVersionLabel})`}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {documentVersions.length === 0 ? 'Verfahrensdokumentation finalisieren' : 'Neue Version erstellen'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Version</Label>
                    <Input value={nextVersionLabel} disabled />
                  </div>
                  <div>
                    <Label>Änderungsnotiz (optional)</Label>
                    <Textarea
                      value={docNotes}
                      onChange={e => setDocNotes(e.target.value)}
                      placeholder={documentVersions.length === 0
                        ? 'z.B. Erstversion der Verfahrensdokumentation'
                        : 'z.B. Softwarewechsel, Prozessanpassung…'
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {documentVersions.length === 0
                      ? 'Es wird ein vollständiger Snapshot aller Kapitel erstellt. Die finalisierte Version kann jederzeit als PDF heruntergeladen werden.'
                      : 'Geänderte Kapitel werden automatisch erkannt. Die Änderungshistorie erscheint im PDF.'
                    }
                  </p>
                  <Button onClick={handleCreateDocument} disabled={creatingDoc} className="w-full">
                    {creatingDoc && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Version {nextVersionLabel} finalisieren & PDF herunterladen
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Version History Dialog */}
      <Dialog open={versionHistoryOpen} onOpenChange={setVersionHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Versionshistorie</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {documentVersions.map(dv => {
              const label = dv.version_label || `1.${dv.version_number - 1}`;
              const changeLog = dv.change_log || [];
              return (
                <Card key={dv.id}>
                  <CardContent className="py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">V{label}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(dv.created_at).toLocaleString('de-DE')}
                          </span>
                          {dv.profiles && (
                            <span className="text-xs text-muted-foreground">
                              • {dv.profiles.first_name || ''} {dv.profiles.last_name || ''}
                            </span>
                          )}
                        </div>
                        {dv.notes && (
                          <p className="text-xs text-muted-foreground italic pl-1">{dv.notes}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        disabled={downloadingVersion === dv.id || !dv.chapters_snapshot}
                        onClick={() => handleDownloadVersion(dv)}
                      >
                        {downloadingVersion === dv.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        PDF
                      </Button>
                    </div>
                    {changeLog.length > 0 && (
                      <div className="bg-muted/50 rounded p-2 space-y-1">
                        <p className="text-xs font-medium text-foreground">Änderungen:</p>
                        {changeLog.map((cl: any, i: number) => (
                          <p key={i} className="text-xs text-muted-foreground">
                            • <span className="font-medium">{cl.chapter || '–'}</span>: {cl.description}
                          </p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Batch approval bar */}
      {batchEligible.length > 0 && (
        <Card className="border-primary/30">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {selectedChapters.size} von {batchEligible.length} eingereichten Kapiteln ausgewählt
              </span>
            </div>
            <Button
              size="sm"
              disabled={selectedChapters.size === 0 || batchApproving}
              onClick={handleBatchApprove}
              className="gap-2"
            >
              {batchApproving && <Loader2 className="h-4 w-4 animate-spin" />}
              Ausgewählte freigeben
            </Button>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Kapitel der Verfahrensdokumentation</h2>
        <div className="space-y-3">
          {GOBD_CHAPTERS.map((mainCh, i) => {
            const subKeys = mainCh.subChapters.map((sc) => sc.key);
            const progress = getMainChapterProgress(subKeys);
            const isOpen = openChapters.includes(mainCh.key);

            return (
              <motion.div
                key={mainCh.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Collapsible open={isOpen} onOpenChange={() => toggleChapter(mainCh.key)}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardContent className="flex items-center gap-4 py-4 cursor-pointer hover:bg-muted/30 transition-colors">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                          {mainCh.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">{mainCh.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {progress.done}/{progress.total} Unterkapitel freigegeben
                          </p>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                      </CardContent>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t px-4 pb-3 pt-1 space-y-1">
                        {mainCh.subChapters.map((sc) => {
                          const isActive = sc.isActive(answers);
                          const chStatus = getSubChapterStatus(sc.key, isActive);
                          const config = statusConfig[chStatus] || statusConfig.empty;
                          const StatusIcon = config.icon;
                          const chData = chapters.find(c => c.chapter_key === sc.key);
                          const isBatchEligible = chData && chData.status === 'client_submitted';

                          // Count how many active sub-chapters have been listed so far
                          // to enforce trial chapter limit
                          const activeSubChapters = mainCh.subChapters.filter(s => s.isActive(answers));
                          const activeIndex = activeSubChapters.findIndex(s => s.key === sc.key);
                          
                          // Calculate global active index for trial limit
                          let globalActiveIndex = 0;
                          for (const mCh of GOBD_CHAPTERS) {
                            for (const s of mCh.subChapters) {
                              if (s.key === sc.key) break;
                              if (s.isActive(answers)) globalActiveIndex++;
                            }
                            if (mCh.subChapters.some(s => s.key === sc.key)) break;
                          }
                          const isTrialLocked = isTrialing && maxEditableChapters !== null && isActive && globalActiveIndex >= maxEditableChapters;

                          return (
                            <div
                              key={sc.key}
                              className={`flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors ${
                                isActive && !isTrialLocked
                                  ? 'hover:bg-muted/50 cursor-pointer'
                                  : isTrialLocked
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'opacity-60'
                              }`}
                            >
                              {isBatchEligible && (
                                <Checkbox
                                  checked={selectedChapters.has(chData!.id)}
                                  onCheckedChange={() => toggleSelectChapter(chData!.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                              <span
                                className="flex items-center gap-3 flex-1 min-w-0"
                                onClick={() => {
                                  if (isActive && !isTrialLocked) navigate(`/projects/${id}/chapters/${sc.key}`);
                                  else if (isTrialLocked) toast({ title: 'Testmodus', description: `Im Testmodus sind nur ${maxEditableChapters} Kapitel bearbeitbar.`, variant: 'destructive' });
                                }}
                              >
                                <span className="text-xs font-mono text-muted-foreground w-8 shrink-0">{sc.number}</span>
                                <span className={`flex-1 text-sm ${isActive && !isTrialLocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {sc.title}
                                  {isTrialLocked && <span className="ml-2 text-[10px] text-muted-foreground">🔒</span>}
                                </span>
                              </span>
                              <Badge variant="secondary" className={`gap-1 text-[10px] px-2 py-0.5 ${config.className}`}>
                                <StatusIcon className="h-3 w-3" />
                                {config.label}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
