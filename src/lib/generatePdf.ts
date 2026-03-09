import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GOBD_CHAPTERS } from './chapter-structure';
import type { OnboardingAnswers } from './onboarding-variables';

interface ChapterContent {
  chapter_key: string;
  editor_text: string | null;
  generated_text: string | null;
}

interface PdfParams {
  companyName: string;
  projectName: string;
  chapters: ChapterContent[];
  answers?: OnboardingAnswers;
}

const MARGIN = 20;
const PAGE_BOTTOM = 272; // leave room for footer
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
  // Simple approach: strip bold for wrapping calculation, render with bold segments
  const plainText = stripMarkdown(line);
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'normal');
  const wrappedLines: string[] = doc.splitTextToSize(plainText, maxWidth);

  for (const wl of wrappedLines) {
    y = checkPageBreak(doc, y);
    // Check if this wrapped line contains any bold segments
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
  // Find where plainLine appears in the stripped original
  const stripped = stripMarkdown(originalMarkdown);
  const idx = stripped.indexOf(plainLine.trim());
  if (idx === -1) return plainLine;

  // Walk through original markdown to find corresponding range
  let strippedPos = 0;
  let mdStart = -1;
  let mdEnd = -1;

  for (let i = 0; i < originalMarkdown.length && mdEnd === -1; i++) {
    // Check if we're at a markdown marker
    if (originalMarkdown.substring(i, i + 2) === '**') {
      i++; // skip the second *
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
    // Extend to include surrounding ** markers
    let result = originalMarkdown.substring(mdStart, mdEnd);
    // Check if we're inside a bold block
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

  // Skip separator line (|---|---|)
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
    didDrawPage: () => {
      // Pages added by autoTable will get footers later
    },
  });

  // Get final Y position after table
  return (doc as any).lastAutoTable?.finalY + PARAGRAPH_GAP || y + 20;
}

function renderMarkdownText(doc: jsPDF, text: string, x: number, startY: number, maxWidth: number): number {
  let y = startY;
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip main chapter headers (## X.X ...)
    if (line.startsWith('## ')) {
      i++;
      continue;
    }

    // Sub-headers (### ...)
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

    // Table detection: line starts with | and has multiple |
    if (line.trim().startsWith('|') && line.indexOf('|', 1) > 0) {
      const { headers, rows, endIdx } = parseTable(lines, i);
      if (headers.length > 0 && rows.length > 0) {
        y = renderTable(doc, headers, rows, x, y, maxWidth);
        i = endIdx;
        continue;
      }
      // Fallback: skip malformed table line
      i++;
      continue;
    }

    // Horizontal rule
    if (line.trim().startsWith('---')) {
      y += 3;
      y = checkPageBreak(doc, y);
      doc.setDrawColor(200, 200, 200);
      doc.line(x, y, x + maxWidth, y);
      y += 5;
      i++;
      continue;
    }

    // Demo watermark line
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

    // List items (- or 1.)
    if (line.match(/^\s*[-•]\s/) || /^\s*\d+\.\s/.test(line)) {
      y = checkPageBreak(doc, y);
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const bulletIndent = 5;
      const bulletText = line.replace(/^\s*[-•]\s+/, '').replace(/^\s*\d+\.\s+/, '');

      // Draw bullet point
      doc.setFont('helvetica', 'normal');
      doc.text('•', x + 1, y);

      // Render list item text with inline formatting
      y = renderFormattedLine(doc, bulletText, x + bulletIndent, y, maxWidth - bulletIndent, 9);
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      y += PARAGRAPH_GAP;
      i++;
      continue;
    }

    // Regular text with inline formatting
    doc.setTextColor(60, 60, 60);
    y = renderFormattedLine(doc, line, x, y, maxWidth, 9);
    i++;
  }

  return y;
}

export function generateVerfahrensdokumentation({ companyName, projectName, chapters, answers }: PdfParams): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = getContentWidth(doc);
  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // === COVER PAGE ===
  doc.setFillColor(24, 24, 27);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('Verfahrensdokumentation', pageWidth / 2, 90, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('nach GoBD', pageWidth / 2, 102, { align: 'center' });

  doc.setDrawColor(100, 100, 100);
  doc.line(pageWidth / 2 - 30, 115, pageWidth / 2 + 30, 115);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const companyLines = doc.splitTextToSize(companyName, contentWidth);
  let coverY = 130;
  for (const cl of companyLines) {
    doc.text(cl, pageWidth / 2, coverY, { align: 'center' });
    coverY += 8;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(projectName, pageWidth / 2, coverY + 2, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Erstellt am: ${today}`, pageWidth / 2, coverY + 17, { align: 'center' });

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
      const scLine = `${sc.number} ${sc.title}${!isActive ? ' (nicht relevant)' : ''}`;
      const scWrapped = doc.splitTextToSize(scLine, contentWidth - 8);
      for (const sl of scWrapped) {
        if (tocY > PAGE_BOTTOM) { doc.addPage(); tocY = 25; }
        doc.text(sl, MARGIN + 8, tocY);
        tocY += 5;
      }
    }
    tocY += 3;
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
      const text = chData?.editor_text || chData?.generated_text || null;
      const isActive = answers ? sc.isActive(answers) : true;

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

      if (text) {
        y = renderMarkdownText(doc, text, MARGIN, y, contentWidth);
      } else if (!isActive) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(140, 140, 140);
        const inactiveText = sc.inactiveText || 'Dieses Kapitel ist für das Unternehmen nicht relevant und entfällt.';
        const inactiveWrapped = doc.splitTextToSize(inactiveText, contentWidth);
        for (const il of inactiveWrapped) {
          y = checkPageBreak(doc, y);
          doc.text(il, MARGIN, y);
          y += LINE_HEIGHT;
        }
      } else {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(140, 140, 140);
        doc.text('[Noch nicht fertiggestellt]', MARGIN, y);
        y += LINE_HEIGHT;
      }

      y += 10;
    }
  }

  // === ADD FOOTERS ===
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i - 1, totalPages - 1);
  }

  return doc;
}
