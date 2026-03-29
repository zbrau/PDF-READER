import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import PdfPage from './PdfPage';

// Asegurarse de tener el worker configurado globalmente
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer({ file, fileName, pageNumber, scale, isPdfInverted, isDrawingMode, onDocumentLoad }) {
  const [pdfDoc, setPdfDoc] = useState(null);

  useEffect(() => {
    let task = null;
    let isActive = true;
    
    const loadDoc = async () => {
      try {
        if (!file) return;
        setPdfDoc(null);
        const url = URL.createObjectURL(file);
        task = pdfjsLib.getDocument(url);
        const doc = await task.promise;
        if (isActive) {
          setPdfDoc(doc);
          if (onDocumentLoad) onDocumentLoad(doc.numPages, doc);
        }
      } catch (error) {
        if (error.message && error.message.includes('Worker was destroyed')) return;
        console.error("Error cargando PDF:", error);
      }
    };

    loadDoc();
    return () => {
      isActive = false;
      if (task) task.destroy();
    };
  }, [file, onDocumentLoad]);

  if (!pdfDoc) {
    return <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Cargando datos del libro...</div>;
  }

  return (
    <div className="pdf-viewport" style={{ width: '100%', height: '100%', overflow: 'auto', padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <PdfPage 
        pageNumber={pageNumber || 1} 
        pdfDoc={pdfDoc} 
        file={file} 
        fileName={fileName} 
        scale={scale} 
        isPdfInverted={isPdfInverted} 
        isDrawingMode={isDrawingMode} 
      />
    </div>
  );
}
