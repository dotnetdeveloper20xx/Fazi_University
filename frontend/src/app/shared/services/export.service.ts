import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  /**
   * Export data to Excel file
   */
  exportToExcel<T>(data: T[], columns: ExportColumn[], filename: string): void {
    // Map data to export format
    const exportData = data.map(item => {
      const row: Record<string, any> = {};
      columns.forEach(col => {
        row[col.header] = this.getNestedValue(item, col.key);
      });
      return row;
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const columnWidths = columns.map(col => ({ wch: col.width || 15 }));
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Save file
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}_${this.getDateStamp()}.xlsx`);
  }

  /**
   * Export data to CSV file
   */
  exportToCsv<T>(data: T[], columns: ExportColumn[], filename: string): void {
    // Create CSV content
    const headers = columns.map(col => col.header).join(',');
    const rows = data.map(item => {
      return columns.map(col => {
        const value = this.getNestedValue(item, col.key);
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${filename}_${this.getDateStamp()}.csv`);
  }

  /**
   * Export data to PDF (simple table format)
   */
  exportToPdf<T>(data: T[], columns: ExportColumn[], filename: string, title: string): void {
    // Create printable HTML
    const html = this.generatePrintableHtml(data, columns, title);

    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }

  private generatePrintableHtml<T>(data: T[], columns: ExportColumn[], title: string): string {
    const tableRows = data.map(item => {
      const cells = columns.map(col => {
        const value = this.getNestedValue(item, col.key);
        return `<td style="border: 1px solid #ddd; padding: 8px;">${value ?? ''}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const tableHeaders = columns.map(col =>
      `<th style="border: 1px solid #ddd; padding: 8px; background-color: #3B82F6; color: white;">${col.header}</th>`
    ).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1E3A8A; margin-bottom: 20px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { text-align: left; }
          tr:nth-child(even) { background-color: #f8f9fa; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <table>
          <thead><tr>${tableHeaders}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
        <div class="footer">
          <p>UniverSys Lite - University Management System</p>
          <p>Total Records: ${data.length}</p>
        </div>
      </body>
      </html>
    `;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private getDateStamp(): string {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  }
}
