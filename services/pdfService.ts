
import type { Company, CalendarEvent, User, Categories } from '../types';
import { fmtDate } from '../utils/helpers';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PdfTranslations {
  [key: string]: string;
}

interface ExportPdfParams {
  company: Company;
  events: CalendarEvent[];
  users: User[];
  categories: Categories;
  title?: string;
  translations: PdfTranslations;
  locale: 'en-US' | 'es-MX';
}

const appLogoBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwYWM1M2UiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTIgMjJzOC00IDgtMTBWMWMwIDAgLTMuNSAxLjUtOCAxLjVTNCAxIDQgMXYxMWMwIDYgOCAxMCA4IDEweiIvPjwvc3ZnPg==";


export async function exportReportPDF({
  company,
  events,
  users,
  categories,
  title = "Compliance Report",
  translations,
  locale
}: ExportPdfParams) {
  
  const doc = new jsPDF();
  const margin = 14;

  const tableBody = events.map(event => {
    const assignee = users.find(u => u.id === event.assignee)?.name || '-';
    return [
        event.title,
        fmtDate(event.date, locale),
        categories[event.category]?.label || event.category,
        translations[`priority_${event.priority.toLowerCase()}`] || event.priority,
        assignee,
        translations[`status_${event.status.replace(' ', '_').toLowerCase()}`] || event.status,
    ];
  });
  
  const tableHeaders = [
    translations.col_title,
    translations.col_date,
    translations.col_category,
    translations.col_priority,
    translations.col_assignee,
    translations.col_status,
  ];

  autoTable(doc, {
    head: [tableHeaders],
    body: tableBody,
    startY: 45,
    margin: { top: 45 },
    theme: 'grid',
    headStyles: {
        fillColor: [39, 39, 42], // zinc-800
        textColor: [250, 250, 250]
    },
    didDrawPage: (data) => {
        // Header
        const logo = company.logoUrl || appLogoBase64;
        const imageType = company.logoUrl?.split(';')[0].split('/')[1].toUpperCase() || 'SVG';
        doc.addImage(logo, imageType, margin, 12, 10, 10);
        doc.setFontSize(16);
        doc.setTextColor(24, 24, 27); // zinc-900
        doc.text(title, margin + 14, 18);

        doc.setFontSize(10);
        doc.setTextColor(113, 113, 122); // zinc-500
        doc.text(`${translations.company_label}: ${company.name} (${company.country})`, margin, 30);
        if (company.rfc) {
            doc.text(`${translations.tax_id_label}: ${company.rfc}`, margin, 35);
        }

        // Footer
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(161, 161, 170); // zinc-400
        doc.text(`${translations.generated_label}: ${new Date().toLocaleString(locale)}`, margin, doc.internal.pageSize.height - 10);
        doc.text(`${translations.page_label} ${data.pageNumber} / ${pageCount}`, doc.internal.pageSize.width - margin, doc.internal.pageSize.height - 10, { align: 'right' });
    }
  });

  doc.save(`${company.name.replace(/\s+/g, '_')}_report.pdf`);
}
