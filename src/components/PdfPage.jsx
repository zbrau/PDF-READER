import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { get, set } from 'idb-keyval';

export default function PdfPage({ pdfDoc, file, fileName, pageNumber, scale, isPdfInverted, isDrawingMode }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const drawCanvasRef = useRef(null);
  
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  
  const isDrawing = useRef(false);
  const ctxRef = useRef(null);
  const [strokes, setStrokes] = useState([]);
  const ongoingStroke = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      // Cargamos apenas esté cerca de verse (600px)
      if (entry.isIntersecting) setIsVisible(true);
    }, { rootMargin: '800px 0px' });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let active = true;
    let renderTask = null;
    const renderPage = async () => {
      if (!isVisible || isRendered || !pdfDoc || !canvasRef.current) return;
      try {
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        containerRef.current.style.width = `${viewport.width}px`;
        containerRef.current.style.height = `${viewport.height}px`;

        const renderContext = { canvasContext: context, viewport };
        renderTask = page.render(renderContext);
        await renderTask.promise;
        if (!active) return;
        
        if (textLayerRef.current) {
          textLayerRef.current.innerHTML = '';
          textLayerRef.current.style.width = `${viewport.width}px`;
          textLayerRef.current.style.height = `${viewport.height}px`;
          const textContent = await page.getTextContent();
          pdfjsLib.renderTextLayer({ textContentSource: textContent, container: textLayerRef.current, viewport, textDivs: [] });
        }
        
        if (drawCanvasRef.current) {
          drawCanvasRef.current.width = viewport.width;
          drawCanvasRef.current.height = viewport.height;
          const drawCtx = drawCanvasRef.current.getContext('2d');
          drawCtx.lineCap = 'round';
          drawCtx.lineJoin = 'round';
          drawCtx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
          drawCtx.lineWidth = 14 * scale;
          ctxRef.current = drawCtx;

          const savedStrokes = await get(`strokes_${fileName}_${pageNumber}`);
          if (savedStrokes && active) {
            setStrokes(savedStrokes);
          }
        }
        setIsRendered(true);
      } catch(e) {}
    };

    renderPage();
    return () => { active = false; if (renderTask) renderTask.cancel(); };
  }, [isVisible, isRendered, pdfDoc, pageNumber, scale, fileName]);

  useEffect(() => {
    if (!ctxRef.current || !drawCanvasRef.current || !isRendered) return;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, drawCanvasRef.current.width, drawCanvasRef.current.height);
    strokes.forEach(stroke => {
      if (stroke.points.length === 0) return;
      ctx.beginPath();
      const startX = stroke.points[0].x * drawCanvasRef.current.width;
      const startY = stroke.points[0].y * drawCanvasRef.current.height;
      ctx.moveTo(startX, startY);
      stroke.points.forEach(p => {
        ctx.lineTo(p.x * drawCanvasRef.current.width, p.y * drawCanvasRef.current.height);
      });
      ctx.stroke();
    });
  }, [strokes, scale, isRendered]);

  const saveStrokes = async (newStrokes) => {
    setStrokes(newStrokes);
    await set(`strokes_${fileName}_${pageNumber}`, newStrokes);
  };

  const undoDraw = () => {
    if (strokes.length > 0) saveStrokes(strokes.slice(0, -1));
  };

  useEffect(() => {
    const handleGlobalUndo = () => undoDraw();
    const btn = document.getElementById('global-undo-btn');
    if (btn && isVisible) btn.addEventListener('click', handleGlobalUndo);
    return () => { if (btn) btn.removeEventListener('click', handleGlobalUndo); }
  }, [strokes, isVisible]);

  const getPos = (e) => {
    const rect = drawCanvasRef.current.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
  };

  const startDraw = (e) => {
    if (!isDrawingMode || !ctxRef.current) return;
    isDrawing.current = true;
    const pos = getPos(e);
    ongoingStroke.current = [pos];
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(pos.x * drawCanvasRef.current.width, pos.y * drawCanvasRef.current.height);
  };

  const draw = (e) => {
    if (!isDrawing.current || !ctxRef.current) return;
    const pos = getPos(e);
    ongoingStroke.current.push(pos);
    ctxRef.current.lineTo(pos.x * drawCanvasRef.current.width, pos.y * drawCanvasRef.current.height);
    ctxRef.current.stroke();
  };

  const endDraw = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      saveStrokes([...strokes, { points: ongoingStroke.current }]);
    }
  };

  return (
    <div 
      className="pdf-page-wrapper"
      data-page={pageNumber}
      style={{ display: 'flex', justifyContent: 'center', width: 'fit-content', margin: '0 auto' }}
    >
      <div 
        ref={containerRef} 
        className="pdf-page-container" 
        style={{ 
          position: 'relative', 
          backgroundColor: 'white', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          filter: isPdfInverted ? 'invert(1) hue-rotate(180deg)' : 'none'
        }}
      >
        <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto' }} />
        <div ref={textLayerRef} className="textLayer" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <canvas 
          ref={drawCanvasRef}
          style={{ 
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            pointerEvents: isDrawingMode ? 'auto' : 'none',
            cursor: isDrawingMode ? 'crosshair' : 'default',
            mixBlendMode: 'multiply'
          }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
        />
      </div>
    </div>
  );
}
