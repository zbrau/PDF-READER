# 📚 Lector de PDF

Una aplicación web moderna para leer y gestionar archivos PDF, construida con **React**, **Vite** y **PDF.js**. Funciona completamente en el navegador: tus archivos y datos nunca salen de tu dispositivo.

## ✨ Características

### Biblioteca personal
- Pantalla de inicio tipo biblioteca que muestra todos tus PDFs agregados.
- Guarda automáticamente el progreso de lectura (última página leída) por cada libro.
- Almacena hasta 15 archivos recientes usando **IndexedDB** (`idb-keyval`).
- Permite asignar una **portada personalizada** (imagen) a cada PDF.
- **Etiquetas** para organizar y filtrar tus libros por categoría.
- **Respaldo y restauración** de la biblioteca: exporta/importa todos tus datos de progreso, notas, etiquetas y portadas en un archivo `.json`.

### Lector de PDF
- Renderizado de alta calidad página por página mediante **PDF.js** (Mozilla).
- **Panel de miniaturas** lateral para navegar visualmente entre páginas.
- Navegación con botones anterior/siguiente o con la rueda del ratón.
- **Zoom** ajustable (de 50 % a 300 %).
- **Modo oscuro del PDF**: invierte los colores del documento para reducir el cansancio visual.
- **Pantalla completa** con un solo clic.
- Navegación de regreso a la biblioteca sin perder el progreso.

### Herramientas de lectura
- **Resaltador libre** (modo dibujo): dibuja trazos directamente sobre la página con el ratón; incluye botón de deshacer.
- **Texto a voz (TTS)**: lee en voz alta el texto de la página actual en español (`es-ES`) usando la API de síntesis de voz del navegador.
- **Traducción rápida**: selecciona cualquier texto en el lector y aparece una burbuja para abrirlo directamente en Google Translate.

### Notas
- Agrega notas escritas a cualquier página del PDF.
- Las notas se muestran organizadas por página actual y otras páginas.
- Elimina notas individuales.
- **Exporta** todas tus notas de un libro a un archivo `.txt`.

## 🛠️ Tecnologías

| Tecnología | Descripción |
|---|---|
| [React 19](https://react.dev/) | Biblioteca de interfaz de usuario |
| [Vite](https://vitejs.dev/) | Bundler y servidor de desarrollo |
| [PDF.js (pdfjs-dist)](https://mozilla.github.io/pdf.js/) | Motor de renderizado de PDFs |
| [idb-keyval](https://github.com/jakearchibald/idb-keyval) | Almacenamiento de archivos en IndexedDB |
| [Lucide React](https://lucide.dev/) | Iconos |

## 🚀 Instalación

Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/zbrau/PDF-READER.git
cd PDF-READER
npm install
```

## 💻 Uso

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Para generar una versión de producción:

```bash
npm run build
npm run preview
```

## 📁 Estructura del proyecto

```
PDF-READER/
├── public/                  # Archivos estáticos
├── src/
│   ├── components/
│   │   ├── NotesPanel.jsx   # Panel de notas
│   │   ├── PdfPage.jsx      # Renderizado de una página PDF
│   │   ├── PdfViewer.jsx    # Cargador del documento PDF
│   │   └── ThumbnailPanel.jsx # Miniaturas de navegación
│   ├── utils/
│   │   └── storage.js       # Utilidades de almacenamiento (localStorage + IndexedDB)
│   ├── App.jsx              # Componente raíz y lógica principal
│   └── main.jsx             # Punto de entrada
├── index.html
├── vite.config.js
└── package.json
```

## 📄 Licencia

Este proyecto está bajo la licencia MIT.