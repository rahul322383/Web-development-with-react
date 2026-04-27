// src/components/reports/ExportButtons.jsx
import React, { useState } from 'react';
import { FileText, Download, Loader2, FileSpreadsheet, FileType } from 'lucide-react';
import reportsAPI from '../api/reports.api';
import { toast } from 'sonner';

const ExportButtons = ({ module, from, to }) => {
    const [exporting, setExporting] = useState(null);

    const downloadBlob = (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const handleExport = async (format) => {
        if (!from || !to) {
            toast.error('Please select a date range first');
            return;
        }

        setExporting(format);
        try {
            const apiMethod = format === 'csv' ? reportsAPI.exportCSV : reportsAPI.exportPDF;
            const response = await apiMethod(module, { from, to });

            const filename = `${module}-report-${from}_to_${to}.${format}`;
            downloadBlob(response.data, filename);

            toast.success(`${format.toUpperCase()} exported successfully`, {
                icon: format === 'csv' ? '📊' : '📄',
            });
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to export ${format.toUpperCase()}`);
        } finally {
            setExporting(null);
        }
    };

    return (
        <div className="flex flex-col xs:flex-row gap-2">
            {/* CSV Button */}
            <button
                onClick={() => handleExport('csv')}
                disabled={exporting !== null}
                className={`
          group relative flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium
          rounded-xl border transition-all duration-200
          ${exporting === 'csv'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                        : 'bg-white dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-300 hover:shadow-sm'
                    }
          disabled:opacity-60 disabled:cursor-not-allowed
        `}
            >
                {exporting === 'csv' ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Exporting...</span>
                    </>
                ) : (
                    <>
                        <FileSpreadsheet className="w-4 h-4 transition-transform group-hover:scale-110" />
                        <span className="hidden xs:inline">Export CSV</span>
                        <span className="xs:hidden">CSV</span>
                    </>
                )}

                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 to-green-500/0 group-hover:from-emerald-500/5 group-hover:to-green-500/5 transition-all duration-300 pointer-events-none" />
            </button>

            {/* PDF Button */}
            <button
                onClick={() => handleExport('pdf')}
                disabled={exporting !== null}
                className={`
          group relative flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium
          rounded-xl border transition-all duration-200
          ${exporting === 'pdf'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
                        : 'bg-white dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 hover:text-red-700 dark:hover:text-red-300 hover:shadow-sm'
                    }
          disabled:opacity-60 disabled:cursor-not-allowed
        `}
            >
                {exporting === 'pdf' ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Exporting...</span>
                    </>
                ) : (
                    <>
                        <FileType className="w-4 h-4 transition-transform group-hover:scale-110" />
                        <span className="hidden xs:inline">Export PDF</span>
                        <span className="xs:hidden">PDF</span>
                    </>
                )}

                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/0 to-rose-500/0 group-hover:from-red-500/5 group-hover:to-rose-500/5 transition-all duration-300 pointer-events-none" />
            </button>
        </div>
    );
};

export default ExportButtons;