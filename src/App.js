import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './Layout';
import Dashboard from './Pages/Dashboard';
import Alertas from './Pages/Alertas';
import Historico from './Pages/Historico';
import AnalisePreditiva from './Pages/AnalisePreditiva';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* A rota principal usa seu componente de Layout */}
        <Route path="/" element={<Layout />}>
          {/* A página inicial (rota "/") será o Dashboard */}
          <Route index element={<Dashboard />} />
          
          {/* As outras páginas */}
          <Route path="alertas" element={<Alertas />} />
          <Route path="historico" element={<Historico />} />
          <Route path="analise-preditiva" element={<AnalisePreditiva />} />
          
          {/* Adicione outras rotas aqui conforme criar mais páginas */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;