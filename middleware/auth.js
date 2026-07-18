// middleware/auth.js — proteção de rotas por sessão e por papel

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ erro: 'Não autenticado. Faça login primeiro.' });
  }
  next();
}

function requireProfessor(req, res, next) {
  if (!req.session || req.session.papel !== 'professor') {
    return res.status(403).json({ erro: 'Acesso restrito a professores.' });
  }
  next();
}

module.exports = { requireAuth, requireProfessor };
