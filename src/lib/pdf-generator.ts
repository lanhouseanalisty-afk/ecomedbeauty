import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PDFOptions {
    title: string;
    subtitle?: string;
    filename?: string;
    orientation?: 'portrait' | 'landscape';
}

interface TableColumn {
    header: string;
    dataKey: string;
}

export const generatePDF = (
    data: any[],
    columns: TableColumn[],
    options: PDFOptions
) => {
    const doc = new jsPDF({
        orientation: options.orientation || 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const primaryColor = [0, 51, 102]; // #003366 - Ecomed Blue (Example)

    // Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, doc.internal.pageSize.width, 20, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('EcomedBeauty', 14, 13);

    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.text(options.title, 14, 35);

    // Subtitle
    if (options.subtitle) {
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(options.subtitle, 14, 42);
    }

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const dateStr = format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    doc.text(`Gerado em: ${dateStr}`, doc.internal.pageSize.width - 14, 35, { align: 'right' });

    // Table
    const tableBody = data.map(item =>
        columns.map(col => {
            const val = item[col.dataKey];
            // Handle objects/arrays basic stringification if needed, or nulls
            if (val === null || val === undefined) return '';
            if (typeof val === 'object') return JSON.stringify(val);
            return String(val);
        })
    );

    const tableHead = [columns.map(col => col.header)];

    autoTable(doc, {
        head: tableHead,
        body: tableBody,
        startY: options.subtitle ? 50 : 45,
        theme: 'grid',
        headStyles: {
            fillColor: [0, 51, 102],
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 9,
            cellPadding: 3
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240]
        },
        didDrawPage: (data) => {
            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Página ${pageCount}`,
                data.settings.margin.left,
                doc.internal.pageSize.height - 10
            );
            doc.text(
                'EcomedBeauty - Sistema Interno',
                doc.internal.pageSize.width - data.settings.margin.right,
                doc.internal.pageSize.height - 10,
                { align: 'right' }
            );
        }
    });

    // Save
    const filename = options.filename || 'relatorio.pdf';
    doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
};
