import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Moon, Sun, ArrowLeft, Clock, PenTool, Image as ImageIcon, Trash2, List, StickyNote as StickyIcon, Maximize, Undo, Volume2, VolumeX, Tag, Download, UploadCloud } from 'lucide-react';
import PdfViewer from './components/PdfViewer';
import NotesPanel from './components/NotesPanel';
import ThumbnailPanel from './components/ThumbnailPanel';
import { loadPdfData, savePdfProgress, savePdfNote, deletePdfNote, saveRecentFile, getRecentFiles, deleteRecentFile, updateRecentFileTags, exportLibraryMetadata, importLibraryMetadata } from './utils/storage';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [notes, setNotes] = useState([]);
  const [isPdfInverted, setIsPdfInverted] = useState(false);
  const [recentFiles, setRecentFiles] = useState([]);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selection, setSelection] = useState({ text: '', x: 0, y: 0 });
  
  // Layout toggles
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [filterTag, setFilterTag] = useState('');
  
  const throttleRef = useRef(null);

  useEffect(() => {
    getRecentFiles().then(async (files) => {
      if (files.length === 0) {
        try {
          const res = await fetch('/Eticaparaamador.pdf');
          const blob = await res.blob();
          const defaultFile = new File([blob], "Etica para Amador.pdf", { type: 'application/pdf' });
          await saveRecentFile(defaultFile);
          const updated = await getRecentFiles();
          setRecentFiles(updated);
        } catch(e) {
          console.error(e);
          setRecentFiles([]);
        }
      } else {
        setRecentFiles(files);
      }
    });
  }, []);

  useEffect(() => {
    const handleMouseUp = (e) => {
      const text = window.getSelection().toString().trim();
      if (text) {
        setSelection({ text, x: e.clientX, y: e.clientY });
      } else {
        setSelection({ text: '', x: 0, y: 0 });
      }
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleDocumentLoad = useCallback((pages, doc) => {
    setNumPages(pages);
    setPdfDoc(doc);
  }, []);

  const loadFileToState = (uploadedFile) => {
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
      setFileName(uploadedFile.name);
      
      const savedData = loadPdfData(uploadedFile.name);
      setPageNumber(savedData.lastPage || 1);
      setNotes(savedData.notes || []);
      setScale(1.0);
      setIsPdfInverted(false);

      saveRecentFile(uploadedFile).then(() => getRecentFiles().then(setRecentFiles));
    }
  };

  const handleFileUpload = (event) => {
    if (event.target && event.target.files && event.target.files.length > 0) {
      loadFileToState(event.target.files[0]);
    }
  };

  const openRecent = (rf) => {
    if (rf.file) {
      loadFileToState(rf.file);
    } else {
      alert(`Tu progreso y notas de "${rf.name}" están seguros. Para reanudar la lectura, por favor usa el botón "Agregar PDF" y elige el archivo original de tu dispositivo.`);
    }
  };

  const handleExport = async () => {
    const json = await exportLibraryMetadata();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PdfReader_Backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e) => {
    const impFile = e.target.files[0];
    if (!impFile) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const success = await importLibraryMetadata(event.target.result);
      if (success) {
        alert("¡Datos restaurados con éxito! Ahora puedes ver el progreso de tus PDFs.");
        const updated = await getRecentFiles();
        setRecentFiles(updated);
      } else {
        alert("Hubo un error al leer el archivo de respaldo.");
      }
    };
    reader.readAsText(impFile);
  };

  const handleCoverChange = async (event, rf) => {
    event.stopPropagation();
    const fileCover = event.target.files[0];
    if (fileCover && fileCover.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result;
        await saveRecentFile(rf.file, base64);
        const updated = await getRecentFiles();
        setRecentFiles(updated);
      };
      reader.readAsDataURL(fileCover);
    }
  };

  const handleDelete = async (event, rf) => {
    event.stopPropagation();
    if (window.confirm("¿Seguro que deseas quitar este PDF de tu biblioteca?")) {
      await deleteRecentFile(rf.name);
      const updated = await getRecentFiles();
      setRecentFiles(updated);
    }
  };

  const handleEditTags = async (event, rf) => {
    event.stopPropagation();
    const currentTags = rf.tags ? rf.tags.join(', ') : '';
    const newTags = window.prompt("Ingresa las etiquetas separadas por coma (ej: Escuela, Tareas):", currentTags);
    if (newTags !== null) {
      const tagsArray = newTags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      await updateRecentFileTags(rf.name, tagsArray);
      const updated = await getRecentFiles();
      setRecentFiles(updated);
    }
  };

  // Old page functions removed

  const handleAddNote = (text) => {
    const newNote = savePdfNote(fileName, pageNumber, text);
    setNotes(prev => [...prev, newNote]);
  };

  const handleDeleteNote = (noteId) => {
    deletePdfNote(fileName, noteId);
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const allTags = Array.from(new Set(recentFiles.flatMap(rf => rf.tags || [])));
  const displayedFiles = filterTag ? recentFiles.filter(rf => rf.tags && rf.tags.includes(filterTag)) : recentFiles;

  if (!file) {
    return (
      <div className="app-container" style={{ display: 'block', overflowY: 'auto' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', marginBottom: 8 }}>Mi Biblioteca</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Tus libros y documentos PDF guardados localmente.</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <label className="upload-button" title="Importar Backup" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                <UploadCloud size={20} />
                Restaurar Datos
                <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
              </label>
              <button 
                onClick={handleExport} 
                className="upload-button" 
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer' }}
                title="Descargar Backup"
              >
                <Download size={20} />
                Respaldar Datos
              </button>
              <label className="upload-button">
                <Upload size={20} />
                Agregar PDF
                <input 
                  type="file" 
                  accept="application/pdf" 
                  style={{ display: 'none' }} 
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          {allTags.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
              <button 
                onClick={() => setFilterTag('')} 
                style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid var(--border)', background: filterTag === '' ? 'var(--accent)' : 'var(--bg-tertiary)', color: filterTag === '' ? 'white' : 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500 }}
              >
                Todos
              </button>
              {allTags.map(tag => (
                <button 
                  key={tag} 
                  onClick={() => setFilterTag(tag)}
                  style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid var(--border)', background: filterTag === tag ? 'var(--accent)' : 'var(--bg-tertiary)', color: filterTag === tag ? 'white' : 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500 }}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {displayedFiles.length > 0 ? (
            <div className="library-grid">
              {displayedFiles.map(rf => {
                const savedState = loadPdfData(rf.name);
                return (
                  <div key={rf.name} className="library-card" onClick={() => openRecent(rf)}>
                    <div className="library-card-cover" style={{ backgroundImage: rf.customCover ? `url(${rf.customCover})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                      {!rf.customCover && <span style={{ fontSize: '4rem' }}>📄</span>}
                      
                      <div className="card-actions" onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
                        <button className="icon-btn-small" onClick={(e) => handleEditTags(e, rf)} title="Añadir Etiquetas">
                          <Tag size={16} />
                        </button>
                        <label className="icon-btn-small" title="Cambiar portada">
                          <ImageIcon size={16} />
                          <input type="file" accept="image/*" style={{display: 'none'}} onChange={(e) => handleCoverChange(e, rf)} />
                        </label>
                        <button className="icon-btn-small delete" onClick={(e) => handleDelete(e, rf)} title="Quitar de la biblioteca">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="library-card-info">
                      <h3 title={rf.name}>{rf.name}</h3>
                      <p>Página {savedState.lastPage || 1} {savedState.notes?.length > 0 ? `• ${savedState.notes.length} nota(s)` : ''}</p>
                      {rf.tags && rf.tags.length > 0 && (
                        <div style={{display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap'}}>
                          {rf.tags.map(t => <span key={t} style={{fontSize: '0.7rem', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--border)', color: 'var(--text-primary)'}}>{t}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)', border: '2px dashed var(--border)', borderRadius: 16 }}>
              <Upload size={48} style={{ marginBottom: 16, opacity: 0.5, margin: '0 auto' }} />
              <h2 style={{ fontSize: '1.2rem', marginBottom: 8, color: 'var(--text-primary)' }}>Tu biblioteca está vacía</h2>
              <p>Agrega tu primer archivo PDF para comenzar a leer.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const closeFile = () => {
    setFile(null);
    setFileName('');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const handleTTS = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const pageEl = document.querySelector(`[data-page="${pageNumber}"] .textLayer`);
      if (pageEl) {
        const text = pageEl.innerText || pageEl.textContent;
        if (text && text.trim()) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'es-ES';
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = (e) => { console.error("TTS Error", e); setIsSpeaking(false); };
          window.speechSynthesis.speak(utterance);
          setIsSpeaking(true);
        } else {
          alert('¡Ups! No pude extraer el texto de esta página. Puede que sea una imagen o esté protegida.');
        }
      } else {
        alert('Por favor, asegúrate que la página actual cargue completamente antes de intentar leerla.');
      }
    }
  };

  const scrollToPage = (page) => {
    const newPage = Math.min(Math.max(1, page), numPages);
    setPageNumber(newPage);
    savePdfProgress(fileName, newPage);
  };

  const handleWheel = (e) => {
    if (e.ctrlKey) return; 
    if (throttleRef.current) return;

    if (e.deltaY > 40) {
      if (pageNumber < numPages) {
        scrollToPage(pageNumber + 1);
        throttleRef.current = setTimeout(() => throttleRef.current = null, 400);
      }
    } else if (e.deltaY < -40) {
      if (pageNumber > 1) {
        scrollToPage(pageNumber - 1);
        throttleRef.current = setTimeout(() => throttleRef.current = null, 400);
      }
    }
  };

  return (
    <div className="app-container">
      {showThumbnails && (
        <ThumbnailPanel 
          pdfDoc={pdfDoc}
          numPages={numPages}
          currentPage={pageNumber}
          onPageSelect={scrollToPage}
        />
      )}
      <div className="pdf-main-area" onWheel={handleWheel}>
        <div className="pdf-toolbar">
          <div className="toolbar-group">
            <button className="icon-btn" onClick={closeFile} title="Cerrar y volver a la biblioteca" style={{marginRight: 12}}>
              <ArrowLeft size={20} />
            </button>
            <button 
              className="icon-btn" 
              onClick={() => setShowThumbnails(!showThumbnails)} 
              title="Mostrar/Ocultar Índice Nav."
              style={{ color: showThumbnails ? 'var(--accent)' : 'var(--text-secondary)' }}
            >
              <List size={20} />
            </button>
            <h2 style={{fontSize: '1rem', fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
              {fileName}
            </h2>
          </div>
          
          <div className="toolbar-group">
            <button className="icon-btn" onClick={() => scrollToPage(pageNumber - 1)} disabled={pageNumber <= 1}>
              <ChevronLeft size={20} />
            </button>
            <span className="page-indicator">
              Pág. {pageNumber}
            </span>
            <button className="icon-btn" onClick={() => scrollToPage(pageNumber + 1)} disabled={pageNumber >= numPages}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="toolbar-group">
            <button className="icon-btn" onClick={() => setScale(s => Math.max(0.5, s - 0.2))}>
              <ZoomOut size={20} />
            </button>
            <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)', minWidth: 40, textAlign: 'center'}}>
              {Math.round(scale * 100)}%
            </span>
            <button className="icon-btn" onClick={() => setScale(s => Math.min(3, s + 0.2))}>
              <ZoomIn size={20} />
            </button>
          </div>

          <div className="toolbar-group">
            {isDrawingMode && (
              <button id="global-undo-btn" className="icon-btn" title="Deshacer trazo" style={{ color: 'var(--accent)' }}>
                <Undo size={20} />
              </button>
            )}
            <button 
              className="icon-btn" 
              onClick={() => setIsDrawingMode(prev => !prev)} 
              title="Resaltador libre"
              style={{ color: isDrawingMode ? 'var(--accent)' : 'var(--text-secondary)' }}
            >
              <PenTool size={20} />
            </button>
            <button className="icon-btn" onClick={handleTTS} title="Leer Página (Voz)">
              {isSpeaking ? <VolumeX size={20} color="var(--danger)" /> : <Volume2 size={20} />}
            </button>
            <button className="icon-btn" onClick={toggleFullscreen} title="Pantalla Completa">
              <Maximize size={20} />
            </button>
            <button className="icon-btn" onClick={() => setIsPdfInverted(prev => !prev)} title="Modo Oscuro del PDF">
              {isPdfInverted ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              className="icon-btn" 
              onClick={() => setShowNotes(!showNotes)} 
              title="Mostrar/Ocultar Notas"
              style={{ color: showNotes ? 'var(--accent)' : 'var(--text-secondary)' }}
            >
              <StickyIcon size={20} />
            </button>
          </div>
        </div>

        <PdfViewer 
          file={file} 
          fileName={fileName}
          pageNumber={pageNumber}
          scale={scale} 
          isPdfInverted={isPdfInverted}
          isDrawingMode={isDrawingMode}
          onDocumentLoad={handleDocumentLoad}
        />
      </div>

      {showNotes && (
        <NotesPanel 
          notes={notes}
          currentPage={pageNumber}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
        />
      )}

      {selection.text && (
        <a 
          href={`https://translate.google.com/?sl=auto&tl=es&text=${encodeURIComponent(selection.text)}&op=translate`} 
          target="_blank" 
          rel="noreferrer"
          className="translator-bubble"
          style={{
            position: 'fixed', top: selection.y - 40, left: selection.x,
            background: 'var(--accent)', color: 'white', padding: '8px 16px',
            borderRadius: 20, textDecoration: 'none', fontSize: 13, fontWeight: 'bold', zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)', pointerEvents: 'auto'
          }}
          onClick={() => setSelection({ text: '', x: 0, y: 0 })}
        >
          Traducir esto
        </a>
      )}
    </div>
  );
}

export default App;
