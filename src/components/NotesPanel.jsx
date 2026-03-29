import React, { useState } from 'react';
import { Trash2, StickyNote, Download } from 'lucide-react';

export default function NotesPanel({ notes, currentPage, onAddNote, onDeleteNote }) {
  const [newNote, setNewNote] = useState('');

  const handleSave = () => {
    if (newNote.trim()) {
      onAddNote(newNote.trim());
      setNewNote('');
    }
  };

  const handleExport = () => {
    if (notes.length === 0) return;
    const textData = notes.map(n => `[Página ${n.page}] - ${new Date(n.date).toLocaleString()}\n${n.text}\n---\n`).join('\n');
    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Mis_Notas_Lector_PDF.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const pageNotes = notes.filter(n => n.page === currentPage);
  const otherNotes = notes.filter(n => n.page !== currentPage);

  return (
    <div className="notes-sidebar">
      <div className="notes-header" style={{ justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StickyNote size={20} color="var(--accent)" />
          <h2>Notas</h2>
        </div>
        <button 
          className="icon-btn" 
          onClick={handleExport} 
          disabled={notes.length === 0}
          title="Exportar notas a TXT"
        >
          <Download size={18} />
        </button>
      </div>
      
      <div className="notes-content">
        {pageNotes.length > 0 && (
          <div style={{marginBottom: 10}}>
            <h3 style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 8}}>Página {currentPage}</h3>
            {pageNotes.map((note) => (
              <div key={note.id} className="note-item">
                <div className="note-item-text">{note.text}</div>
                <div className="note-item-header" style={{marginTop: 8}}>
                  <span>{new Date(note.date).toLocaleDateString()}</span>
                  <button className="icon-btn delete-note-btn" style={{width: 24, height: 24}} onClick={() => onDeleteNote(note.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {otherNotes.length > 0 && (
          <div>
             <h3 style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 8}}>Otras Páginas</h3>
             {otherNotes.map((note) => (
              <div key={note.id} className="note-item" style={{opacity: 0.8}}>
                <div className="note-item-header" style={{marginBottom: 8}}>
                  <span className="page-badge">Pág. {note.page}</span>
                  <button className="icon-btn delete-note-btn" style={{width: 24, height: 24}} onClick={() => onDeleteNote(note.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="note-item-text">{note.text}</div>
              </div>
            ))}
          </div>
        )}

        {notes.length === 0 && (
          <div style={{textAlign: 'center', color: 'var(--text-secondary)', marginTop: 40}}>
            No hay notas guardadas.
          </div>
        )}
      </div>

      <div className="note-input-container">
        <textarea 
          className="note-textarea"
          placeholder={`Escribe una nota para la página ${currentPage}...`}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <button 
          className="save-note-btn"
          disabled={!newNote.trim()}
          onClick={handleSave}
        >
          Guardar Nota
        </button>
      </div>
    </div>
  );
}
