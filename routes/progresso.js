// routes/progresso.js — leitura e escrita do progresso do aluno autenticado
const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/progresso — progresso do utilizador logado
router.get('/progresso', requireAuth, (req, res) => {
  const row = db.prepare('SELECT xp, aulas_concluidas, nota_final FROM progresso WHERE user_id = ?')
    .get(req.session.userId);

  if (!row) {
    return res.json({ xp: 0, aulas_concluidas: [], nota_final: null });
  }

  res.json({
    xp: row.xp,
    aulas_concluidas: JSON.parse(row.aulas_concluidas),
    nota_final: row.nota_final,
  });
});

// POST /api/progresso — actualiza XP / aulas concluídas / nota final
// Body: { xp, aulas_concluidas, nota_final }  (todos opcionais, envia o que mudou)
router.post('/progresso', requireAuth, (req, res) => {
  const { xp, aulas_concluidas, nota_final } = req.body || {};

  const atual = db.prepare('SELECT * FROM progresso WHERE user_id = ?').get(req.session.userId);

  const novoXp = typeof xp === 'number' ? xp : (atual ? atual.xp : 0);
  const novasAulas = Array.isArray(aulas_concluidas)
    ? JSON.stringify(aulas_concluidas)
    : (atual ? atual.aulas_concluidas : '[]');
  const novaNota = typeof nota_final === 'string' ? nota_final : (atual ? atual.nota_final : null);

  if (atual) {
    db.prepare(`UPDATE progresso SET xp = ?, aulas_concluidas = ?, nota_final = ?, atualizado_em = datetime('now') WHERE user_id = ?`)
      .run(novoXp, novasAulas, novaNota, req.session.userId);
  } else {
    db.prepare(`INSERT INTO progresso (user_id, xp, aulas_concluidas, nota_final) VALUES (?, ?, ?, ?)`)
      .run(req.session.userId, novoXp, novasAulas, novaNota);
  }

  res.json({ xp: novoXp, aulas_concluidas: JSON.parse(novasAulas), nota_final: novaNota });
});

// POST /api/progresso/resposta — regista uma resposta individual de quiz
// Body: { questao_id, resposta, correta }
router.post('/progresso/resposta', requireAuth, (req, res) => {
  const { questao_id, resposta, correta } = req.body || {};
  if (!questao_id) {
    return res.status(400).json({ erro: 'questao_id em falta.' });
  }
  db.prepare('INSERT INTO respostas_quiz (user_id, questao_id, resposta, correta) VALUES (?, ?, ?, ?)')
    .run(req.session.userId, String(questao_id), String(resposta || ''), correta ? 1 : 0);

  res.json({ ok: true });
});

module.exports = router;
