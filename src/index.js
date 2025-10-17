import React from 'react';
import ReactDOM from 'react-dom/client';
// 1. Importe as ferramentas necessárias do React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App';

// 2. Crie uma instância do cliente que gerencia os dados
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 3. Envolva toda a sua aplicação com o Provider */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);