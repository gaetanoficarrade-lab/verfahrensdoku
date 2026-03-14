Inline-Versionierung: Snapshot-basierte Versionierung bei Finalisierung, chapter_versions für Einzelspeicherungen.

## Konzept
- Jede Kapitel-Speicherung → chapter_versions (existierte schon, mit change_reason, version_number, change_type)
- Finalisierung → document_versions mit chapters_snapshot (JSONB), change_log (JSONB), version_label (TEXT)
- Version 1.0, 1.1, 1.2 etc. (auto-increment minor)
- Alte Versionen: PDF aus Snapshot re-generierbar

## DB-Erweiterung
- document_versions: +version_label TEXT, +chapters_snapshot JSONB, +change_log JSONB

## Change-Log-Erkennung
- Vergleich aktueller Kapiteltext mit letztem Snapshot
- change_reason aus chapter_versions seit letzter Finalisierung
- Wird im PDF auf der Änderungshistorie-Seite als Tabelle gerendert

## PDF Änderungshistorie
- Bereits in generatePdf.ts vorhanden (Seite nach Dokumentinformationen)
- versions[] Parameter: version, date, chapter, description, changedBy
