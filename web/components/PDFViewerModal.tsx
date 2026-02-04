"use client";

import { useState, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";

// Set up PDF.js worker - use unpkg with exact version match
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

export default function PDFViewerModal({
  isOpen,
  onClose,
  url,
  title,
}: PDFViewerModalProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setIsLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    setIsLoading(false);
    setError("Error al cargar el PDF. Intenta abrirlo en una nueva pestaña.");
    console.error("PDF load error:", error.message, error);
  }, []);

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || prev));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 2.5));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = () => {
    const fullUrl = url.startsWith("/")
      ? `${process.env.NEXT_PUBLIC_API_URL}${url}`
      : url;
    window.open(fullUrl, "_blank");
  };

  const handleClose = () => {
    setPageNumber(1);
    setScale(1);
    setIsLoading(true);
    setError(null);
    onClose();
  };

  const fullUrl = url.startsWith("/")
    ? `${process.env.NEXT_PUBLIC_API_URL}${url}`
    : url;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" showCloseButton={false}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200/50 bg-surface-100/50">
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="text-white font-medium truncate">
            {title || "Partitura"}
          </h3>
          {numPages && (
            <span className="text-xs text-gray-500 shrink-0">
              {numPages} {numPages === 1 ? "página" : "páginas"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Zoom controls */}
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
            title="Reducir"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-xs text-gray-500 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= 2.5}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
            title="Ampliar"
          >
            <ZoomIn size={18} />
          </button>

          <div className="w-px h-6 bg-surface-200/50 mx-2" />

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            title="Descargar"
          >
            <Download size={18} />
          </button>

          {/* Close */}
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-surface-200/30 flex items-center justify-center min-h-[60vh] max-h-[70vh]">
        {error ? (
          <div className="text-center p-8">
            <p className="text-red-400 mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-yellow text-brand-blue-primary font-medium rounded-lg hover:bg-brand-yellow/90 transition-colors"
              >
                <ExternalLink size={16} />
                Abrir en nueva pestaña
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-surface-100 text-white font-medium rounded-lg hover:bg-surface-100/80 transition-colors border border-surface-200"
              >
                <Download size={16} />
                Descargar
              </button>
            </div>
          </div>
        ) : (
          <Document
            file={fullUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex flex-col items-center justify-center p-8">
                <Loader2 size={32} className="text-brand-yellow animate-spin mb-3" />
                <p className="text-sm text-gray-400">Cargando PDF...</p>
              </div>
            }
            className="flex justify-center"
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={
                <div className="w-[595px] h-[842px] bg-surface-100 animate-pulse rounded-lg" />
              }
              className="shadow-2xl"
            />
          </Document>
        )}
      </div>

      {/* Pagination Footer */}
      {numPages && numPages > 1 && (
        <div className="flex items-center justify-center gap-4 px-4 py-3 border-t border-surface-200/50 bg-surface-100/50">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="text-sm text-gray-400">
            Página{" "}
            <span className="text-white font-medium">{pageNumber}</span>
            {" "}de{" "}
            <span className="text-white font-medium">{numPages}</span>
          </span>

          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </Modal>
  );
}
