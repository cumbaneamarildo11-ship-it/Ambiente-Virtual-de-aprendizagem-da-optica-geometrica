// routes/professor.js — painel do professor: ver progresso de todos os alunos
const express = require('express');
const db = require('../db');
const { requireAuth, requireProfessor } = require('../middleware/auth');

const router = express.Router();

// GET /api/professor/turma — lista todos os alunos com progresso resumido
router.get('/professor/turma', requireAuth, requireProfessor, (req, res) => {
  const rows = db.prepare(`
    SELECT u.id, u.nome, u.email, u.criado_em,
           p.xp, p.aulas_concluidas, p.nota_final, p.atualizado_em
    FROM users u
    LEFT JOIN progresso p ON p.user_id = u.id
    WHERE u.papel = 'aluno'
    ORDER BY p.xp DESC, u.nome ASC
  `).all();

  const alunos = rows.map(r => ({
    id: r.id,
    nome: r.nome,
    email: r.email,
    xp: r.xp || 0,
    aulas_concluidas: r.aulas_concluidas ? JSON.parse(r.aulas_concluidas) : [],
    nota_final: r.nota_final,
    atualizado_em: r.atualizado_em,
  }));

  res.json({ alunos });
});

// GET /api/professor/aluno/:id — detalhe de um aluno, incluindo respostas de quiz
router.get('/professor/aluno/:id', requireAuth, requireProfessor, (req, res) => {
  const aluno = db.prepare('SELECT id, nome, email FROM users WHERE id = ? AND papel = ?')
    .get(req.params.id, 'aluno');
  if (!aluno) {
    return res.status(404).json({ erro: 'Aluno não encontrado.' });
  }

  const progresso = db.prepare('SELECT xp, aulas_concluidas, nota_final FROM progresso WHERE user_id = ?')
    .get(aluno.id);

  const respostas = db.prepare(`
    SELECT questao_id, resposta, correta, criado_em
    FROM respostas_quiz WHERE user_id = ? ORDER BY criado_em ASC
  `).all(aluno.id);

  res.json({
    aluno,
    progresso: progresso
      ? { xp: progresso.xp, aulas_concluidas: JSON.parse(progresso.aulas_concluidas), nota_final: progresso.nota_final }
      : { xp: 0, aulas_concluidas: [], nota_final: null },
    respostas,
  });
});

module.exports = router;
