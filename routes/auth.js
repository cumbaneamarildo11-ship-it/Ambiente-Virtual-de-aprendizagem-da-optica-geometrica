// routes/auth.js — registo, login, logout, "quem sou eu"
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();

// POST /api/registo  { nome, email, senha, papel }
router.post('/registo', (req, res) => {
  const { nome, email, senha, papel } = req.body || {};

  if (!nome || !email || !senha || !papel) {
    return res.status(400).json({ erro: 'Preencha nome, email, senha e papel.' });
  }
  if (!['aluno', 'professor'].includes(papel)) {
    return res.status(400).json({ erro: 'Papel inválido. Use "aluno" ou "professor".' });
  }
  if (senha.length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  const existente = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existente) {
    return res.status(409).json({ erro: 'Já existe uma conta com este email.' });
  }

  const senha_hash = bcrypt.hashSync(senha, 10);
  const info = db
    .prepare('INSERT INTO users (nome, email, senha_hash, papel) VALUES (?, ?, ?, ?)')
    .run(nome.trim(), email.toLowerCase().trim(), senha_hash, papel);

  // Cria a linha de progresso inicial para o aluno
  db.prepare('INSERT INTO progresso (user_id, xp, aulas_concluidas, nota_final) VALUES (?, 0, ?, NULL)')
    .run(info.lastInsertRowid, '[]');

  req.session.userId = info.lastInsertRowid;
  req.session.papel = papel;
  req.session.nome = nome.trim();

  res.json({ id: info.lastInsertRowid, nome: nome.trim(), papel });
});

// POST /api/login  { email, senha }
router.post('/login', (req, res) => {
  const { email, senha } = req.body || {};
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Indique email e senha.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user || !bcrypt.compareSync(senha, user.senha_hash)) {
    return res.status(401).json({ erro: 'Email ou senha incorrectos.' });
  }

  req.session.userId = user.id;
  req.session.papel = user.papel;
  req.session.nome = user.nome;

  res.json({ id: user.id, nome: user.nome, papel: user.papel });
});

// POST /api/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

// GET /api/me — devolve o utilizador da sessão actual (ou 401)
router.get('/me', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ erro: 'Não autenticado.' });
  }
  res.json({ id: req.session.userId, nome: req.session.nome, papel: req.session.papel });
});

module.exports = router;
