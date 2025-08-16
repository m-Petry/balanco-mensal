import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register Portuguese locale for react-datepicker
import { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale';

registerLocale('pt-BR', ptBR);

createRoot(document.getElementById("root")!).render(<App />);
