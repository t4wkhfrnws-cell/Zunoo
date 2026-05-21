import { jsPDF } from 'jspdf';
import type { ChatResponse, StructuredSection } from '../types';

// Generates a downloadable, shareable PDF report from a chatbot answer
// (PRD §3 — "Downloadable/shareable PDF report").

const MARGIN = 56;
const PAGE_W = 612;
const PAGE_H = 792;
const CONTENT_W = PAGE_W - MARGIN * 2;
const TEAL: [number, number, number] = [14, 124, 134];
const INK = 45;
const MUTED = 120;

export function generateReportPdf(response: ChatResponse): void {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  let y = MARGIN;
  let page = 1;

  const footer = (): void => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.text(
      'Zuuno — educational reference only. Not a substitute for professional medical advice.',
      MARGIN,
      PAGE_H - 32,
    );
    doc.text(`Page ${page}`, PAGE_W - MARGIN, PAGE_H - 32, { align: 'right' });
  };

  const newPage = (): void => {
    footer();
    doc.addPage();
    page += 1;
    y = MARGIN;
  };

  const ensure = (space: number): void => {
    if (y + space > PAGE_H - 60) newPage();
  };

  const heading = (text: string): void => {
    ensure(40);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
    doc.text(text, MARGIN, y);
    y += 8;
    doc.setDrawColor(214);
    doc.setLineWidth(0.8);
    doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
    y += 16;
  };

  const paragraph = (
    text: string,
    opts: { size?: number; color?: number; bold?: boolean; indent?: number } = {},
  ): void => {
    const size = opts.size ?? 10.5;
    const indent = opts.indent ?? 0;
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(opts.color ?? INK);
    const lines = doc.splitTextToSize(text, CONTENT_W - indent) as string[];
    const lineH = size * 1.42;
    for (const line of lines) {
      ensure(lineH);
      doc.text(line, MARGIN + indent, y);
      y += lineH;
    }
  };

  const bullet = (text: string): void => {
    const size = 10.5;
    const lineH = size * 1.42;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, CONTENT_W - 18) as string[];
    lines.forEach((line, i) => {
      ensure(lineH);
      if (i === 0) {
        doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
        doc.text('•', MARGIN + 2, y);
      }
      doc.setTextColor(INK);
      doc.text(line, MARGIN + 18, y);
      y += lineH;
    });
    y += 2;
  };

  // ---- Title block ----
  doc.setFillColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.rect(0, 0, PAGE_W, 96, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('Zuuno Medical Report', MARGIN, 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(
    response.conditionName
      ? `${response.conditionName}${response.icd10 ? `  ·  ICD-10 ${response.icd10}` : ''}`
      : 'Clinical reference summary',
    MARGIN,
    72,
  );
  y = 124;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(MUTED);
  const generated = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(
    `Generated ${generated}  ·  Confidence ${Math.round(response.confidence * 100)}%`,
    MARGIN,
    y,
  );
  y += 22;

  // ---- Summary ----
  heading('Summary');
  paragraph(response.summary);

  // ---- Structured sections ----
  for (const section of response.sections) {
    writeSection(section, heading, paragraph, bullet);
  }

  // ---- Citations ----
  if (response.citations.length > 0) {
    heading('Citations');
    response.citations.forEach((c, i) => {
      const label = `[${i + 1}] ${c.reference}`;
      paragraph(label, { bold: true, size: 9.5 });
      const meta = [c.detail, c.year ? String(c.year) : '', c.type].filter(Boolean).join('  ·  ');
      if (meta) paragraph(meta, { size: 9, color: MUTED, indent: 12 });
      if (i < response.citations.length - 1) y += 4;
    });
  }

  // ---- Disclaimer ----
  y += 8;
  ensure(60);
  doc.setFillColor(245, 247, 248);
  const boxLines = doc.splitTextToSize(
    `Disclaimer: ${response.disclaimer} Zuuno provides educational reference information and does not diagnose conditions or prescribe treatment.`,
    CONTENT_W - 24,
  ) as string[];
  const boxH = boxLines.length * 12 + 24;
  ensure(boxH);
  doc.roundedRect(MARGIN, y, CONTENT_W, boxH, 6, 6, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90);
  let by = y + 16;
  for (const line of boxLines) {
    doc.text(line, MARGIN + 12, by);
    by += 12;
  }
  y += boxH;

  footer();

  const safeName = (response.conditionName ?? 'report')
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase();
  doc.save(`zuuno-${safeName}.pdf`);
}

function writeSection(
  section: StructuredSection,
  heading: (t: string) => void,
  paragraph: (t: string, o?: { size?: number; color?: number; bold?: boolean; indent?: number }) => void,
  bullet: (t: string) => void,
): void {
  heading(section.title);

  if (section.kind === 'bullets' && section.bullets) {
    section.bullets.forEach(bullet);
    return;
  }
  if (section.kind === 'text' && section.text) {
    paragraph(section.text);
    return;
  }
  if (section.kind === 'medications' && section.medications) {
    const m = section.medications;
    paragraph('First-line', { bold: true, color: 14, size: 10.5 });
    m.firstLine.forEach(bullet);
    paragraph('Second-line', { bold: true, size: 10.5 });
    m.secondLine.forEach(bullet);
    paragraph('Monitoring', { bold: true, size: 10.5 });
    m.monitoring.forEach(bullet);
    return;
  }
  if (section.kind === 'diagram' && section.diagram) {
    paragraph(section.diagram.overview);
    section.diagram.steps.forEach((step, i) => {
      bullet(`${i + 1}. ${step.label} — ${step.detail}`);
    });
  }
}
