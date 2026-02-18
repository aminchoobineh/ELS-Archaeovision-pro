import React from 'react';

interface Props {
  report: any;
  format?: 'json' | 'csv';
}

export const ExportButton: React.FC<Props> = ({ report, format = 'json' }) => {
  const handleExport = () => {
    const data = format === 'json' ? JSON.stringify(report, null, 2) : convertToCSV(report);
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (obj: any) => {
    // تبدیل ساده به CSV
    return 'نوع,احتمال\n' + 
      `سازه,${obj.analysis?.subsurface_structures?.probability}\n` +
      `حفره,${obj.analysis?.cavities?.probability}\n` +
      `فلز,${obj.analysis?.metals?.probability}`;
  };

  return (
    <button
      onClick={handleExport}
      className="bg-amber-700 text-white px-3 py-1 rounded text-sm hover:bg-amber-800"
    >
      📥 خروجی {format.toUpperCase()}
    </button>
  );
};