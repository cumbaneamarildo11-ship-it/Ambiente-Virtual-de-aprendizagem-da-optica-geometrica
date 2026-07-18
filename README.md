# AVA Óptica Geométrica — pequeno Ambiente Virtual de Aprendizagem

Backend em Node.js/Express + SQLite para o módulo interactivo de Óptica Geométrica,
com contas de aluno/professor e progresso guardado no servidor (em vez de `localStorage`).

## Estrutura

```
ava-optica/
├── package.json
├── server.js              # servidor Express
├── db.js                  # base de dados SQLite (ficheiro ava.db, criado automaticamente)
├── middleware/
│   └── auth.js            # protecção de rotas (sessão / papel)
├── routes/
│   ├── auth.js             # /api/registo, /api/login, /api/logout, /api/me
│   ├── progresso.js        # /api/progresso, /api/progresso/resposta
│   ├── professor.js        # /api/professor/turma, /api/professor/aluno/:id
│   └── comunicacao.js      # /api/avisos, /api/forum, /api/prazo
└── public/
    ├── login.html           # página de entrada / criação de conta
    ├── modulo_optica.html   # o módulo (adaptado para falar com a API)
    └── professor.html       # painel do professor
```

## Funcionalidades

- **Contas de aluno e professor**, com progresso guardado no servidor
- **Painel do professor**: turma completa, XP, aulas concluídas, nota final
- **Mural de avisos**: o professor publica, todos os alunos veem (também aparece uma prévia na introdução do módulo)
- **Fórum de dúvidas**: qualquer aluno pode perguntar, professor e colegas respondem, tudo fica visível a todos
- **Prazo da avaliação final**: o professor define uma data/hora limite; os alunos veem uma contagem decrescente na introdução e na aba "Comunicação"

## Como correr localmente

1. **Instalar o Node.js** (versão 18 ou mais recente) — https://nodejs.org
2. Abrir um terminal dentro da pasta `ava-optica` e instalar as dependências:
   ```
   npm install
   ```
3. Iniciar o servidor:
   ```
   npm start
   ```
4. Abrir no navegador: **http://localhost:3000**

Na primeira vez, cria uma conta em "Criar conta" — escolhe "Professor" para uma conta de
professor (vê o painel de turma) ou "Aluno" para entrar directamente no módulo.

## Notas importantes

- **Base de dados**: usa o módulo `node:sqlite`, embutido no próprio Node.js
  (v22.5+) — não precisa instalar nem compilar nada à parte para a base de
  dados funcionar. Cria-se automaticamente um ficheiro `ava.db` na primeira
  execução. Para recomeçar do zero, basta apagar esse ficheiro (o servidor
  recria as tabelas). É normal aparecer um aviso `ExperimentalWarning:
  SQLite is an experimental feature` no terminal ao iniciar — é apenas
  informativo, não impede o funcionamento.
- **Requisito de versão do Node**: por usar `node:sqlite`, é necessário
  Node.js 22.5 ou mais recente (`node --version` para confirmar).
- **Sessões**: guardadas em memória — se reiniciar o servidor, todos têm de fazer login
  novamente (o progresso em si não se perde, está na base de dados).
- **Segredo da sessão**: antes de publicar isto num servidor real, define a variável de
  ambiente `SESSION_SECRET` com um valor aleatório próprio, em vez do valor por omissão
  no código.
- **Múltiplos alunos**: cada aluno só vê o seu próprio progresso; só contas "professor"
  conseguem aceder a `/professor.html` e à turma inteira.

## Possíveis próximos passos

- Migrar a sessão em memória para um "store" persistente (ex. `connect-sqlite3`) se
  quiser reiniciar o servidor sem deslogar toda a gente.
- Adicionar recuperação de senha por email.
- Permitir ao professor ver as respostas detalhadas de cada aluno
  (o endpoint `/api/professor/aluno/:id` já devolve isto — falta só uma página para o mostrar).
- Notificações (ex. email) quando um novo aviso é publicado ou o prazo se aproxima.
- Colocar em produção: Render, Railway ou uma VPS simples com Node instalado.
