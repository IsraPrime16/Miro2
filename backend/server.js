const express = require('express');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./database.db');

// Criação da tabela
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS chamados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT,
      status TEXT
    )
  `);
});

// Listar chamados por status
app.get('/chamados', (req, res) => {
  db.all('SELECT * FROM chamados', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Criar chamado
app.post('/chamados', (req, res) => {
  const { titulo } = req.body;
  db.run(
    'INSERT INTO chamados (titulo, status) VALUES (?, ?)',
    [titulo, 'Fila'],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, titulo, status: 'Fila' });
    }
  );
});

// Atualizar status do chamado
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

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});