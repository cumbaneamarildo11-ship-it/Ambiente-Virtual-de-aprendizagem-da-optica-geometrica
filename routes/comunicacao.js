// routes/comunicacao.js — mural de avisos e fórum de dúvidas
const express = require('express');
const db = require('../db');
const { requireAuth, requireProfessor } = require('../middleware/auth');

const router = express.Router();

// ── AVISOS ──────────────────────────────────────────────
// GET /api/avisos — qualquer utilizador autenticado vê o mural
router.get('/avisos', requireAuth, (req, res) => {
  const avisos = db.prepare(`
    SELECT a.id, a.titulo, a.mensagem, a.criado_em, u.nome AS autor_nome
    FROM avisos a JOIN users u ON u.id = a.autor_id
    ORDER BY a.criado_em DESC
    LIMIT 50
  `).all();
  res.json({ avisos });
});

// POST /api/avisos — só o professor publica avisos
router.post('/avisos', requireAuth, requireProfessor, (req, res) => {
  const { titulo, mensagem } = req.body || {};
  if (!titulo || !mensagem) {
    return res.status(400).json({ erro: 'Indique título e mensagem do aviso.' });
  }
  const info = db.prepare('INSERT INTO avisos (autor_id, titulo, mensagem) VALUES (?, ?, ?)')
    .run(req.session.userId, titulo.trim(), mensagem.trim());
  res.json({ id: info.lastInsertRowid });
});

// DELETE /api/avisos/:id — só o professor remove avisos
router.delete('/avisos/:id', requireAuth, requireProfessor, (req, res) => {
  db.prepare('DELETE FROM avisos WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ── FÓRUM DE DÚVIDAS ────────────────────────────────────
// GET /api/forum — todas as mensagens (perguntas + respostas), qualquer utilizador autenticado
router.get('/forum', requireAuth, (req, res) => {
  const mensagens = db.prepare(`
    SELECT f.id, f.mensagem, f.resposta_a, f.criado_em, u.nome AS autor_nome, u.papel AS autor_papel
    FROM forum_mensagens f JOIN users u ON u.id = f.autor_id
    ORDER BY f.criado_em ASC
  `).all();
  res.json({ mensagens });
});

// POST /api/forum — qualquer utilizador autenticado pode perguntar ou responder
// Body: { mensagem, resposta_a } (resposta_a é opcional — id da mensagem a que responde)
router.post('/forum', requireAuth, (req, res) => {
  const { mensagem, resposta_a } = req.body || {};
  if (!mensagem || !mensagem.trim()) {
    return res.status(400).json({ erro: 'A mensagem não pode estar vazia.' });
  }
  const info = db.prepare('INSERT INTO forum_mensagens (autor_id, mensagem, resposta_a) VALUES (?, ?, ?)')
    .run(req.session.userId, mensagem.trim(), resposta_a || null);
  res.json({ id: info.lastInsertRowid });
});

// ── PRAZO DA AVALIAÇÃO FINAL ────────────────────────────
// GET /api/prazo — qualquer utilizador autenticado vê o prazo actual
router.get('/prazo', requireAuth, (req, res) => {
  const row = db.prepare("SELECT valor FROM config WHERE chave = 'prazo_final'").get();
  res.json({ prazo_final: row ? row.valor : null });
});

// POST /api/prazo — só o professor define/altera o prazo
// Body: { prazo_final: '2026-08-15T23:59' }  (ISO datetime) ou null para remover
router.post('/prazo', requireAuth, requireProfessor, (req, res) => {
  const { prazo_final } = req.body || {};
  db.prepare(`
    INSERT INTO config (chave, valor) VALUES ('prazo_final', ?)
    ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor
  `).run(prazo_final || null);
  res.json({ prazo_final: prazo_final || null });
});

module.exports = router;
