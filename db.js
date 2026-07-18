// db.js — configuração da base de dados SQLite
// Usa o módulo node:sqlite, embutido no próprio Node.js (v22.5+) — não precisa
// instalar nem compilar nada (evita a dependência de Python/build tools que
// o better-sqlite3 exigia).
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, 'ava.db');
const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL;');

// ── Criação das tabelas (só corre se ainda não existirem) ──
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  papel TEXT NOT NULL CHECK (papel IN ('aluno','professor')),
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS progresso (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  aulas_concluidas TEXT NOT NULL DEFAULT '[]',
  nota_final TEXT,
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS respostas_quiz (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  questao_id TEXT NOT NULL,
  resposta TEXT,
  correta INTEGER NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_respostas_user ON respostas_quiz(user_id);

CREATE TABLE IF NOT EXISTS avisos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  autor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS forum_mensagens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  autor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mensagem TEXT NOT NULL,
  resposta_a INTEGER REFERENCES forum_mensagens(id) ON DELETE CASCADE,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_forum_resposta ON forum_mensagens(resposta_a);

-- Tabela de configuração simples (chave/valor) — usada para o prazo da avaliação final
CREATE TABLE IF NOT EXISTS config (
  chave TEXT PRIMARY KEY,
  valor TEXT
);
`);

module.exports = db;
