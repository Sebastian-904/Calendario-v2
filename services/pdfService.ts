
import type { Company, CalendarEvent, User } from '../types';
import { fmtDate } from '../utils/helpers';

interface ExportPdfParams {
  company: Company;
  events: CalendarEvent[];
  users: User[];
  title?: string;
}

export async function exportReportPDF({
  company,
  events,
  users,
  title = "Compliance Report",
}: ExportPdfParams) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const margin = 14;
  let y = 16;

  doc.setFontSize(14);
  doc.setTextColor(24, 24, 27); // zinc-900
  doc.text(title, margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(113, 113, 122); // zinc-500
  doc.text(`Company: ${company.name} (${company.country})`, margin, y);
  y += 6;
  if (company.rfc) {
    doc.text(`Tax ID: ${company.rfc}`, margin, y);
    y += 6;
  }
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  y += 10;
  
  doc.setDrawColor(228, 228, 231); // zinc-200
  doc.line(margin, y, 210 - margin, y);
  y += 8;

  doc.setFontSize(11);
  doc.setTextColor(24, 24, 27);
  doc.text("Tasks / Events:", margin, y);
  y += 6;

  doc.setFontSize(9);
  events.slice(0, 120).forEach((e, i) => {
    const u = users.find((user) => user.id === e.assignee);
    const line = `${i + 1}. [${e.category}] ${e.title} – ${fmtDate(e.date)} – Resp.: ${u?.name || "-"} – Status: ${e.status}`;
    const split = doc.splitTextToSize(line, 180);
    if (y > 280) {
      doc.addPage();
      y = 16;
    }
    doc.setTextColor(82, 82, 91); // zinc-600
    doc.text(split, margin, y);
    y += 5 + Math.max(0, split.length - 1) * 4;
  });

  doc.save(`${company.name.replace(/\s+/g, '_')}_report.pdf`);
}
