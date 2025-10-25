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
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="alertas" element={<Alertas />} />
          <Route path="historico" element={<Historico />} />
          <Route path="analise-preditiva" element={<AnalisePreditiva />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;