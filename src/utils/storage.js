import { get, set } from 'idb-keyval';

// Funciones de utilidad para manejar el almacenamiento de notas y progreso

export const getStorageKey = (fileName) => {
  return `pdf_reader_${fileName}`;
};

export const loadPdfData = (fileName) => {
  const key = getStorageKey(fileName);
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Error parsing stored data', e);
      return { lastPage: 1, notes: [] };
    }
  }
  return { lastPage: 1, notes: [] };
};

export const savePdfProgress = (fileName, pageNumber) => {
  const currentData = loadPdfData(fileName);
  const newData = { ...currentData, lastPage: pageNumber };
  localStorage.setItem(getStorageKey(fileName), JSON.stringify(newData));
};

export const savePdfNote = (fileName, pageNumber, text) => {
  const currentData = loadPdfData(fileName);
  const newNote = {
    id: Date.now().toString(),
    page: pageNumber,
    text,
    date: new Date().toISOString()
  };
  const newData = { 
    ...currentData, 
    notes: [...(currentData.notes || []), newNote] 
  };
  localStorage.setItem(getStorageKey(fileName), JSON.stringify(newData));
  return newNote;
};

export const deletePdfNote = (fileName, noteId) => {
  const currentData = loadPdfData(fileName);
  const newData = {
    ...currentData,
    notes: currentData.notes.filter(n => n.id !== noteId)
  };
  localStorage.setItem(getStorageKey(fileName), JSON.stringify(newData));
};

export const saveRecentFile = async (fileObj, customCover = null) => {
  try {
    const recents = (await get('library_pdf_files_v2')) || [];
    const existing = recents.find(f => f.name === fileObj.name);
    const cover = customCover || (existing ? existing.customCover : null);
    const existingTags = existing ? existing.tags || [] : [];

    const filtered = recents.filter(f => f.name !== fileObj.name);
    filtered.unshift({ name: fileObj.name, file: fileObj, customCover: cover, tags: existingTags, lastOpened: Date.now() });
    await set('library_pdf_files_v2', filtered.slice(0, 15));
  } catch(e) { console.error('Error saving recent file', e); }
};

export const deleteRecentFile = async (fileName) => {
  try {
    const recents = (await get('library_pdf_files_v2')) || [];
    const filtered = recents.filter(f => f.name !== fileName);
    await set('library_pdf_files_v2', filtered);
  } catch(e) { console.error(e); }
};

export const updateRecentFileTags = async (fileName, tags) => {
  try {
    const recents = (await get('library_pdf_files_v2')) || [];
    const index = recents.findIndex(f => f.name === fileName);
    if (index !== -1) {
      recents[index].tags = tags;
      await set('library_pdf_files_v2', recents);
    }
  } catch(e) {}
};

export const getRecentFiles = async () => {
  try { return (await get('library_pdf_files_v2')) || []; } 
  catch(e) { return []; }
};

export const exportLibraryMetadata = async () => {
  const exportData = { localStorage: {}, libraryMeta: [] };
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('pdf_reader_')) {
      exportData.localStorage[key] = localStorage.getItem(key);
    }
  }
  try {
    const recents = (await get('library_pdf_files_v2')) || [];
    exportData.libraryMeta = recents.map(f => ({
      name: f.name,
      tags: f.tags || [],
      customCover: f.customCover || null
    }));
  } catch (e) {}
  return JSON.stringify(exportData);
};

export const importLibraryMetadata = async (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.localStorage) {
      Object.keys(data.localStorage).forEach(key => {
        localStorage.setItem(key, data.localStorage[key]);
      });
    }
    if (data.libraryMeta && Array.isArray(data.libraryMeta)) {
      const recents = (await get('library_pdf_files_v2')) || [];
      data.libraryMeta.forEach(meta => {
        const existing = recents.find(r => r.name === meta.name);
        if (existing) {
          existing.tags = meta.tags;
          if (meta.customCover) existing.customCover = meta.customCover;
        } else {
          recents.push({ name: meta.name, file: null, tags: meta.tags, customCover: meta.customCover, lastOpened: Date.now() });
        }
      });
      await set('library_pdf_files_v2', recents);
    }
    return true;
  } catch(e) {
    console.error("Error importing data", e);
    return false;
  }
};
