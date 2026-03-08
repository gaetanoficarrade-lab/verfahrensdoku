

## Plan: Leitfragen für alle 30 Unterkapitel

### 1. Neue Datei: `src/lib/chapter-leitfragen.ts`
Erstelle ein exportiertes Objekt `CHAPTER_LEITFRAGEN: Record<string, string[]>` mit allen 30 chapter_keys. Jedes Unterkapitel bekommt 3-5 Leitfragen nach der GoBD-4-Block-Struktur (Auslöser → Durchführung → Nachweis → Aufbewahrung).

### 2. ChapterEditor anpassen (`src/pages/ChapterEditor.tsx`)
- Importiere `CHAPTER_LEITFRAGEN`
- Oberhalb der `<Textarea>` für Mandanten-Angaben (Zeile ~345): Wenn Leitfragen für den aktuellen `chapterKey` existieren, zeige eine graue Hinweisbox (`bg-muted rounded-lg p-4`) mit:
  - Kleiner Überschrift "Leitfragen"
  - Jede Frage als eigene Zeile mit `ChevronRight`-Icon davor
  - Nur für Clients sichtbar (nicht für Advisors)

### Technische Details

Die Hinweisbox wird als einfaches `div` mit Tailwind-Klassen umgesetzt — keine neue Komponente nötig. Icon: `ChevronRight` aus lucide-react.

Leitfragen-Beispiele für alle Kapitel folgen der Struktur:
- **Kap 1** (Allgemein): Beschreibung, Organisation, Zuständigkeiten
- **Kap 2** (Anwender): Auslöser des Prozesses → Ablauf → Dokumentation → Archivierung
- **Kap 3** (Technik): Welche Software → Konfiguration → Schnittstellen → Datenhaltung
- **Kap 4** (Betrieb): Wann/Wie wird gesichert → Prozess → Nachweis → Aufbewahrung
- **Kap 5** (IKS): Wer kontrolliert → Wie → Dokumentation → Eskalation

