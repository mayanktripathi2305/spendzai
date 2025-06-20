import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToCSV = (data, fileName = 'transactions') => {
  if (!data || data.length === 0) {
    console.error("No data to export");
    return;
  }

  // Format date as plain string to avoid ###### in Excel
  const formattedData = data.map(item => ({
    ...item,
    date: typeof item.date === 'string' ? item.date : new Date(item.date).toISOString().split('T')[0]
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Add UTF-8 BOM for better Excel compatibility
  const csv = '\uFEFF' + XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}.csv`);
};
