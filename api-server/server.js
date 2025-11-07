// Servidor Node.js simples para conectar com MySQL
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração MySQL
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'ecouser',
  password: 'ecopass123',
  database: 'ecomonitor'
};

// Criar pool de conexões
const pool = mysql.createPool(dbConfig);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.json({ status: 'ok', message: 'MySQL conectado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Buscar pontos de monitoramento
app.get('/api/monitoring-points', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const [rows] = await pool.execute(
      'SELECT * FROM monitoringpoint ORDER BY data_medicao DESC LIMIT ?',
      [limit]
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar monitoring points:', error);
    res.status(500).json({ error: error.message });
  }
});

// Buscar alertas
app.get('/api/alerts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const [rows] = await pool.execute(
      'SELECT *, created_at as created_date FROM alert ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar alerts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Atualizar alerta
app.put('/api/alerts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(id);
    
    const [result] = await pool.execute(
      `UPDATE alert SET ${fields} WHERE id = ?`,
      values
    );
    
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    console.error('Erro ao atualizar alert:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Server rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});