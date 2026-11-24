-- ========================================================
-- MoveTec - Esquema Relacional Equivalente (SQL / DER)
-- Projeto de TCC - ETEC de Campo Limpo Paulista
-- ========================================================

CREATE TABLE IF NOT EXISTS salas (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    ano VARCHAR(20) NOT NULL,
    periodo VARCHAR(20),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS professores (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alunos (
    id VARCHAR(36) PRIMARY KEY,
    sala_id VARCHAR(36),
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    pontos INT DEFAULT 0,
    nivel INT DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS exercicios (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    grupo_muscular VARCHAR(100),
    descricao TEXT,
    video_url VARCHAR(255),
    dificuldade VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS treinos (
    id VARCHAR(36) PRIMARY KEY,
    professor_id VARCHAR(36),
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    duracao_estimada_min INT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS metas (
    id VARCHAR(36) PRIMARY KEY,
    aluno_id VARCHAR(36) NOT NULL,
    meta_semanal_minutos INT DEFAULT 150,
    minutos_concluidos INT DEFAULT 0,
    semana_inicio DATE,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comunidades (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    criado_por VARCHAR(36),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
