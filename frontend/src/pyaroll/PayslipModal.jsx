// PayslipModal.jsx
import React, { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { X, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { getSalaryBreakdown, downloadPayslip } from '../api/payrollApi';
import SalaryBreakdown from './SalaryBreakdown';

/* ──────────────────────────────────────────────
   Focus trap
   ────────────────────────────────────────────── */
const FOCUSABLE =
    'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

const useFocusTrap = (ref, isOpen) => {
    useLayoutEffect(() => {
        if (!isOpen || !ref.current) return;
        const el = ref.current;
        const focusable = [...el.querySelectorAll(FOCUSABLE)];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        first?.focus();

        const handleTab = (e) => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last?.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first?.focus();
                }
            }
        };
        el.addEventListener('keydown', handleTab);
        return () => el.removeEventListener('keydown', handleTab);
    }, [isOpen, ref]);
};

/* ──────────────────────────────────────────────
   Skeleton loader
   ────────────────────────────────────────────── */
const PayslipSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
            <div className="h-px bg-gray-200 my-2" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        <div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="bg-gray-200 rounded h-[520px]" />
            <div className="h-10 bg-gray-200 rounded w-36 mt-3" />
        </div>
    </div>
);

/* ──────────────────────────────────────────────
   Error state
   ────────────────────────────────────────────── */
const ModalError = ({ error, onRetry, isRetrying }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <X className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-gray-700 font-medium mb-1">Failed to load payslip</p>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">{error}</p>
        <button
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying…' : 'Retry'}
        </button>
    </div>
);

/* ──────────────────────────────────────────────
   PDF preview panel
   ────────────────────────────────────────────── */
const PdfPanel = ({ pdfUrl, filename }) => {
    const [previewFailed, setPreviewFailed] = useState(false);

    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                PDF Preview
            </h3>

            {previewFailed ? (
                <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-8 text-center gap-3">
                    <p className="text-sm text-gray-500">
                        PDF preview not supported in this browser.
                    </p>
                    <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Download Instead
                    </button>
                </div>
            ) : (
                <iframe
                    src={pdfUrl}
                    title="Payslip PDF preview"
                    className="w-full rounded-lg border border-gray-200"
                    style={{ height: 520 }}
                    loading="lazy"
                    onError={() => setPreviewFailed(true)}
                />
            )}

            <div className="flex gap-2 mt-3">
                <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Download PDF
                </button>
                <button
                    onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <ExternalLink className="w-4 h-4" />
                    Open in Tab
                </button>
            </div>
        </div>
    );
};

/* ──────────────────────────────────────────────
   Main PayslipModal
   ────────────────────────────────────────────── */
const PayslipModal = ({ isOpen, onClose, payrollId, month, year }) => {
    const [breakdown, setBreakdown] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [pdfFilename, setPdfFilename] = useState('payslip.pdf');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isRetrying, setIsRetrying] = useState(false);

    const panelRef = useRef(null);
    const prevActiveEl = useRef(null);
    const objectUrlRef = useRef(null);
    const abortRef = useRef(null);
    const isMountedRef = useRef(true);

    useFocusTrap(panelRef, isOpen && !loading);

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
            abortRef.current?.abort();
        };
    }, []);

    // Scroll lock + focus management
    useEffect(() => {
        if (isOpen) {
            prevActiveEl.current = document.activeElement;
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            prevActiveEl.current?.focus();
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // ESC to close
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    // Core data fetcher
    const fetchData = useCallback(async () => {
        const numericId = Number(payrollId);
        if (isNaN(numericId) || numericId < 1) {
            setError('Invalid payroll ID');
            return;
        }

        abortRef.current?.abort();
        abortRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            const [breakdownData, pdfData] = await Promise.all([
                getSalaryBreakdown(numericId),
                downloadPayslip(numericId),
            ]);

            if (!isMountedRef.current) return;

            // getSalaryBreakdown already returns the inner payload
            setBreakdown(breakdownData);

            // Revoke previous blob URL
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
            const { blob, filename } = pdfData;
            const url = URL.createObjectURL(blob);
            objectUrlRef.current = url;
            setPdfUrl(url);
            setPdfFilename(filename);
        } catch (err) {
            if (err.name === 'AbortError' || !isMountedRef.current) return;
            setError(err.message || 'Failed to load payslip. Please try again.');
        } finally {
            if (isMountedRef.current) setLoading(false);
            abortRef.current = null;
        }
    }, [payrollId]);

    // Trigger fetch when modal opens
    useEffect(() => {
        if (isOpen && payrollId) {
            fetchData();
        } else {
            setBreakdown(null);
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
            setPdfUrl(null);
            setError(null);
        }
    }, [isOpen, payrollId, fetchData]);

    const handleRetry = async () => {
        setIsRetrying(true);
        await fetchData();
        setIsRetrying(false);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={`Payslip for ${month}/${year}`}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

            <div
                ref={panelRef}
                className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
                style={{ animation: 'modalIn 0.2s ease' }}
            >
                <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.97) translateY(8px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Payslip
                        </h2>
                        {month && year && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                {payrollId ? ` · Record #${payrollId}` : ''}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close modal"
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {loading ? (
                        <PayslipSkeleton />
                    ) : error ? (
                        <ModalError error={error} onRetry={handleRetry} isRetrying={isRetrying} />
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left — Salary Breakdown */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                                    Salary Breakdown
                                </h3>
                                <SalaryBreakdown breakdown={breakdown} />
                            </div>

                            {/* Right — PDF Preview */}
                            <div>
                                {pdfUrl ? (
                                    <PdfPanel pdfUrl={pdfUrl} filename={pdfFilename} />
                                ) : (
                                    <div className="flex items-center justify-center h-64 rounded-lg border border-dashed border-gray-300 text-gray-400 text-sm">
                                        PDF not available
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PayslipModal;