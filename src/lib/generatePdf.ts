import jsPDF from 'jspdf';

const CHAPTERS = [
  { key: 'org_environment', title: '1. Organisatorisches Umfeld' },
  { key: 'it_environment', title: '2. IT-Umfeld' },
  { key: 'processes', title: '3. Geschäftsprozesse' },
  { key: 'archiving', title: '4. Archivierung' },
  { key: 'ics', title: '5. Internes Kontrollsystem' },
];

interface ChapterContent {
  chapter_key: string;
  editor_text: string | null;
  generated_text: string | null;
}

interface PdfParams {
  companyName: string;
  projectName: string;
  chapters: ChapterContent[];
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

export function generateVerfahrensdokumentation({ companyName, projectName, chapters }: PdfParams): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // === COVER PAGE ===
  doc.setFillColor(24, 24, 27); // zinc-900
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('Verfahrensdokumentation', pageWidth / 2, 90, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('nach GoBD', pageWidth / 2, 102, { align: 'center' });

  doc.setFontSize(10);
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

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  let tocY = 50;
  for (const ch of CHAPTERS) {
    doc.text(ch.title, margin, tocY);
    tocY += 10;
  }

  // === CHAPTER PAGES ===
  for (const chDef of CHAPTERS) {
    doc.addPage();
    const chData = chapters.find((c) => c.chapter_key === chDef.key);
    const text = chData?.editor_text || chData?.generated_text || 'Noch kein Inhalt vorhanden.';

    doc.setTextColor(24, 24, 27);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(chDef.title, margin, 30);

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, 34, pageWidth - margin, 34);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    addWrappedText(doc, text, margin, 42, contentWidth, 5);
  }

  // === ADD FOOTERS ===
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i - 1, totalPages - 1);
  }

  return doc;
}
