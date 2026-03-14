import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GOBD_CHAPTERS } from './chapter-structure';
import { getNegativvermerk } from './chapter-leitfragen';
import type { OnboardingAnswers } from './onboarding-variables';

interface ChapterContent {
  chapter_key: string;
  editor_text: string | null;
  generated_text: string | null;
  generated_hints?: string[] | null;
}

interface VersionEntry {
  version: string;
  date: string;
  changedBy: string;
  description: string;
  chapter?: string;
}

interface PdfParams {
  companyName: string;
  projectName: string;
  chapters: ChapterContent[];
  answers?: OnboardingAnswers;
  isFinal?: boolean;
  taxNumber?: string;
  responsiblePerson?: string;
  itResponsible?: string;
  processResponsible?: string;
  versions?: VersionEntry[];
  watermarkText?: string | null;
}

const MARGIN = 20;
const PAGE_BOTTOM = 272;
const LINE_HEIGHT = 5;
const PARAGRAPH_GAP = 7;

function getContentWidth(doc: jsPDF): number {
  return doc.internal.pageSize.getWidth() - MARGIN * 2;
}

function checkPageBreak(doc: jsPDF, y: number, needed: number = 10): number {
  if (y + needed > PAGE_BOTTOM) {
    doc.addPage();
    return 25;
  }
  return y;
}

function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text(`Seite ${pageNum} von ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.text('Vertraulich', pageWidth - MARGIN, pageHeight - 10, { align: 'right' });
}

function addWatermark(doc: jsPDF, text: string = 'ENTWURF') {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.saveGraphicsState();
  doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(text.length > 10 ? 36 : 60);
  doc.setTextColor(200, 0, 0);
  // Rotate and place diagonally
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;
  doc.text(text, centerX, centerY, {
    align: 'center',
    angle: 45,
  });
  doc.restoreGraphicsState();
}

/** Strip markdown bold markers, return segments with bold info */
interface TextSegment {
  text: string;
  bold: boolean;
}

function parseInlineFormatting(line: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: line.slice(lastIndex, match.index), bold: false });
    }
    segments.push({ text: match[1], bold: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) {
    segments.push({ text: line.slice(lastIndex), bold: false });
  }
  if (segments.length === 0) {
    segments.push({ text: line, bold: false });
  }
  return segments;
}

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '');
}

/** Render a line with inline bold using splitTextToSize for wrapping */
function renderFormattedLine(doc: jsPDF, line: string, x: number, y: number, maxWidth: number, fontSize: number = 9): number {
  const plainText = stripMarkdown(line);
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'normal');
  const wrappedLines: string[] = doc.splitTextToSize(plainText, maxWidth);

  for (const wl of wrappedLines) {
    y = checkPageBreak(doc, y);
    const segments = parseInlineFormatting(reconstructMarkdown(line, wl));
    let cx = x;
    for (const seg of segments) {
      doc.setFont('helvetica', seg.bold ? 'bold' : 'normal');
      doc.text(seg.text, cx, y);
      cx += doc.getTextWidth(seg.text);
    }
    y += LINE_HEIGHT;
  }
  return y;
}

/** Try to find the markdown version of a plain-text wrapped line */
function reconstructMarkdown(originalMarkdown: string, plainLine: string): string {
  const stripped = stripMarkdown(originalMarkdown);
  const idx = stripped.indexOf(plainLine.trim());
  if (idx === -1) return plainLine;

  let strippedPos = 0;
  let mdStart = -1;
  let mdEnd = -1;

  for (let i = 0; i < originalMarkdown.length && mdEnd === -1; i++) {
    if (originalMarkdown.substring(i, i + 2) === '**') {
      i++;
      continue;
    }
    if (originalMarkdown[i] === '*' || originalMarkdown[i] === '`') {
      continue;
    }
    if (strippedPos === idx && mdStart === -1) {
      mdStart = i;
    }
    strippedPos++;
    if (strippedPos === idx + plainLine.trim().length) {
      mdEnd = i + 1;
    }
  }

  if (mdStart !== -1 && mdEnd !== -1) {
    let result = originalMarkdown.substring(mdStart, mdEnd);
    const before = originalMarkdown.substring(0, mdStart);
    const openBolds = (before.match(/\*\*/g) || []).length;
    if (openBolds % 2 === 1) {
      result = '**' + result;
    }
    const after = originalMarkdown.substring(mdEnd);
    const closeBolds = (after.match(/\*\*/g) || []).length;
    if (closeBolds % 2 === 1 && openBolds % 2 === 1) {
      result = result + '**';
    }
    return result;
  }
  return plainLine;
}

/** Parse markdown table lines into header + rows */
function parseTable(lines: string[], startIdx: number): { headers: string[]; rows: string[][]; endIdx: number } {
  const headers = lines[startIdx]
    .split('|')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  let i = startIdx + 1;
  if (i < lines.length && /^\|[\s\-:|]+\|/.test(lines[i])) {
    i++;
  }

  const rows: string[][] = [];
  while (i < lines.length && lines[i].trim().startsWith('|')) {
    const cells = lines[i]
      .split('|')
      .map(s => stripMarkdown(s.trim()))
      .filter(s => s.length > 0);
    if (cells.length > 0) {
      rows.push(cells);
    }
    i++;
  }

  return { headers: headers.map(h => stripMarkdown(h)), rows, endIdx: i };
}

function renderTable(doc: jsPDF, headers: string[], rows: string[][], x: number, y: number, maxWidth: number): number {
  y = checkPageBreak(doc, y, 20);

  autoTable(doc, {
    startY: y,
    head: [headers],
    body: rows,
    margin: { left: x, right: MARGIN },
    tableWidth: maxWidth,
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2,
      textColor: [60, 60, 60],
      lineColor: [200, 200, 200],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [240, 240, 245],
      textColor: [24, 24, 27],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [250, 250, 252],
    },
  });

  return (doc as any).lastAutoTable?.finalY + PARAGRAPH_GAP || y + 20;
}

function renderMarkdownText(doc: jsPDF, text: string, x: number, startY: number, maxWidth: number): number {
  let y = startY;
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('## ')) { i++; continue; }

    if (line.startsWith('### ')) {
      y += 3;
      y = checkPageBreak(doc, y);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(24, 24, 27);
      const headerText = line.replace(/^###\s+/, '');
      const wrappedHeader = doc.splitTextToSize(stripMarkdown(headerText), maxWidth);
      for (const hl of wrappedHeader) {
        y = checkPageBreak(doc, y);
        doc.text(hl, x, y);
        y += 5.5;
      }
      y += 2;
      i++;
      continue;
    }

    if (line.trim().startsWith('|') && line.indexOf('|', 1) > 0) {
      const { headers, rows, endIdx } = parseTable(lines, i);
      if (headers.length > 0 && rows.length > 0) {
        y = renderTable(doc, headers, rows, x, y, maxWidth);
        i = endIdx;
        continue;
      }
      i++;
      continue;
    }

    if (line.trim().startsWith('---')) {
      y += 3;
      y = checkPageBreak(doc, y);
      doc.setDrawColor(200, 200, 200);
      doc.line(x, y, x + maxWidth, y);
      y += 5;
      i++;
      continue;
    }

    if (line.startsWith('*[DEMO')) {
      y += 2;
      y = checkPageBreak(doc, y);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      const cleanDemo = line.replace(/\*/g, '').replace(/\[|\]/g, '');
      const demoLines = doc.splitTextToSize(cleanDemo, maxWidth);
      for (const dl of demoLines) {
        y = checkPageBreak(doc, y);
        doc.text(dl, x, y);
        y += 4;
      }
      i++;
      continue;
    }

    if (line.match(/^\s*[-•]\s/) || /^\s*\d+\.\s/.test(line)) {
      y = checkPageBreak(doc, y);
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const bulletIndent = 5;
      const bulletText = line.replace(/^\s*[-•]\s+/, '').replace(/^\s*\d+\.\s+/, '');
      doc.setFont('helvetica', 'normal');
      doc.text('•', x + 1, y);
      y = renderFormattedLine(doc, bulletText, x + bulletIndent, y, maxWidth - bulletIndent, 9);
      i++;
      continue;
    }

    if (line.trim() === '') {
      y += PARAGRAPH_GAP;
      i++;
      continue;
    }

    doc.setTextColor(60, 60, 60);
    y = renderFormattedLine(doc, line, x, y, maxWidth, 9);
    i++;
  }

  return y;
}

/** Auto-text blocks that are always appended to specific chapters */
const AUTO_TEXT: Record<string, string> = {
  '1_5': 'Die Verfahrensdokumentation wird bei wesentlichen Änderungen der betrieblichen Abläufe, der eingesetzten Software oder der organisatorischen Zuständigkeiten aktualisiert. Jede Änderung wird mit Datum und Versionsnummer dokumentiert. Die Änderungshistorie ist Bestandteil dieses Dokuments.',
};

/**
 * Resolve the final text for a chapter following the assembly logic:
 * 1. editor_text (advisor edited) OR generated_text (AI draft)
 * 2. + auto-text if defined
 * 3. If nothing → negativvermerk if chapter is inactive
 * 4. If still nothing → placeholder
 */
function resolveChapterContent(
  chapterKey: string,
  chData: ChapterContent | undefined,
  isActive: boolean,
  answers: OnboardingAnswers | undefined,
  companyName: string,
): { text: string; isNegativvermerk: boolean } {
  let text = chData?.editor_text || chData?.generated_text || '';

  // Append auto-text if applicable
  const autoText = AUTO_TEXT[chapterKey];
  if (text && autoText) {
    text = text.trimEnd() + '\n\n' + autoText;
  }

  if (text) {
    return { text, isNegativvermerk: false };
  }

  // No content → try negativvermerk
  if (!isActive && answers) {
    const nv = getNegativvermerk(chapterKey, answers, companyName);
    if (nv) return { text: nv, isNegativvermerk: true };
  }

  // Fallback to inactiveText from chapter-structure
  if (!isActive) {
    const chapter = GOBD_CHAPTERS.flatMap(c => c.subChapters).find(sc => sc.key === chapterKey);
    if (chapter?.inactiveText) {
      return { text: chapter.inactiveText, isNegativvermerk: true };
    }
    return { text: 'Dieses Kapitel ist für das Unternehmen nicht relevant.', isNegativvermerk: true };
  }

  // Active but no text
  if (autoText) {
    return { text: autoText, isNegativvermerk: false };
  }

  return { text: '[Noch nicht fertiggestellt]', isNegativvermerk: false };
}

export function generateVerfahrensdokumentation({
  companyName,
  projectName,
  chapters,
  answers,
  isFinal = false,
  taxNumber,
  responsiblePerson,
  itResponsible,
  processResponsible,
  versions = [],
}: PdfParams): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = getContentWidth(doc);
  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const statusLabel = isFinal ? 'FINAL' : 'ENTWURF';
  const currentVersion = versions.length > 0 ? versions[0].version : '1.0';

  // === COVER PAGE (white background, black text) ===
  // No fill — white page by default

  doc.setTextColor(24, 24, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('Verfahrensdokumentation', pageWidth / 2, 85, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('nach GoBD', pageWidth / 2, 97, { align: 'center' });

  doc.setDrawColor(180, 180, 180);
  doc.line(pageWidth / 2 - 30, 110, pageWidth / 2 + 30, 110);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const companyLines = doc.splitTextToSize(companyName, contentWidth);
  let coverY = 125;
  for (const cl of companyLines) {
    doc.text(cl, pageWidth / 2, coverY, { align: 'center' });
    coverY += 8;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(projectName, pageWidth / 2, coverY + 2, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Erstellt am: ${today}`, pageWidth / 2, coverY + 17, { align: 'center' });
  doc.text(`Version ${currentVersion}`, pageWidth / 2, coverY + 25, { align: 'center' });

  // Status Badge
  const badgeY = coverY + 40;
  const badgeWidth = 50;
  const badgeHeight = 10;
  if (isFinal) {
    doc.setFillColor(34, 139, 34);
  } else {
    doc.setFillColor(200, 120, 0);
  }
  doc.roundedRect(pageWidth / 2 - badgeWidth / 2, badgeY - 7, badgeWidth, badgeHeight, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(statusLabel, pageWidth / 2, badgeY, { align: 'center' });

  // === DOKUMENTINFORMATIONEN ===
  doc.addPage();
  doc.setTextColor(24, 24, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Dokumentinformationen', MARGIN, 30);

  let infoY = 45;
  const infoRows: string[][] = [
    ['Erstellt für', companyName],
    ['Steuernummer', taxNumber || '–'],
    ['Rechtsform', answers?.legal_form || '–'],
    ['Branche', answers?.industry || '–'],
    ['Dokumentversion', currentVersion],
    ['Status', statusLabel],
  ];

  autoTable(doc, {
    startY: infoY,
    head: [['Feld', 'Wert']],
    body: infoRows,
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: contentWidth,
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 3, textColor: [60, 60, 60], lineColor: [200, 200, 200], lineWidth: 0.2 },
    headStyles: { fillColor: [240, 240, 245], textColor: [24, 24, 27], fontStyle: 'bold' },
  });

  infoY = (doc as any).lastAutoTable?.finalY + 10 || infoY + 40;

  // Geltungsbereich
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Geltungsbereich', MARGIN, infoY);
  infoY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const scopeItems = [
    'Organisation und betriebliche Abläufe',
    'Eingesetzte DV-Systeme und Software',
    'Steuerrelevante Geschäftsprozesse',
  ];
  for (const item of scopeItems) {
    doc.text(`• ${item}`, MARGIN + 3, infoY);
    infoY += 5;
  }

  infoY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(24, 24, 27);
  doc.text('Verantwortlichkeiten', MARGIN, infoY);
  infoY += 7;

  const respRows: string[][] = [
    ['Dokumentverantwortlicher', responsiblePerson || answers?.ACCOUNTING_CONTACT || '–'],
    ['Prozessverantwortlicher', processResponsible || '–'],
    ['IT-Verantwortlicher', itResponsible || '–'],
  ];

  autoTable(doc, {
    startY: infoY,
    head: [['Rolle', 'Person / Funktion']],
    body: respRows,
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: contentWidth,
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 3, textColor: [60, 60, 60], lineColor: [200, 200, 200], lineWidth: 0.2 },
    headStyles: { fillColor: [240, 240, 245], textColor: [24, 24, 27], fontStyle: 'bold' },
  });

  // === ÄNDERUNGSHISTORIE ===
  doc.addPage();
  doc.setTextColor(24, 24, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Änderungshistorie', MARGIN, 30);

  const versionRows = versions.length > 0
    ? versions.map(v => [v.version, v.date, v.chapter || '–', v.description, v.changedBy])
    : [['1.0', today, 'Erstversion', 'Erstellt', responsiblePerson || '–']];

  autoTable(doc, {
    startY: 42,
    head: [['Version', 'Datum', 'Kapitel', 'Beschreibung der Änderung', 'Geändert von']],
    body: versionRows,
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: contentWidth,
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 3, textColor: [60, 60, 60], lineColor: [200, 200, 200], lineWidth: 0.2 },
    headStyles: { fillColor: [240, 240, 245], textColor: [24, 24, 27], fontStyle: 'bold', fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 25 },
      4: { cellWidth: 35 },
    },
  });

  // === TABLE OF CONTENTS ===
  doc.addPage();
  doc.setTextColor(24, 24, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Inhaltsverzeichnis', MARGIN, 30);

  let tocY = 50;
  for (const mainCh of GOBD_CHAPTERS) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(24, 24, 27);
    const tocLine = `${mainCh.number}. ${mainCh.title}`;
    const tocWrapped = doc.splitTextToSize(tocLine, contentWidth);
    for (const tl of tocWrapped) {
      if (tocY > PAGE_BOTTOM) { doc.addPage(); tocY = 25; }
      doc.text(tl, MARGIN, tocY);
      tocY += 6;
    }
    tocY += 1;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    for (const sc of mainCh.subChapters) {
      const isActive = answers ? sc.isActive(answers) : true;
      doc.setTextColor(isActive ? 80 : 160, isActive ? 80 : 160, isActive ? 80 : 160);
      const scLine = `${sc.number} ${sc.title}`;
      const scWrapped = doc.splitTextToSize(scLine, contentWidth - 8);
      for (const sl of scWrapped) {
        if (tocY > PAGE_BOTTOM) { doc.addPage(); tocY = 25; }
        doc.text(sl, MARGIN + 8, tocY);
        tocY += 5;
      }
    }
    tocY += 3;
  }

  // Add Anlagenverzeichnis to TOC
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(24, 24, 27);
  if (tocY > PAGE_BOTTOM) { doc.addPage(); tocY = 25; }
  doc.text('6. Anlagenverzeichnis', MARGIN, tocY);
  tocY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  for (const sub of ['6.1 Systeminventar', '6.2 Schnittstellenübersicht', '6.3 Backup- und Sicherungskonzept']) {
    if (tocY > PAGE_BOTTOM) { doc.addPage(); tocY = 25; }
    doc.text(sub, MARGIN + 8, tocY);
    tocY += 5;
  }

  // === CHAPTER PAGES ===
  for (const mainCh of GOBD_CHAPTERS) {
    doc.addPage();
    doc.setTextColor(24, 24, 27);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    const mainTitle = `${mainCh.number}. ${mainCh.title}`;
    const mainWrapped = doc.splitTextToSize(mainTitle, contentWidth);
    let y = 35;
    for (const ml of mainWrapped) {
      doc.text(ml, MARGIN, y);
      y += 9;
    }
    doc.setDrawColor(30, 58, 95);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y - 4, pageWidth - MARGIN, y - 4);
    y += 6;

    for (const sc of mainCh.subChapters) {
      const chData = chapters.find(c => c.chapter_key === sc.key);
      const isActive = answers ? sc.isActive(answers) : true;
      const { text, isNegativvermerk } = resolveChapterContent(
        sc.key, chData, isActive, answers, companyName
      );

      y = checkPageBreak(doc, y, 20);

      // Subchapter header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(24, 24, 27);
      const scTitle = `${sc.number} ${sc.title}`;
      const scTitleWrapped = doc.splitTextToSize(scTitle, contentWidth);
      for (const stl of scTitleWrapped) {
        y = checkPageBreak(doc, y);
        doc.text(stl, MARGIN, y);
        y += 6;
      }
      doc.setDrawColor(220, 220, 220);
      doc.line(MARGIN, y - 3, pageWidth - MARGIN, y - 3);
      y += 3;

      if (text === '[Noch nicht fertiggestellt]') {
        // Placeholder for incomplete chapters
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(140, 140, 140);
        doc.text('[Noch nicht fertiggestellt]', MARGIN, y);
        y += LINE_HEIGHT;
      } else if (isNegativvermerk) {
        // Professional negativvermerk – rendered as normal body text (not italic/gray)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        const nvWrapped = doc.splitTextToSize(text, contentWidth);
        for (const nl of nvWrapped) {
          y = checkPageBreak(doc, y);
          doc.text(nl, MARGIN, y);
          y += LINE_HEIGHT;
        }
      } else {
        y = renderMarkdownText(doc, text, MARGIN, y, contentWidth);
      }

      y += 10;
    }
  }

  // === ANLAGENVERZEICHNIS ===
  doc.addPage();
  doc.setTextColor(24, 24, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('6. Anlagenverzeichnis', MARGIN, 35);
  doc.setDrawColor(30, 58, 95);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, 40, pageWidth - MARGIN, 40);

  let aY = 50;

  // 6.1 Systeminventar
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('6.1 Systeminventar', MARGIN, aY);
  aY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);

  const softwareList = answers?.SOFTWARE_LIST;
  if (softwareList) {
    const softwareItems = typeof softwareList === 'string'
      ? softwareList.split(',').map(s => s.trim()).filter(Boolean)
      : Array.isArray(softwareList) ? softwareList : [];
    if (softwareItems.length > 0) {
      const sysRows = softwareItems.map((sw, i) => [String(i + 1), sw, '–', '–']);
      autoTable(doc, {
        startY: aY,
        head: [['Nr.', 'Software / System', 'Version', 'Einsatzbereich']],
        body: sysRows,
        margin: { left: MARGIN, right: MARGIN },
        tableWidth: contentWidth,
        styles: { font: 'helvetica', fontSize: 8, cellPadding: 2, textColor: [60, 60, 60], lineColor: [200, 200, 200], lineWidth: 0.2 },
        headStyles: { fillColor: [240, 240, 245], textColor: [24, 24, 27], fontStyle: 'bold' },
      });
      aY = (doc as any).lastAutoTable?.finalY + 10 || aY + 30;
    } else {
      doc.text('Keine Softwaresysteme im Onboarding angegeben.', MARGIN, aY);
      aY += 10;
    }
  } else {
    doc.text('Keine Softwaresysteme im Onboarding angegeben.', MARGIN, aY);
    aY += 10;
  }

  // 6.2 Schnittstellenübersicht
  aY = checkPageBreak(doc, aY, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(24, 24, 27);
  doc.text('6.2 Schnittstellenübersicht', MARGIN, aY);
  aY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);

  const interfaceItems: string[][] = [];
  if (answers?.USES_ONLINE_BANKING) interfaceItems.push(['Bankschnittstelle', 'Online-Banking', 'Kontoauszüge / Zahlungen']);
  if (answers?.USES_PAYMENT_PROVIDER) interfaceItems.push(['Zahlungsdienstleister', 'Extern', 'Transaktionsdaten']);
  if (answers?.USES_MARKETPLACE) interfaceItems.push(['Marktplatz', 'Extern', 'Bestelldaten / Abrechnungen']);
  if (answers?.HAS_E_INVOICING === 'yes') interfaceItems.push(['E-Rechnung', 'ZUGFeRD / XRechnung', 'Rechnungsdaten']);

  if (interfaceItems.length > 0) {
    autoTable(doc, {
      startY: aY,
      head: [['Schnittstelle', 'Typ', 'Übertragene Daten']],
      body: interfaceItems,
      margin: { left: MARGIN, right: MARGIN },
      tableWidth: contentWidth,
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 2, textColor: [60, 60, 60], lineColor: [200, 200, 200], lineWidth: 0.2 },
      headStyles: { fillColor: [240, 240, 245], textColor: [24, 24, 27], fontStyle: 'bold' },
    });
    aY = (doc as any).lastAutoTable?.finalY + 10 || aY + 30;
  } else {
    doc.text('Es werden keine automatisierten Schnittstellen eingesetzt.', MARGIN, aY);
    aY += 10;
  }

  // 6.3 Backup- und Sicherungskonzept
  aY = checkPageBreak(doc, aY, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(24, 24, 27);
  doc.text('6.3 Backup- und Sicherungskonzept', MARGIN, aY);
  aY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const backupText = answers?.USES_CLOUD === 'yes' || answers?.USES_CLOUD === 'partial'
    ? 'Die Datensicherung der cloudbasierten Systeme erfolgt durch den jeweiligen Anbieter. Details zur lokalen Datensicherung sind in Kapitel 4.1 beschrieben.'
    : 'Die Datensicherung erfolgt lokal. Details zum Sicherungskonzept sind in Kapitel 4.1 beschrieben.';
  const backupWrapped = doc.splitTextToSize(backupText, contentWidth);
  for (const bl of backupWrapped) {
    aY = checkPageBreak(doc, aY);
    doc.text(bl, MARGIN, aY);
    aY += LINE_HEIGHT;
  }

  // === ADD WATERMARK (ENTWURF) AND FOOTERS ===
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Add watermark to all pages except cover (page 1) when not final or trial watermark
    const effectiveWatermark = watermarkText || (!isFinal ? 'ENTWURF' : null);
    if (effectiveWatermark && i > 1) {
      addWatermark(doc, effectiveWatermark);
    }
    // Add footer to all pages except cover
    if (i >= 2) {
      addFooter(doc, i - 1, totalPages - 1);
    }
  }

  return doc;
}
