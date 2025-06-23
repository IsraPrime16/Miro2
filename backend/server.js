const express = require('express');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (coloque o index.html na pasta "public")
app.use(express.static(path.join(__dirname, 'public')));

// Conexão com o banco
const db = new sqlite3.Database('./database.db');

// Criação da tabela de chamados
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS chamados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT,
      descricao TEXT,
      status TEXT,
      prioridade TEXT
    )
  `);
  // Criação da tabela de usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      email TEXT UNIQUE,
      senha TEXT,
      atendente INTEGER DEFAULT 0
    )
  `);
});

// 🔸 Listar chamados
app.get('/chamados', (req, res) => {
  const { prioridade } = req.query;
  let sql = 'SELECT * FROM chamados';
  let params = [];
  if (prioridade) {
    sql += ' WHERE prioridade = ?';
    params.push(prioridade);
  }
  db.all(sql, params, (err, rows) => {
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

// Cadastro de usuário
app.post('/usuarios/cadastrar', (req, res) => {
  const { nome, email, senha, atendente } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }
  // Criptografa a senha
  const hash = bcrypt.hashSync(senha, 10);
  db.run(
    'INSERT INTO usuarios (nome, email, senha, atendente) VALUES (?, ?, ?, ?)',
    [nome, email, hash, atendente ? 1 : 0],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'E-mail já cadastrado.' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, nome, email, atendente: atendente ? true : false });
    }
  );
});

// Login de usuário
app.post('/usuarios/login', (req, res) => {
  const { email, senha } = req.body;
  db.get(
    'SELECT * FROM usuarios WHERE email = ?',
    [email],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
      // Compara a senha informada com o hash
      if (!bcrypt.compareSync(senha, row.senha)) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
      }
      res.json({ id: row.id, nome: row.nome, email: row.email, atendente: !!row.atendente });
    }
  );
});

// 🔸 Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
