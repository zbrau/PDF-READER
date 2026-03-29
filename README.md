# PDF Reader
# 📚 PDF Reader — Mi Biblioteca Personal

This project is a simple PDF reader that allows users to view PDF documents easily.
Una aplicación web de lectura de PDFs construida con **React** y **Vite**, diseñada para gestionar y leer documentos PDF directamente en el navegador, sin necesidad de un servidor. Todo el progreso, las notas y la biblioteca se guardan de forma local en tu dispositivo.

## Overview
---

It provides features such as searching text, navigating through pages, and zooming in and out.
## ✨ Características

## Technology
### Biblioteca personal
- Vista de tarjetas estilo librería con todas tus portadas de libros.
- Guarda automáticamente hasta 15 PDFs recientes usando **IndexedDB**.
- Portadas personalizables: cambia la imagen de portada de cualquier libro.
- **Etiquetas** para organizar y filtrar tus documentos por categorías.
- Elimina libros de la biblioteca sin perder el progreso guardado.

The project uses PDF.js (Mozilla) for rendering PDFs (typically via canvas) and maintains a responsive user interface.
### Lector de PDFs
- Renderizado de alta calidad usando **PDF.js**.
- Recuerda automáticamente la última página leída por archivo.
- Navegación por páginas con botones, rueda del ratón o panel de miniaturas.
- **Zoom** ajustable (50 % – 300 %).
- **Modo oscuro del PDF** (inversión de colores) para lectura nocturna.
- Pantalla completa con un solo clic.

## Installation
### Herramientas de estudio
- **Panel de notas**: añade, visualiza y elimina notas asociadas a cada página.
- **Resaltador libre**: dibuja trazos sobre la página con la herramienta de lápiz y deshaz el último trazo con `Deshacer`.
- **Lectura en voz alta (TTS)**: lee el texto de la página actual usando la síntesis de voz del navegador (idioma español).
- **Traducción rápida**: selecciona cualquier texto y aparece un botón para abrirlo directamente en Google Translate.

To run this project, you need to clone the repository and install the required dependencies.
### Panel de miniaturas
- Visualiza todas las páginas del documento en miniatura.
- Navega a cualquier página con un clic.
- Ocultable para maximizar el área de lectura.

### Copia de seguridad
- **Exportar datos**: descarga un archivo `.json` con todo el progreso y notas de tu biblioteca.
- **Restaurar datos**: importa un backup para recuperar tu progreso en cualquier dispositivo o navegador.

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| [React 19](https://react.dev) | Interfaz de usuario |
| [Vite](https://vitejs.dev) | Bundler y servidor de desarrollo |
| [PDF.js (pdfjs-dist)](https://mozilla.github.io/pdf.js/) | Renderizado de PDFs |
| [idb-keyval](https://github.com/jakearchibald/idb-keyval) | Almacenamiento de archivos en IndexedDB |
| [Lucide React](https://lucide.dev) | Iconos |
| `localStorage` | Persistencia de notas y progreso por archivo |
| Web Speech API | Lectura en voz alta (TTS) |

---

## 🚀 Instalación y uso local

### Requisitos previos
- [Node.js](https://nodejs.org/) v18 o superior
- npm v9 o superior

### Pasos

```bash
# 1. Clona el repositorio
git clone https://github.com/zbrau/PDF-READER.git
cd PDF-READER

# 2. Instala las dependencias
npm install

# 3. Inicia el servidor de desarrollo
npm run dev
```

## Usage
Abre tu navegador en `http://localhost:5173`.

After installing the dependencies, you can start the application by running:
### Otros comandos

```bash
npm start
# Compilar para producción
npm run build

# Vista previa de la build de producción
npm run preview

# Ejecutar el linter
npm run lint
```

---

## 📂 Estructura del proyecto

```
src/
├── components/
│   ├── PdfViewer.jsx      # Carga y gestión del documento PDF
│   ├── PdfPage.jsx        # Renderizado de página individual + canvas de dibujo
│   ├── ThumbnailPanel.jsx # Panel lateral de miniaturas
│   └── NotesPanel.jsx     # Panel lateral de notas
├── utils/
│   └── storage.js         # Funciones de persistencia (localStorage + IndexedDB)
├── App.jsx                # Componente principal: biblioteca y lector
├── App.css                # Estilos globales
└── main.jsx               # Punto de entrada
```

---

## 📖 Cómo usar la aplicación

1. **Agregar un PDF**: haz clic en el botón **"Agregar PDF"** y selecciona un archivo desde tu dispositivo.
2. **Abrir un libro**: haz clic sobre cualquier tarjeta de la biblioteca.
3. **Navegar**: usa los botones de página, la rueda del ratón o el panel de miniaturas (izquierda).
4. **Añadir notas**: escribe en el panel de notas (derecha) y pulsa **Guardar**.
5. **Resaltar**: activa el lápiz (✏️) en la barra superior y dibuja libremente sobre la página.
6. **Escuchar**: pulsa el icono de altavoz 🔊 para que el navegador lea la página en voz alta.
7. **Traducir**: selecciona cualquier texto con el ratón y pulsa el botón **"Traducir esto"**.
8. **Organizar**: haz clic en el icono de etiqueta 🏷️ de cualquier tarjeta para agregar categorías.
9. **Respaldar**: usa los botones **"Respaldar Datos"** y **"Restaurar Datos"** para exportar e importar tu biblioteca.

---

## License
## 📝 Licencia

This project is licensed under the MIT License.
Este proyecto es de uso personal y educativo.
