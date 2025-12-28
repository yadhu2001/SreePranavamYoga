import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ✅ Quill styles (required to preserve bullets, numbering, alignment, font sizes, colors)
import 'react-quill/dist/quill.snow.css';

// ✅ our quill renderer fixes (lists + spacing + alignment)
import './styles/quill-content.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
