import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import ContextProvider from './context/ContextProvider.jsx';
import { AuthProvider } from './context/AuthContext.jsx';


const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <AuthProvider>
    <ContextProvider>
      <App />  
    </ContextProvider>
  </AuthProvider>
);