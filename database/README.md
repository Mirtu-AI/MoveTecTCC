# 🗄️ Modelagem de Dados — MoveTec

Este diretório contém a documentação da camada de dados do sistema **MoveTec**, incluindo a estrutura das coleções do banco **MongoDB (NoSQL)** e scripts de apoio.

---

## 🏗️ Banco de Dados Utilizado
- **SGBD:** MongoDB Atlas (NoSQL orientado a documentos)
- **Driver Node.js:** `mongodb` (v7.5.0)

---

## 📑 Principais Coleções (Collections)

| Coleção | Descrição |
| :--- | :--- |
| **`alunos`** | Dados cadastrais dos estudantes, turma, métricas, pontuação e credenciais. |
| **`professores`** | Cadastro dos docentes de Educação Física e matérias esportivas. |
| **`admGeral`** | Administradores com permissão de gestão de salas, alunos e professores. |
| **`salas`** | Turmas escolares (ex: 3º A Informática, Ensino Médio, etc.). |
| **`treinos`** | Fichas de treinamento montadas por professores ou pelo sistema. |
| **`rotinas`** | Sequências de exercícios personalizadas por dia/semana. |
| **`exercicios`** | Biblioteca de movimentos físicos, vídeos explicativos, repetições e dicas. |
| **`atividades`** | Tarefas avaliativas ou desafios passados pelos professores aos alunos. |
| **`atividadesAutonomas`** | Atividades físicas extras registradas espontaneamente pelos estudantes. |
| **`comunidades`** | Grupos e turmas de interação social esportiva entre estudantes. |
| **`desafios`** | Desafios com metas de repetição, tempo e pontuação para ranking. |
| **`metas`** | Metas individuais e semanais de frequência e execução física. |
| **`desempenho`** | Histórico e estatísticas de evolução do estudante. |
| **`avisos`** | Mural de comunicados dos professores para as salas. |
| **`mensagens`** | Mensagens e chat em tempo real via Socket.io. |

---

## 📁 Estrutura de Arquivos deste Diretório
- `/models`: Módulos de manipulação e validação das coleções em Node.js / MongoDB.
- `/scripts`: Scripts utilitários (`migrarComunidadesGerais.js`, `gerar-hash.js`, `schema.sql`).
- `schema.sql`: Mapeamento relacional equivalente para fins acadêmicos e compatibilidade SQL.
