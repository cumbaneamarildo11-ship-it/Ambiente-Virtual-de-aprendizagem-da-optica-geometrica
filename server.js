// server.js — ponto de entrada do pequeno AVA
const path = require('path');
const express = require('express');
const session = require('express-session');

const authRoutes = require('./routes/auth');
const progressoRoutes = require('./routes/progresso');
const professorRoutes = require('./routes/professor');
const comunicacaoRoutes = require('./routes/comunicacao');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'troque-este-segredo-em-producao',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
    httpOnly: true,
    sameSite: 'lax',
  },
}));

// ── API ──
app.use('/api', authRoutes);
app.use('/api', progressoRoutes);
app.use('/api', professorRoutes);
app.use('/api', comunicacaoRoutes);

// ── Ficheiros estáticos (frontend) ──
app.use(express.static(path.join(__dirname, 'public')));

// Página inicial → login
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.listen(PORT, () => {
  console.log(`AVA Óptica a correr em http://localhost:${PORT}`);
});
