import React, { useEffect, useRef, useState } from 'react';
import { Layers } from 'lucide-react';

function Thumbnail({ pdfDoc, pageNumber, scale, isActive, onClick }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '300px' });
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let renderTask = null;
    let active = true;
    const renderPage = async () => {
      if (!isVisible || !pdfDoc || !canvasRef.current) return;
      try {
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = { canvasContext: context, viewport: viewport };
        renderTask = page.render(renderContext);
        if (active) await renderTask.promise;
      } catch (err) {}
    };
    renderPage();
    return () => {
      active = false;
      if (renderTask) renderTask.cancel();
    };
  }, [isVisible, pdfDoc, pageNumber, scale]);

  return (
    <div 
      ref={wrapperRef} 
      className={`thumbnail-wrapper ${isActive ? 'active' : ''}`} 
      onClick={onClick}
      title={`Ir a la página ${pageNumber}`}
    >
      {isVisible ? <canvas ref={canvasRef} className="thumbnail-canvas" /> : <div className="thumbnail-placeholder" />}
      <span className="thumbnail-page-number">{pageNumber}</span>
    </div>
  );
}

export default function ThumbnailPanel({ pdfDoc, numPages, currentPage, onPageSelect }) {
  const pages = Array.from({ length: numPages }, (_, i) => i + 1);

  return (
    <div className="thumbnails-sidebar">
      <div className="notes-header">
        <Layers size={20} color="var(--accent)" />
        <h2>Índice</h2>
      </div>
      <div className="thumbnails-content">
        {!pdfDoc ? (
          <div style={{textAlign: 'center', marginTop: 30, color: 'var(--text-secondary)'}}>
            Cargando páginas...
          </div>
        ) : (
          pages.map(page => (
            <Thumbnail 
              key={page}
              pdfDoc={pdfDoc}
              pageNumber={page}
              scale={0.2}
              isActive={page === currentPage}
              onClick={() => onPageSelect(page)}
            />
          ))
        )}
      </div>
    </div>
  );
}
