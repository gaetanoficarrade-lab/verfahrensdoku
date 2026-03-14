PDF-Dokumentenstruktur und Negativvermerk-Systematik für GoBD-Verfahrensdokumentation.

## PDF-Aufbau
1. Titelseite (mit ENTWURF/FINAL Badge + Wasserzeichen)
2. Dokumentinformationen (Firma, Steuernummer, Geltungsbereich, Verantwortlichkeiten)
3. Änderungshistorie (Versionstabelle)
4. Inhaltsverzeichnis
5. Hauptkapitel 1-5 mit allen Unterkapiteln
6. Anlagenverzeichnis (Systeminventar, Schnittstellen, Backup)

## Content Assembly
- editor_text → generated_text → auto-text → negativvermerk → placeholder
- Kein Kapitel bleibt leer
- getNegativvermerk() akzeptiert companyName als 3. Parameter
- AUTO_TEXT map in generatePdf.ts für systemseitige Standardtexte (z.B. 1_5 Pflege VfD)

## Negativvermerke
- Professionelle, GoBD-konforme Texte (nicht nur "entfällt")
- In chapter-structure.ts (inactiveText) und chapter-leitfragen.ts (getNegativvermerk)
- Werden im PDF als normaler Text gerendert (nicht italic/grau)
