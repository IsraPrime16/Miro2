const express = require('express');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (coloque o index.html na pasta "public")
app.use(express.static(path.join(__dirname, 'public')));

// Conexão com o banco
const db = new sqlite3.Database('./database.db');

// Criação da tabela
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS chamados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT,
      descricao TEXT,
      status TEXT
    )
  `);
});

// 🔸 Listar chamados
app.get('/chamados', (req, res) => {
  db.all('SELECT * FROM chamados', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 🔸 Criar chamado
app.post('/chamados', (req, res) => {
  const { titulo, descricao, prioridade } = req.body;
  db.run(
    'INSERT INTO chamados (titulo, descricao, status, prioridade) VALUES (?, ?, ?, ?)',
    [titulo, descricao, 'Fila de Atendimento', prioridade || 'Normal'],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// 🔸 Atualizar status do chamado
app.put('/chamados/:id', (req, res) => {
  const { status } = req.body;
  db.run(
    'UPDATE chamados SET status = ? WHERE id = ?',
    [status, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

// 🔸 Reabrir chamado
app.put('/chamados/:id/reabrir', (req, res) => {
  db.run(
    'UPDATE chamados SET status = ? WHERE id = ?',
    ['Em Atendimento', req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

// 🔸 Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
