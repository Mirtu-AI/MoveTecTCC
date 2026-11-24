-- ========================================================
-- BANCO DE DADOS: MOVETEC (Baseado no DER Oficial)
-- ========================================================

CREATE DATABASE IF NOT EXISTS movetec_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE movetec_db;

-- --------------------------------------------------------
-- 1. TABELA: PROFESSOR (Administradores / Docentes)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS professor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    foto BLOB NULL,
    adm_geral TINYINT(1) DEFAULT 0
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 2. TABELA: SALA (Turmas escolares)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS sala (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(45) NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    administrador_id INT NULL,
    CONSTRAINT fk_sala_professor
        FOREIGN KEY (administrador_id) REFERENCES professor(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 3. TABELA: ALUNOS
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    foto_url BLOB NULL,
    foguinho TINYINT DEFAULT 0,
    pontos INT DEFAULT 0,
    sala_id INT NULL,
    CONSTRAINT fk_alunos_sala
        FOREIGN KEY (sala_id) REFERENCES sala(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 4. TABELA: AVISOS
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS avisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(45) NOT NULL,
    descricao VARCHAR(255) NULL,
    data DATE NOT NULL
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 5. TABELA: AVISOS_SALA (Relacionamento Aviso <-> Sala)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS avisos_sala (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sala_id INT NOT NULL,
    avisos_id INT NOT NULL,
    CONSTRAINT fk_avisos_sala_sala
        FOREIGN KEY (sala_id) REFERENCES sala(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_avisos_sala_avisos
        FOREIGN KEY (avisos_id) REFERENCES avisos(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 6. TABELA: AVISO_PROFESSOR (Relacionamento Aviso <-> Professor)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS aviso_professor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    professor_id INT NOT NULL,
    avisos_id INT NOT NULL,
    CONSTRAINT fk_aviso_prof_professor
        FOREIGN KEY (professor_id) REFERENCES professor(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_aviso_prof_avisos
        FOREIGN KEY (avisos_id) REFERENCES avisos(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 7. TABELA: METAS
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS metas (
    idmetas INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    valorAlvo INT NOT NULL,
    unidade VARCHAR(255) NOT NULL,
    periodo VARCHAR(255) NOT NULL,
    criadoEm DATETIME DEFAULT CURRENT_TIMESTAMP,
    alunos_id INT NOT NULL,
    CONSTRAINT fk_metas_alunos
        FOREIGN KEY (alunos_id) REFERENCES alunos(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 8. TABELA: CONQUISTA
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS conquista (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    pontos INT DEFAULT 0,
    imagem BLOB NULL
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 9. TABELA: ALUNO_CONQUISTA
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS aluno_conquista (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alunos_id INT NOT NULL,
    conquista_id INT NOT NULL,
    CONSTRAINT fk_aluno_conquista_aluno
        FOREIGN KEY (alunos_id) REFERENCES alunos(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_aluno_conquista_conquista
        FOREIGN KEY (conquista_id) REFERENCES conquista(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 10. TABELA: TREINO
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS treino (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao VARCHAR(255) NULL,
    imagem BLOB NULL
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 11. TABELA: ALUNO_TREINO (Treinos atribuídos ao aluno)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS aluno_treino (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alunos_id INT NOT NULL,
    treino_id INT NOT NULL,
    CONSTRAINT fk_aluno_treino_aluno
        FOREIGN KEY (alunos_id) REFERENCES alunos(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_aluno_treino_treino
        FOREIGN KEY (treino_id) REFERENCES treino(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 12. TABELA: TREINO_REALIZADOS (Histórico de treinos)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS treino_realizados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    realizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    treino_id INT NOT NULL,
    alunos_id INT NOT NULL,
    dia_da_semana VARCHAR(45) NULL,
    CONSTRAINT fk_treino_realizados_treino
        FOREIGN KEY (treino_id) REFERENCES treino(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_treino_realizados_aluno
        FOREIGN KEY (alunos_id) REFERENCES alunos(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 13. TABELA: ROTINA
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS rotina (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(45) NOT NULL,
    descricao VARCHAR(255) NULL,
    secao_titulo VARCHAR(45) NULL,
    secao_descricao VARCHAR(45) NULL
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 14. TABELA: ROTINA_GRUPO_TREINO
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS rotina_grupo_treino (
    id INT AUTO_INCREMENT PRIMARY KEY,
    treino_id INT NOT NULL,
    rotina_id INT NOT NULL,
    CONSTRAINT fk_rotina_grupo_treino_treino
        FOREIGN KEY (treino_id) REFERENCES treino(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_rotina_grupo_treino_rotina
        FOREIGN KEY (rotina_id) REFERENCES rotina(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 15. TABELA: EXERCICIO
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS exercicio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(45) NOT NULL,
    descricao VARCHAR(255) NULL,
    adaptacao VARCHAR(255) NULL,
    video MEDIUMBLOB NULL
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 16. TABELA: TREINO_EXERCICIO (Ficha de exercícios do treino)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS treino_exercicio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    serie INT NOT NULL,
    repeticoes INT NOT NULL,
    treino_id INT NOT NULL,
    exercicio_id INT NOT NULL,
    CONSTRAINT fk_treino_exercicio_treino
        FOREIGN KEY (treino_id) REFERENCES treino(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_treino_exercicio_exercicio
        FOREIGN KEY (exercicio_id) REFERENCES exercicio(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 17. TABELA: COMUNIDADE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS comunidade (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(45) NOT NULL,
    descricao VARCHAR(255) NULL,
    foto BLOB NULL,
    criada_em DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 18. TABELA: COMUNIDADE_ALUNO
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS comunidade_aluno (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alunos_id INT NOT NULL,
    comunidade_id INT NOT NULL,
    CONSTRAINT fk_comunidade_aluno_aluno
        FOREIGN KEY (alunos_id) REFERENCES alunos(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_comunidade_aluno_comunidade
        FOREIGN KEY (comunidade_id) REFERENCES comunidade(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 19. TABELA: COMUNIDADE_ADMINISTRADOR
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS comunidade_administrador (
    id INT AUTO_INCREMENT PRIMARY KEY,
    administrador_id INT NOT NULL,
    comunidade_id INT NOT NULL,
    CONSTRAINT fk_comunidade_admin_professor
        FOREIGN KEY (administrador_id) REFERENCES professor(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_comunidade_admin_comunidade
        FOREIGN KEY (comunidade_id) REFERENCES comunidade(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 20. TABELA: MENSAGEM (Chat da Comunidade)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS mensagem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    texto VARCHAR(255) NOT NULL,
    enviada_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    alunos_id INT NULL,
    administrador_id INT NULL,
    comunidade_id INT NOT NULL,
    CONSTRAINT fk_mensagem_aluno
        FOREIGN KEY (alunos_id) REFERENCES alunos(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_mensagem_professor
        FOREIGN KEY (administrador_id) REFERENCES professor(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_mensagem_comunidade
        FOREIGN KEY (comunidade_id) REFERENCES comunidade(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 21. TABELA: DESAFIO
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS desafio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(45) NOT NULL,
    descricao VARCHAR(45) NULL
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 22. TABELA: ATIVIDADE (Atividades avaliativas propostas)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS atividade (
    id INT AUTO_INCREMENT PRIMARY KEY,
    imagem_url BLOB NULL,
    adaptacao VARCHAR(255) NULL,
    data_entrega DATETIME NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    justificativa_url TINYBLOB NULL,
    alunos_id INT NULL,
    professor_id INT NOT NULL,
    CONSTRAINT fk_atividade_aluno
        FOREIGN KEY (alunos_id) REFERENCES alunos(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_atividade_professor
        FOREIGN KEY (professor_id) REFERENCES professor(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 23. TABELA: ATIVIDADE_TREINO
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS atividade_treino (
    id INT AUTO_INCREMENT PRIMARY KEY,
    concluido TINYINT(1) DEFAULT 0,
    treino_id INT NOT NULL,
    atividade_id INT NOT NULL,
    CONSTRAINT fk_atividade_treino_treino
        FOREIGN KEY (treino_id) REFERENCES treino(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_atividade_treino_atividade
        FOREIGN KEY (atividade_id) REFERENCES atividade(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 24. TABELA: ATIVIDADE_REALIZADAS (Entregas e validação)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS atividade_realizadas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    realizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_atividade INT NOT NULL,
    alunos_id INT NOT NULL,
    campo_consentimento TINYINT(1) DEFAULT 1,
    video_comprobatorio BLOB NULL,
    status VARCHAR(45) DEFAULT 'Pendente',
    feedback VARCHAR(255) NULL,
    CONSTRAINT fk_ativ_realizadas_atividade
        FOREIGN KEY (id_atividade) REFERENCES atividade(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ativ_realizadas_aluno
        FOREIGN KEY (alunos_id) REFERENCES alunos(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ========================================================
-- POVOAMENTO DE DADOS (INSERTS)
-- ========================================================
-- 1. Professores
INSERT INTO professor (id, email, senha, adm_geral) VALUES
(1, 'barbara.porfirio@etec.sp.gov.br', 'senha_hash_123', 1),
(2, 'thaynara.maia@etec.sp.gov.br', 'senha_hash_456', 1),
(3, 'roberto.edfisica@etec.sp.gov.br', 'senha_hash_789', 0);
-- 2. Salas
INSERT INTO sala (id, nome, data_criacao, administrador_id) VALUES
(1, '3º A Informática', NOW(), 1),
(2, '2º B Administração', NOW(), 2),
(3, '1º A Ensino Médio', NOW(), 3);
-- 3. Alunos
INSERT INTO alunos (id, email, senha, foguinho, pontos, sala_id) VALUES
(1, 'camila.silva@etec.sp.gov.br', 'aluno123', 5, 250, 1),
(2, 'livia.quatroque@etec.sp.gov.br', 'aluno123', 8, 380, 1),
(3, 'milton.santos@etec.sp.gov.br', 'aluno123', 12, 520, 1),
(4, 'pedro.henrique@etec.sp.gov.br', 'aluno123', 2, 90, 2);
-- 4. Avisos
INSERT INTO avisos (id, titulo, descricao, data) VALUES
(1, 'Início do Desafio Semanal', 'Todos devem registrar ao menos 1 treino até sexta-feira.', CURDATE()),
(2, 'Entrega de Atividade Prática', 'Não esqueçam de anexar o vídeo comprovatório.', CURDATE());
-- 5. Avisos por Sala
INSERT INTO avisos_sala (id, sala_id, avisos_id) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 1, 2);
-- 6. Aviso do Professor
INSERT INTO aviso_professor (id, professor_id, avisos_id) VALUES
(1, 1, 1),
(2, 3, 2);
-- 7. Metas dos Alunos
INSERT INTO metas (idmetas, titulo, valorAlvo, unidade, periodo, criadoEm, alunos_id) VALUES
(1, 'Tempo Semanal em Movimento', 150, 'minutos', 'Semanal', NOW(), 1),
(2, 'Meta de Frequência', 4, 'treinos', 'Semanal', NOW(), 2),
(3, 'Meta de Foco & Queima', 200, 'minutos', 'Semanal', NOW(), 3);
-- 8. Conquistas (Badges)
INSERT INTO conquista (id, nome, pontos) VALUES
(1, 'Primeiro Passo (Primeiro Treino)', 50),
(2, 'Constância de Fogo (7 dias seguidos)', 100),
(3, 'Guerreiro Escolar (10 treinos no mês)', 200);
-- 9. Conquistas dos Alunos
INSERT INTO aluno_conquista (id, alunos_id, conquista_id) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 2, 2),
(4, 3, 1),
(5, 3, 2),
(6, 3, 3);
-- 10. Treinos
INSERT INTO treino (id, nome, descricao) VALUES
(1, 'Circuito Funcional Escolar', 'Treino rápido com peso corporal para fazer em qualquer lugar.'),
(2, 'Cardio HIIT 15 Minutos', 'Exercícios intensos para melhorar o condicionamento e foco.'),
(3, 'Alongamento & Mobilidade', 'Ideal para relaxar a coluna após horas sentado nas aulas.');
-- 11. Treinos Atribuídos ao Aluno
INSERT INTO aluno_treino (id, alunos_id, treino_id) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 2, 2),
(4, 3, 1),
(5, 3, 2),
(6, 3, 3);
-- 12. Histórico de Treinos Realizados
INSERT INTO treino_realizados (id, realizado_em, treino_id, alunos_id, dia_da_semana) VALUES
(1, '2026-11-20 10:30:00', 1, 3, 'Sexta-feira'),
(2, '2026-11-22 15:45:00', 2, 3, 'Domingo'),
(3, '2026-11-23 09:15:00', 1, 2, 'Segunda-feira'),
(4, '2026-11-24 08:00:00', 3, 1, 'Terça-feira');
-- 13. Rotinas
INSERT INTO rotina (id, nome, descricao, secao_titulo, secao_descricao) VALUES
(1, 'Rotina Matinal Ativa', 'Treinos para despertar antes da primeira aula.', 'Manhã', 'Aquecimento corporal'),
(2, 'Rotina Pós-Escola', 'Descompressão e atividade moderada.', 'Tarde', 'Alongamento e cardio');
-- 14. Rotina Grupo Treino
INSERT INTO rotina_grupo_treino (id, treino_id, rotina_id) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 3, 2);
-- 15. Exercícios
INSERT INTO exercicio (id, nome, descricao, adaptacao) VALUES
(1, 'Polichinelo', 'Salto coordenado abrindo braços e pernas.', 'Sem salto, apenas afastando pernas alternadamente.'),
(2, 'Agachamento Livre', 'Flexão dos joelhos mantendo coluna reta.', 'Agachamento com apoio em cadeira.'),
(3, 'Flexão de Braços', 'Flexão no solo mantendo o core contraído.', 'Flexão com os joelhos apoiados no solo.'),
(4, 'Prancha Isométrica', 'Sustentação do tronco nos antebraços.', 'Prancha apoiada sobre os joelhos.');
-- 16. Treino Exercício (Composição da ficha)
INSERT INTO treino_exercicio (id, serie, repeticoes, treino_id, exercicio_id) VALUES
(1, 3, 20, 1, 1),
(2, 3, 15, 1, 2),
(3, 3, 10, 1, 3),
(4, 4, 30, 2, 1),
(5, 3, 40, 2, 4);
-- 17. Comunidades
INSERT INTO comunidade (id, nome, descricao, criada_em) VALUES
(1, 'Galera do 3º A Info', 'Comunidade da turma para trocar treinos e manter a sequência.', NOW()),
(2, 'Desafio MoveTec Geral', 'Comunidade geral de todos os alunos da ETEC de Campo Limpo Paulista.', NOW());
-- 18. Alunos na Comunidade
INSERT INTO comunidade_aluno (id, alunos_id, comunidade_id) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 3, 1),
(4, 3, 2),
(5, 4, 2);
-- 19. Administrador na Comunidade
INSERT INTO comunidade_administrador (id, administrador_id, comunidade_id) VALUES
(1, 1, 1),
(2, 3, 2);
-- 20. Mensagens
INSERT INTO mensagem (id, texto, enviada_em, alunos_id, administrador_id, comunidade_id) VALUES
(1, 'Bora treinar hoje galera? Já bati a meta de 30 min!', NOW() - INTERVAL 2 HOUR, 3, NULL, 1),
(2, 'Vou fazer o circuito daqui a pouco!', NOW() - INTERVAL 1 HOUR, 2, NULL, 1),
(3, 'Parabéns pela dedicação da turma nos treinos dessa semana!', NOW() - INTERVAL 30 MINUTE, NULL, 1, 1);
-- 21. Desafios
INSERT INTO desafio (id, nome, descricao) VALUES
(1, 'Semana Sem Sedentarismo', 'Faça ao menos 15 min de atividade por 5 dias'),
(2, 'Desafio dos 100 Polichinelos', 'Conclua 100 repetições acumuladas na semana');
-- 22. Atividades (Propostas pelos professores)
INSERT INTO atividade (id, adaptacao, data_entrega, criado_em, alunos_id, professor_id) VALUES
(1, 'Gravar 30 segundos executando o agachamento correto.', NOW() + INTERVAL 5 DAY, NOW(), 1, 3),
(2, 'Executar a sequência de mobilidade e registrar foto/vídeo.', NOW() + INTERVAL 7 DAY, NOW(), 2, 3),
(3, 'Avaliação prática de resistência: Prancha isométrica.', NOW() + INTERVAL 3 DAY, NOW(), 3, 1);

-- 23. Atividade Treino
INSERT INTO atividade_treino (id, concluido, treino_id, atividade_id) VALUES
(1, 1, 1, 1),
(2, 0, 3, 2),
(3, 1, 2, 3);

-- 24. Atividades Realizadas (Entregas e Validação)
INSERT INTO atividade_realizadas (id, realizado_em, id_atividade, alunos_id, campo_consentimento, status, feedback) VALUES
(1, NOW() - INTERVAL 1 DAY, 1, 1, 1, 'Aprovado', 'Excelente postura e amplitude no agachamento!'),
(2, NOW() - INTERVAL 2 HOUR, 3, 3, 1, 'Pendente', 'Aguardando validação do professor.');