import jsPDF from 'jspdf';
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

function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text(`Seite ${pageNum} von ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.text('Vertraulich', pageWidth - 20, pageHeight - 10, { align: 'right' });
}

function addWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  const pageHeight = doc.internal.pageSize.getHeight();

  for (const line of lines) {
    if (y > pageHeight - 25) {
      doc.addPage();
      y = 25;
    }
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

function renderMarkdownText(doc: jsPDF, text: string, x: number, startY: number, maxWidth: number): number {
  let y = startY;
  const pageHeight = doc.internal.pageSize.getHeight();
  const lines = text.split('\n');

  for (const line of lines) {
    if (y > pageHeight - 25) {
      doc.addPage();
      y = 25;
    }

    // Skip main chapter headers (## X.X ...)
    if (line.startsWith('## ')) continue;

    // Sub-headers (### ...)
    if (line.startsWith('### ')) {
      y += 3;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(24, 24, 27);
      y = addWrappedText(doc, line.replace('### ', ''), x, y, maxWidth, 5);
      y += 2;
      continue;
    }

    // Table rows
    if (line.startsWith('| ')) {
      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      y = addWrappedText(doc, line, x, y, maxWidth, 4);
      continue;
    }

    // Horizontal rule
    if (line.startsWith('---')) {
      y += 3;
      doc.setDrawColor(200, 200, 200);
      doc.line(x, y, x + maxWidth, y);
      y += 5;
      continue;
    }

    // Demo watermark line
    if (line.startsWith('*[DEMO')) {
      y += 2;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      y = addWrappedText(doc, line.replace(/\*/g, ''), x, y, maxWidth, 4);
      continue;
    }

    // List items
    if (line.startsWith('- ') || /^\d+\.\s/.test(line)) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      y = addWrappedText(doc, '  ' + line, x, y, maxWidth - 4, 4.5);
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      y += 3;
      continue;
    }

    // Regular text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    y = addWrappedText(doc, line, x, y, maxWidth, 4.5);
  }

  return y;
}

export function generateVerfahrensdokumentation({ companyName, projectName, chapters, answers }: PdfParams): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
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
  doc.text(companyName, pageWidth / 2, 130, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(projectName, pageWidth / 2, 140, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Erstellt am: ${today}`, pageWidth / 2, 155, { align: 'center' });

  // === TABLE OF CONTENTS ===
  doc.addPage();
  doc.setTextColor(24, 24, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Inhaltsverzeichnis', margin, 30);

  let tocY = 50;
  for (const mainCh of GOBD_CHAPTERS) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`${mainCh.number}. ${mainCh.title}`, margin, tocY);
    tocY += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    for (const sc of mainCh.subChapters) {
      const isActive = answers ? sc.isActive(answers) : true;
      doc.setTextColor(isActive ? 80 : 160, isActive ? 80 : 160, isActive ? 80 : 160);
      doc.text(`${sc.number} ${sc.title}${!isActive ? ' (nicht relevant)' : ''}`, margin + 8, tocY);
      tocY += 5;
      if (tocY > 270) {
        doc.addPage();
        tocY = 25;
      }
    }
    tocY += 3;
  }

  // === CHAPTER PAGES ===
  for (const mainCh of GOBD_CHAPTERS) {
    // Main chapter header page
    doc.addPage();
    doc.setTextColor(24, 24, 27);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(`${mainCh.number}. ${mainCh.title}`, margin, 35);
    doc.setDrawColor(30, 58, 95);
    doc.setLineWidth(0.5);
    doc.line(margin, 39, pageWidth - margin, 39);

    let y = 50;

    for (const sc of mainCh.subChapters) {
      const chData = chapters.find(c => c.chapter_key === sc.key);
      const text = chData?.editor_text || chData?.generated_text || null;
      const isActive = answers ? sc.isActive(answers) : true;

      // Check if we need a new page
      if (y > 230) {
        doc.addPage();
        y = 25;
      }

      // Subchapter header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(24, 24, 27);
      doc.text(`${sc.number} ${sc.title}`, margin, y);
      y += 2;
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;

      if (text) {
        y = renderMarkdownText(doc, text, margin, y, contentWidth);
      } else if (!isActive) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(140, 140, 140);
        y = addWrappedText(doc, sc.inactiveText || 'Dieses Kapitel ist für das Unternehmen nicht relevant und entfällt.', margin, y, contentWidth, 4.5);
      } else {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(140, 140, 140);
        y = addWrappedText(doc, '[Noch nicht fertiggestellt]', margin, y, contentWidth, 4.5);
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
