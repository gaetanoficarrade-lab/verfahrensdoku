import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  OnboardingAnswers,
  ONBOARDING_SECTIONS,
  LEGAL_FORMS,
  getActiveModulesFromVariables,
} from '@/lib/onboarding-variables';

interface OnboardingWizardProps {
  projectId: string;
  onboardingId: string;
  initialAnswers: OnboardingAnswers;
  onComplete: () => void;
}

const SECTION_FIELDS: Record<string, { key: string; label: string; type: 'text' | 'select' | 'switch'; options?: readonly string[] | string[] }[]> = {
  company: [
    { key: 'company_name', label: 'Firmenname', type: 'text' },
    { key: 'legal_form', label: 'Rechtsform', type: 'select', options: LEGAL_FORMS },
    { key: 'industry', label: 'Branche', type: 'text' },
    { key: 'founding_year', label: 'Gründungsjahr', type: 'text' },
  ],
  people: [
    { key: 'HAS_EMPLOYEES', label: 'Hat das Unternehmen Mitarbeiter?', type: 'switch' },
    { key: 'HAS_TAX_ADVISOR', label: 'Wird ein Steuerberater eingesetzt?', type: 'switch' },
    { key: 'ACCOUNTING_CONTACT', label: 'Ansprechpartner Buchhaltung', type: 'text' },
  ],
  accounting: [
    { key: 'BOOKKEEPING_BY', label: 'Buchhaltung wird geführt von', type: 'select', options: ['self', 'tax_advisor', 'shared'] },
    { key: 'document_transfer_method', label: 'Belegübergabe-Methode', type: 'text' },
  ],
  revenue: [
    { key: 'INVOICE_CREATION_TYPE', label: 'Art der Rechnungserstellung', type: 'text' },
    { key: 'HAS_CASH', label: 'Bargeschäfte vorhanden?', type: 'switch' },
    { key: 'USES_PAYMENT_PROVIDER', label: 'Zahlungsdienstleister (z.B. PayPal)?', type: 'switch' },
    { key: 'USES_MARKETPLACE', label: 'Marktplätze (z.B. Amazon)?', type: 'switch' },
    { key: 'HAS_E_INVOICING', label: 'E-Rechnungen?', type: 'select', options: ['yes', 'no', 'unknown'] },
  ],
  software: [
    { key: 'SOFTWARE_LIST', label: 'Eingesetzte Software', type: 'text' },
    { key: 'USES_CLOUD', label: 'Cloud-Dienste genutzt?', type: 'select', options: ['yes', 'no', 'partial', 'unknown'] },
  ],
  banking: [
    { key: 'HAS_BUSINESS_ACCOUNT', label: 'Geschäftskonto vorhanden?', type: 'switch' },
    { key: 'USES_ONLINE_BANKING', label: 'Online-Banking genutzt?', type: 'switch' },
    { key: 'HAS_AUTO_BANK_IMPORT', label: 'Automatischer Bankimport?', type: 'select', options: ['yes', 'no', 'unknown'] },
  ],
  documents: [
    { key: 'DOCUMENT_TYPE', label: 'Belegform', type: 'select', options: ['digital', 'paper', 'mixed'] },
    { key: 'HAS_SCAN_PROCESS', label: 'Scanprozess vorhanden?', type: 'switch' },
  ],
};

const BOOKKEEPING_LABELS: Record<string, string> = {
  self: 'Selbst',
  tax_advisor: 'Steuerberater',
  shared: 'Gemeinsam',
};

const E_INVOICE_LABELS: Record<string, string> = {
  yes: 'Ja',
  no: 'Nein',
  unknown: 'Unbekannt',
};

const CLOUD_LABELS: Record<string, string> = {
  yes: 'Ja',
  no: 'Nein',
  partial: 'Teilweise',
  unknown: 'Unbekannt',
};

const BANK_IMPORT_LABELS: Record<string, string> = {
  yes: 'Ja',
  no: 'Nein',
  unknown: 'Unbekannt',
};

const DOC_TYPE_LABELS: Record<string, string> = {
  digital: 'Digital',
  paper: 'Papier',
  mixed: 'Gemischt',
};

function getOptionLabel(key: string, value: string): string {
  if (key === 'BOOKKEEPING_BY') return BOOKKEEPING_LABELS[value] || value;
  if (key === 'HAS_E_INVOICING') return E_INVOICE_LABELS[value] || value;
  if (key === 'USES_CLOUD') return CLOUD_LABELS[value] || value;
  if (key === 'HAS_AUTO_BANK_IMPORT') return BANK_IMPORT_LABELS[value] || value;
  if (key === 'DOCUMENT_TYPE') return DOC_TYPE_LABELS[value] || value;
  return value;
}

export default function OnboardingWizard({ projectId, onboardingId, initialAnswers, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(initialAnswers);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const sections = ONBOARDING_SECTIONS;
  const totalSteps = sections.length + 1; // sections + summary
  const isLastSection = step === sections.length - 1;
  const isSummary = step === sections.length;

  const updateAnswer = useCallback((key: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const saveProgress = useCallback(async (a: OnboardingAnswers) => {
    if (!onboardingId) {
      // Create onboarding record
      await supabase.from('project_onboarding').insert({
        project_id: projectId,
        answers: a as any,
      });
    } else {
      await supabase
        .from('project_onboarding')
        .update({ answers: a as any })
        .eq('id', onboardingId);
    }
  }, [onboardingId, projectId]);

  const handleNext = async () => {
    if (isSummary) {
      await handleComplete();
      return;
    }
    await saveProgress(answers);
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const activeModules = getActiveModulesFromVariables(answers);

      if (onboardingId) {
        await supabase
          .from('project_onboarding')
          .update({
            answers: answers as any,
            active_modules: activeModules,
            completed_at: new Date().toISOString(),
          })
          .eq('id', onboardingId);
      } else {
        await supabase.from('project_onboarding').insert({
          project_id: projectId,
          answers: answers as any,
          active_modules: activeModules,
          completed_at: new Date().toISOString(),
        });
      }

      // Create chapter entries for active modules
      const { data: existing } = await supabase
        .from('chapter_data')
        .select('chapter_key')
        .eq('project_id', projectId);

      const existingKeys = new Set((existing || []).map((c: any) => c.chapter_key));
      const newChapters = activeModules
        .filter((m) => !existingKeys.has(m))
        .map((m, i) => ({
          project_id: projectId,
          chapter_key: m,
          status: 'empty',
        }));

      if (newChapters.length > 0) {
        await supabase.from('chapter_data').insert(newChapters);
      }

      toast({ title: 'Onboarding abgeschlossen', description: `${activeModules.length} Kapitel wurden aktiviert.` });
      onComplete();
    } catch (err: any) {
      toast({ title: 'Fehler', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const currentSection = !isSummary ? sections[step] : null;
  const fields = currentSection ? SECTION_FIELDS[currentSection.key] || [] : [];

  return (
    <Card className="border-border">
      <CardContent className="pt-6">
        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i === step ? 'bg-primary' : i < step ? 'bg-primary/40' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {isSummary ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Zusammenfassung</h2>
                <p className="text-sm text-muted-foreground">
                  Basierend auf Ihren Angaben werden <strong>{getActiveModulesFromVariables(answers).length} Kapitel</strong> für die Verfahrensdokumentation erstellt.
                </p>
                <div className="grid gap-2 text-sm">
                  {answers.company_name && (
                    <div className="flex justify-between border-b border-border pb-1">
                      <span className="text-muted-foreground">Firma</span>
                      <span className="text-foreground font-medium">{answers.company_name}</span>
                    </div>
                  )}
                  {answers.legal_form && (
                    <div className="flex justify-between border-b border-border pb-1">
                      <span className="text-muted-foreground">Rechtsform</span>
                      <span className="text-foreground font-medium">{answers.legal_form}</span>
                    </div>
                  )}
                  {answers.industry && (
                    <div className="flex justify-between border-b border-border pb-1">
                      <span className="text-muted-foreground">Branche</span>
                      <span className="text-foreground font-medium">{answers.industry}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{currentSection?.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{currentSection?.description}</p>
                </div>
                <div className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      {field.type === 'switch' ? (
                        <div className="flex items-center justify-between">
                          <Label htmlFor={field.key} className="text-sm">{field.label}</Label>
                          <Switch
                            id={field.key}
                            checked={!!answers[field.key]}
                            onCheckedChange={(val) => updateAnswer(field.key, val)}
                          />
                        </div>
                      ) : field.type === 'select' ? (
                        <>
                          <Label htmlFor={field.key}>{field.label}</Label>
                          <Select
                            value={(answers[field.key] as string) || ''}
                            onValueChange={(val) => updateAnswer(field.key, val)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Bitte wählen..." />
                            </SelectTrigger>
                            <SelectContent>
                              {(field.options || []).map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {field.key === 'legal_form' ? opt : getOptionLabel(field.key, opt)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </>
                      ) : (
                        <>
                          <Label htmlFor={field.key}>{field.label}</Label>
                          <Input
                            id={field.key}
                            value={(answers[field.key] as string) || ''}
                            onChange={(e) => updateAnswer(field.key, e.target.value)}
                            placeholder={field.label}
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button variant="ghost" size="sm" onClick={handleBack} disabled={step === 0} className={step === 0 ? 'invisible' : ''}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Zurück
          </Button>
          <Button onClick={handleNext} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSummary ? (
              <>
                Onboarding abschließen
                <Check className="h-4 w-4" />
              </>
            ) : (
              <>
                Weiter
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
