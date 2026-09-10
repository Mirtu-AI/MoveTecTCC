import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import {
    cadastrarProfessor,
    buscarProfessorPorEmail,
    buscarProfessorPorId,
    listarProfessores,
    excluirProfessor,
    atualizarEmailProfessor,
    atualizarSenhaProfessor,
    atualizarFotoProfessor,
    redefinirSenhaProfessor,
} from './models/professor.js';
import { buscarAdmPorEmail } from './models/admGeral.js';
import { autenticarAdm } from './middlewares/autenticarAdm.js';
import { autenticarProfessor } from './middlewares/autenticarProfessor.js';
import { autenticarAluno } from './middlewares/autenticarAluno.js';
import { calcularDesempenho } from './models/desempenho.js';
import { registrarTreinoConcluido, listarHistoricoPorAluno } from './models/registroTreino.js';
import { iniciarExecucao } from './models/execucaoAtividade.js';
import jwtParaTipos from 'jsonwebtoken';
import {
    cadastrarSala,
    listarSalas,
    listarSalasPorProfessor,
    buscarSalaPorId,
    atualizarSala,
    excluirSala,
} from './models/salas.js';
import {
    cadastrarAluno,
    listarAlunosPorSala,
    buscarAlunoPorId,
    buscarAlunoPorEmail,
    definirSenhaAluno,
    atualizarEmailAluno,
    excluirAluno,
    redefinirSenhaAluno,
    atualizarApelidoStreak,
    atualizarFotoAluno,
    atualizarPerfilSocial
} from './models/aluno.js';
import {
    cadastrarExercicio,
    listarExercicios,
    buscarExercicioPorId,
    atualizarExercicio,
    excluirExercicio,
} from './models/exercicio.js';
import {
    cadastrarTreino,
    atualizarTreino,
    listarTreinos,
    buscarTreinoPorId,
    excluirTreino,
} from './models/treino.js';
import {
    cadastrarAtividade,
    atualizarAtividade,
    listarAtividadesPorAluno,
    buscarAtividadePorId,
    alternarConclusaoExercicio,
    atualizarStatusAtividade,
    enviarArquivoAlternativo,
    cancelarEnvioArquivoAlternativo,
    excluirAtividade,
} from './models/atividade.js';
import {
    cadastrarRotina,
    atualizarRotina,
    listarRotinas,
    buscarRotinaPorId,
    excluirRotina,
    verificarEConcluirRotina,
} from './models/rotina.js';


dotenv.config();

function hashSenha(senha) {
    return crypto.createHash('sha256').update(senha).digest('hex');
}

function gerarSenhaAleatoria() {
    return crypto.randomBytes(6).toString('base64').replace(/[+/=]/g, '').slice(0, 8);
}

function autenticarProfessorOuAluno(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ success: false, erro: 'Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwtParaTipos.verify(token, process.env.JWT_SEGREDO);

        if (payload.tipo !== 'professor' && payload.tipo !== 'aluno') {
            return res.status(403).send({ success: false, erro: 'Acesso negado.' });
        }

        req.professorId = payload.tipo === 'professor' ? payload.id : null;
        req.alunoId = payload.tipo === 'aluno' ? payload.id : null;
        next();
    } catch (err) {
        return res.status(401).send({ success: false, erro: 'Token inválido ou expirado.' });
    }
}

async function main() {
    const hostname = 'localhost';
    const port = process.env.PORT || 3000;

    const app = express();

    app.use(express.json({ limit: '15mb' }))
    app.use(cors());

    const mongoUri = process.env.MONGO_URI;
    const client = new MongoClient(mongoUri);
    const db = client.db('app_tcc');
    async function garantirIndices(db) {
        await db.collection('atividades').createIndex({ alunoId: 1 });
        await db.collection('atividades').createIndex({ professorId: 1 });
        await db.collection('treinos').createIndex({ tipo: 1 });
        await db.collection('alunos').createIndex({ email: 1 }, { unique: true });
        await db.collection('registrosTreino').createIndex({ alunoId: 1 });
        await db.collection('rotinas').createIndex({ professorId: 1 });
        await db.collection('rotinas').createIndex({ 'grupos.treinos': 1 });
        await db.collection('registrosRotina').createIndex({ alunoId: 1 });
        console.log('Índices garantidos');
    }

    try {
        await client.connect();
        console.log('MongoDB conectado');
        await garantirIndices(db);
    } catch (err) {
        console.log('MongoDB não conectado (ok por enquanto):', err.message);
    }


    app.get('/', (req, res) => {
        res.send({
            success: true,
            statusCode: 200,
            body: 'Estamos funcionando, capitão',
        });
    });

    // ---------- PROFESSOR ----------

    app.post('/api/cadastro', autenticarAdm, async (req, res) => {
        try {
            const resultado = await cadastrarProfessor(db, req.body);

            if (!resultado.sucesso) {
                return res.status(400).send({
                    success: false,
                    statusCode: 400,
                    erros: resultado.erros,
                });
            }

            res.status(201).send({
                success: true,
                statusCode: 201,
                body: 'Professor cadastrado com sucesso!',
                id: resultado.id,
            });
        } catch (err) {
            console.error(err);
            res.status(500).send({
                success: false,
                statusCode: 500,
                body: 'Erro ao cadastrar professor.',
            });
        }
    });

    app.get('/api/professores', autenticarAdm, async (req, res) => {
        try {
            const professores = await listarProfessores(db);

            res.send({
                success: true,
                statusCode: 200,
                professores,
            });
        } catch (err) {
            console.error(err);
            res.status(500).send({
                success: false,
                statusCode: 500,
                erro: 'Erro ao buscar professores.',
            });
        }
    });

    app.get('/api/professores/:id', autenticarAdm, async (req, res) => {
        try {
            const professor = await buscarProfessorPorId(db, req.params.id);

            if (!professor) {
                return res.status(404).send({
                    success: false,
                    statusCode: 404,
                    erro: 'Professor não encontrado.',
                });
            }

            const salas = await listarSalasPorProfessor(db, req.params.id);

            res.send({
                success: true,
                statusCode: 200,
                professor: { ...professor, salas },
            });
        } catch (err) {
            console.error(err);
            res.status(500).send({
                success: false,
                statusCode: 500,
                erro: 'Erro ao buscar professor.',
            });
        }
    });

    app.put('/api/professores/:id', autenticarAdm, async (req, res) => {
        try {
            const { email } = req.body;
            const resultado = await atualizarEmailProfessor(db, req.params.id, email);

            if (!resultado.sucesso) {
                return res.status(400).send({
                    success: false,
                    statusCode: 400,
                    erro: resultado.erro,
                });
            }

            res.send({
                success: true,
                statusCode: 200,
                body: 'E-mail atualizado com sucesso.',
            });
        } catch (err) {
            console.error(err);
            res.status(500).send({
                success: false,
                statusCode: 500,
                erro: 'Erro ao atualizar professor.',
            });
        }
    });

    app.delete('/api/professores/:id', autenticarAdm, async (req, res) => {
        try {
            const excluido = await excluirProfessor(db, req.params.id);

            if (!excluido) {
                return res.status(404).send({
                    success: false,
                    statusCode: 404,
                    erro: 'Professor não encontrado.',
                });
            }

            res.send({
                success: true,
                statusCode: 200,
                body: 'Professor excluído com sucesso.',
            });
        } catch (err) {
            console.error(err);
            res.status(500).send({
                success: false,
                statusCode: 500,
                erro: 'Erro ao excluir professor.',
            });
        }
    });

    app.get('/api/professor/perfil', autenticarProfessor, async (req, res) => {
        try {
            const professor = await buscarProfessorPorId(db, req.professorId);

            if (!professor) {
                return res.status(404).send({
                    success: false,
                    statusCode: 404,
                    erro: 'Professor não encontrado.',
                });
            }

            res.send({
                success: true,
                statusCode: 200,
                professor,
            });
        } catch (err) {
            console.error(err);
            res.status(500).send({
                success: false,
                statusCode: 500,
                erro: 'Erro ao buscar perfil.',
            });
        }
    });

    app.put('/api/professor/senha', autenticarProfessor, async (req, res) => {
        try {
            const { senhaAtual, novaSenha } = req.body;
            const resultado = await atualizarSenhaProfessor(db, req.professorId, senhaAtual, novaSenha);

            if (!resultado.sucesso) {
                return res.status(400).send({
                    success: false,
                    statusCode: 400,
                    erro: resultado.erro,
                });
            }

            res.send({
                success: true,
                statusCode: 200,
                body: 'Senha alterada com sucesso.',
            });
        } catch (err) {
            console.error(err);
            res.status(500).send({
                success: false,
                statusCode: 500,
                erro: 'Erro ao alterar senha.',
            });
        }
    });

    app.put('/api/professor/foto', autenticarProfessor, async (req, res) => {
        try {
            const { foto } = req.body;
            const resultado = await atualizarFotoProfessor(db, req.professorId, foto);

            if (!resultado.sucesso) {
                return res.status(400).send({
                    success: false,
                    statusCode: 400,
                    erro: resultado.erro,
                });
            }

            res.send({
                success: true,
                statusCode: 200,
                body: 'Foto atualizada com sucesso.',
            });
        } catch (err) {
            console.error(err);
            res.status(500).send({
                success: false,
                statusCode: 500,
                erro: 'Erro ao atualizar foto.',
            });
        }
    });

    // ---------- SALAS ----------

    app.post('/api/salas', autenticarAdm, async (req, res) => {
        try {
            const resultado = await cadastrarSala(db, req.body);
            if (!resultado.sucesso) {
                return res.status(400).send({ success: false, erros: resultado.erros });
            }
            res.status(201).send({ success: true, id: resultado.id });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao cadastrar sala.' });
        }
    });

    app.get('/api/salas', autenticarAdm, async (req, res) => {
        try {
            const salas = await listarSalas(db);
            res.send({ success: true, salas });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao buscar salas.' });
        }
    });

    app.get('/api/professor/salas', autenticarProfessor, async (req, res) => {
        try {
            const salas = await listarSalasPorProfessor(db, req.professorId);
            res.send({ success: true, salas });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao buscar salas.' });
        }
    });

    app.get('/api/professor/salas/:id', autenticarProfessor, async (req, res) => {
        try {
            const sala = await buscarSalaPorId(db, req.params.id);

            if (!sala) {
                return res.status(404).send({ success: false, erro: 'Sala não encontrada.' });
            }

            if (sala.professorId?.toString() !== req.professorId) {
                return res.status(403).send({ success: false, erro: 'Você não tem acesso a essa sala.' });
            }

            const alunos = await listarAlunosPorSala(db, req.params.id);

            res.send({ success: true, sala: { ...sala, alunos } });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao buscar sala.' });
        }
    });

    app.get('/api/professor/alunos/:id', autenticarProfessor, async (req, res) => {
        try {
            const aluno = await buscarAlunoPorId(db, req.params.id);

            if (!aluno) {
                return res.status(404).send({ success: false, erro: 'Aluno não encontrado.' });
            }

            const sala = await buscarSalaPorId(db, aluno.salaId);

            if (!sala || sala.professorId?.toString() !== req.professorId) {
                return res.status(403).send({ success: false, erro: 'Você não tem acesso a esse aluno.' });
            }

            res.send({ success: true, aluno: { ...aluno, salaNome: sala.nome } });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao buscar aluno.' });
        }
    });

    app.get('/api/salas/:id', autenticarAdm, async (req, res) => {
        try {
            const sala = await buscarSalaPorId(db, req.params.id);
            if (!sala) {
                return res.status(404).send({ success: false, erro: 'Sala não encontrada.' });
            }

            const alunos = await listarAlunosPorSala(db, req.params.id);

            res.send({ success: true, sala: { ...sala, alunos } });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao buscar sala.' });
        }
    });

    app.put('/api/salas/:id', autenticarAdm, async (req, res) => {
        try {
            const resultado = await atualizarSala(db, req.params.id, req.body);
            if (!resultado.sucesso) {
                return res.status(400).send({ success: false, erros: resultado.erros });
            }
            res.send({ success: true, body: 'Sala atualizada com sucesso.' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao atualizar sala.' });
        }
    });

    app.delete('/api/salas/:id', autenticarAdm, async (req, res) => {
        try {
            const excluido = await excluirSala(db, req.params.id);
            if (!excluido) {
                return res.status(404).send({ success: false, erro: 'Sala não encontrada.' });
            }
            res.send({ success: true, body: 'Sala excluída com sucesso.' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao excluir sala.' });
        }
    });

    // ---------- ALUNOS ----------

    app.post('/api/salas/:id/alunos', autenticarAdm, async (req, res) => {
        try {
            const resultado = await cadastrarAluno(db, req.params.id, req.body);

            if (!resultado.sucesso) {
                return res.status(400).send({ success: false, erros: resultado.erros });
            }

            res.status(201).send({ success: true, id: resultado.id });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao cadastrar aluno.' });
        }
    });

    app.put('/api/alunos/:id', autenticarAdm, async (req, res) => {
        try {
            const { email } = req.body;
            const resultado = await atualizarEmailAluno(db, req.params.id, email);

            if (!resultado.sucesso) {
                return res.status(400).send({ success: false, erro: resultado.erro });
            }

            res.send({ success: true, body: 'E-mail atualizado com sucesso.' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao atualizar aluno.' });
        }
    });

    app.delete('/api/alunos/:id', autenticarAdm, async (req, res) => {
        try {
            const excluido = await excluirAluno(db, req.params.id);

            if (!excluido) {
                return res.status(404).send({ success: false, erro: 'Aluno não encontrado.' });
            }

            res.send({ success: true, body: 'Aluno excluído com sucesso.' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao excluir aluno.' });
        }
    });

    app.post('/api/primeiro-acesso', async (req, res) => {
        try {
            const { email, novaSenha } = req.body;
            const resultado = await definirSenhaAluno(db, email, novaSenha);

            if (!resultado.sucesso) {
                return res.status(400).send({ success: false, erro: resultado.erro });
            }

            res.send({ success: true, body: 'Senha definida com sucesso! Faça login.' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao definir senha.' });
        }
    });
    app.put('/api/aluno/apelido-streak', autenticarAluno, async (req, res) => {
        try {
            const { apelido } = req.body;
            const resultado = await atualizarApelidoStreak(db, req.alunoId, apelido);

            if (!resultado.sucesso) {
                return res.status(400).send({ success: false, erro: resultado.erro });
            }

            res.send({ success: true, body: 'Apelido atualizado com sucesso.' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao atualizar apelido.' });
        }
    });

    app.put('/api/aluno/foto', autenticarAluno, async (req, res) => {
        try {
            const { foto } = req.body;
            const resultado = await atualizarFotoAluno(db, req.alunoId, foto);

            if (!resultado.sucesso) {
                return res.status(400).send({ success: false, erro: resultado.erro });
            }

            res.send({ success: true, body: 'Foto atualizada com sucesso.' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao atualizar foto.' });
        }
    });

    app.put('/api/aluno/perfil-social', autenticarAluno, async (req, res) => {
        try {
            const { nomeSocial, descricao } = req.body;
            const resultado = await atualizarPerfilSocial(db, req.alunoId, { nomeSocial, descricao });

            if (!resultado.sucesso) {
                return res.status(400).send({ success: false, erros: resultado.erros, erro: resultado.erro });
            }

            res.send({ success: true, body: 'Perfil atualizado com sucesso.' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao atualizar perfil.' });
        }
    });

    // ---------- EXERCÍCIOS ----------

    app.post('/api/professor/exercicios', autenticarProfessor, async (req, res) => {
        try {
            const resultado = await cadastrarExercicio(db, req.professorId, req.body);

            if (!resultado.sucesso) {
                return res.status(400).send({ success: false, erros: resultado.erros });
            }

            res.status(201).send({ success: true, id: resultado.id });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao cadastrar exercício.' });
        }
    });

    app.get('/api/exercicios', autenticarProfessor, async (req, res) => {
        try {
            const exercicios = await listarExercicios(db);
            res.send({ success: true, exercicios });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao buscar exercícios.' });
        }
    });

    app.get('/api/exercicios/:id', autenticarProfessorOuAluno, async (req, res) => {
        try {
            const exercicio = await buscarExercicioPorId(db, req.params.id);

            if (!exercicio) {
                return res.status(404).send({ success: false, erro: 'Exercício não encontrado.' });
            }

            res.send({ success: true, exercicio });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao buscar exercício.' });
        }
    });

    app.put('/api/professor/exercicios/:id', autenticarProfessor, async (req, res) => {
        try {
            const resultado = await atualizarExercicio(db, req.params.id, req.professorId, req.body);

            if (!resultado.sucesso) {
                return res.status(400).send({ success: false, erros: resultado.erros });
            }

            res.send({ success: true, body: 'Exercício atualizado com sucesso.' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao atualizar exercício.' });
        }
    });

    app.delete('/api/professor/exercicios/:id', autenticarProfessor, async (req, res) => {
        try {
            const excluido = await excluirExercicio(db, req.params.id, req.professorId);

            if (!excluido) {
                return res.status(404).send({
                    success: false,
                    erro: 'Exercício não encontrado ou você não tem permissão para excluí-lo.',
                });
            }

            res.send({ success: true, body: 'Exercício excluído com sucesso.' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao excluir exercício.' });
        }
    });

    // ---------- TREINOS ----------

    app.post('/api/professor/treinos', autenticarProfessor, async (req, res) => {
        try {
            const resultado = await cadastrarTreino(db, req.professorId, req.body);

            if (!resultado.sucesso) {
                return res.status(400).send({ success: false, erros: resultado.erros });
            }

            res.status(201).send({ success: true, id: resultado.id });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao cadastrar treino.' });
        }
    });

    app.put('/api/professor/treinos/:id', autenticarProfessor, async (req, res) => {
        try {
            // Chamada ajustada: removeu req.professorId como parâmetro necessário de validação
            const resultado = await atualizarTreino(db, req.params.id, req.professorId, req.body);

            if (!resultado.sucesso) {
                return res.status(400).send({ success: false, erros: resultado.erros });
            }

            res.send({ success: true, body: 'Treino atualizado com sucesso.' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao atualizar treino.' });
        }
    });

    app.get('/api/treinos', autenticarProfessor, async (req, res) => {
        try {
            const treinos = await listarTreinos(db);
            res.send({ success: true, treinos });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao buscar treinos.' });
        }
    });

    app.get('/api/treinos/:id', autenticarProfessor, async (req, res) => {
        try {
            const treino = await buscarTreinoPorId(db, req.params.id);

            if (!treino) {
                return res.status(404).send({ success: false, erro: 'Treino não encontrado.' });
            }

            res.send({ success: true, treino });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao buscar treino.' });
        }
    });

    app.delete('/api/professor/treinos/:id', autenticarProfessor, async (req, res) => {
        try {
            // Chamada ajustada: passa apenas db e req.params.id para o modelo
            const excluido = await excluirTreino(db, req.params.id);

            if (!excluido) {
                return res.status(404).send({
                    success: false,
                    erro: 'Treino não encontrado.',
                });
            }

            res.send({ success: true, body: 'Treino excluído com sucesso.' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao excluir treino.' });
        }
    });

    // ---------- ATIVIDADES ----------

    app.post('/api/professor/alunos/:alunoId/atividades', autenticarProfessor, async (req, res) => {
        try {
            const aluno = await buscarAlunoPorId(db, req.params.alunoId);
            if (!aluno) {
                return res.status(404).send({ success: false, erro: 'Aluno não encontrado.' });
            }

            const sala = await buscarSalaPorId(db, aluno.salaId);
            if (!sala || sala.professorId?.toString() !== req.professorId) {
                return res.status(403).send({ success: false, erro: 'Você não tem acesso a esse aluno.' });
            }

            const resultado = await cadastrarAtividade(db, req.professorId, req.params.alunoId, req.body);

            if (!resultado.sucesso) {
                return res.status(400).send({ success: false, erros: resultado.erros });
            }

            res.status(201).send({ success: true, id: resultado.id });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao cadastrar atividade.' });
        }
    });

    app.get('/api/professor/alunos/:alunoId/atividades', autenticarProfessor, async (req, res) => {
        try {
            const aluno = await buscarAlunoPorId(db, req.params.alunoId);
            if (!aluno) {
                return res.status(404).send({ success: false, erro: 'Aluno não encontrado.' });
            }

            const sala = await buscarSalaPorId(db, aluno.salaId);
            if (!sala || sala.professorId?.toString() !== req.professorId) {
                return res.status(403).send({ success: false, erro: 'Você não tem acesso a esse aluno.' });
            }

            const atividades = await listarAtividadesPorAluno(db, req.params.alunoId);
            res.send({ success: true, atividades });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao buscar atividades.' });
        }
    });

    app.get('/api/atividades/:id', autenticarProfessor, async (req, res) => {
        try {
            const atividade = await buscarAtividadePorId(db, req.params.id);

            if (!atividade) {
                return res.status(404).send({ success: false, erro: 'Atividade não encontrada.' });
            }

            const aluno = await buscarAlunoPorId(db, atividade.alunoId);
            const sala = aluno ? await buscarSalaPorId(db, aluno.salaId) : null;

            if (!sala || sala.professorId?.toString() !== req.professorId) {
                return res.status(403).send({ success: false, erro: 'Você não tem acesso a essa atividade.' });
            }

            res.send({ success: true, atividade });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao buscar atividade.' });
        }
    });

    app.put('/api/professor/atividades/:id', autenticarProfessor, async (req, res) => {
        try {
            const resultado = await atualizarAtividade(db, req.params.id, req.professorId, req.body);

            if (!resultado.sucesso) {
                return res.status(400).send({ success: false, erros: resultado.erros });
            }

            res.send({ success: true, body: 'Atividade atualizada com sucesso.' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao atualizar atividade.' });
        }
    });

    app.put('/api/professor/atividades/:id/status', autenticarProfessor, async (req, res) => {
        try {
            const atividade = await buscarAtividadePorId(db, req.params.id);
            if (!atividade) {
                return res.status(404).send({ success: false, erro: 'Atividade não encontrada.' });
            }

            const aluno = await buscarAlunoPorId(db, atividade.alunoId);
            const sala = aluno ? await buscarSalaPorId(db, aluno.salaId) : null;

            if (!sala || sala.professorId?.toString() !== req.professorId) {
                return res.status(403).send({ success: false, erro: 'Você não tem acesso a essa atividade.' });
            }

            const { status } = req.body;
            const resultado = await atualizarStatusAtividade(db, req.params.id, status);

            if (!resultado.sucesso) {
                return res.status(400).send({ success: false, erro: resultado.erro });
            }

            res.send({ success: true, body: 'Status atualizado com sucesso.' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao atualizar status.' });
        }
    });

    app.delete('/api/professor/atividades/:id', autenticarProfessor, async (req, res) => {
        try {
            const excluido = await excluirAtividade(db, req.params.id, req.professorId);

            if (!excluido) {
                return res.status(404).send({
                    success: false,
                    erro: 'Atividade não encontrada ou você não tem permissão para excluí-la.',
                });
            }

            res.send({ success: true, body: 'Atividade excluída com sucesso.' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao excluir atividade.' });
        }
    });

    app.get('/api/aluno/atividades', autenticarAluno, async (req, res) => {
        try {
            const atividades = await listarAtividadesPorAluno(db, req.alunoId);
            res.send({ success: true, atividades });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao buscar atividades.' });
        }
    });

    app.get('/api/aluno/atividades/:id', autenticarAluno, async (req, res) => {
        try {
            const atividade = await buscarAtividadePorId(db, req.params.id);

            if (!atividade) {
                return res.status(404).send({ success: false, erro: 'Atividade não encontrada.' });
            }

            if (atividade.alunoId.toString() !== req.alunoId) {
                return res.status(403).send({ success: false, erro: 'Você não tem acesso a essa atividade.' });
            }

            res.send({ success: true, atividade });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao buscar atividade.' });
        }
    });

    app.put('/api/aluno/atividades/:id/status', autenticarAluno, async (req, res) => {
        try {
            const atividade = await buscarAtividadePorId(db, req.params.id);

            if (!atividade) {
                return res.status(404).send({ success: false, erro: 'Atividade não encontrada.' });
            }

            if (atividade.alunoId.toString() !== req.alunoId) {
                return res.status(403).send({ success: false, erro: 'Você não tem acesso a essa atividade.' });
            }

            const { status } = req.body;
            const resultado = await atualizarStatusAtividade(db, req.params.id, status);

            if (!resultado.sucesso) {
                return res.status(400).send({ success: false, erro: resultado.erro });
            }

            res.send({ success: true, body: 'Status atualizado com sucesso.' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao atualizar status.' });
        }
    });

    app.put('/api/aluno/atividades/:id/arquivo-alternativo', autenticarAluno, async (req, res) => {
        try {
            const { arquivo, nomeArquivo } = req.body;
            const resultado = await enviarArquivoAlternativo(db, req.params.id, req.alunoId, arquivo, nomeArquivo);

            if (!resultado.sucesso) {
                return res.status(400).send({ success: false, erro: resultado.erro });
            }

            res.send({ success: true, body: 'Arquivo enviado com sucesso.' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao enviar arquivo.' });
        }
    });

    app.delete('/api/aluno/atividades/:id/arquivo-alternativo', autenticarAluno, async (req, res) => {
        try {
            const resultado = await cancelarEnvioArquivoAlternativo(db, req.params.id, req.alunoId);

            if (!resultado.sucesso) {
                return res.status(400).send({ success: false, erro: resultado.erro });
            }

            res.send({ success: true, body: 'Envio cancelado com sucesso.' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao cancelar envio.' });
        }
    });

    app.get('/api/aluno/perfil', autenticarAluno, async (req, res) => {
        try {
            const aluno = await buscarAlunoPorId(db, req.alunoId);

            if (!aluno) {
                return res.status(404).send({ success: false, erro: 'Aluno não encontrado.' });
            }

            res.send({ success: true, aluno });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao buscar perfil.' });
        }
    });
    app.get('/api/aluno/desempenho', autenticarAluno, async (req, res) => {
        try {
            const desempenho = await calcularDesempenho(db, req.alunoId);
            res.send({ success: true, desempenho });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao calcular desempenho.' });
        }
    });
    app.get('/api/aluno/treinos', autenticarAluno, async (req, res) => {
        try {
            const apenasEspecificas = req.query.tipo === 'especifica';
            const treinos = await listarTreinos(db, apenasEspecificas);
            res.send({ success: true, treinos });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao buscar treinos.' });
        }
    });

    app.post('/api/aluno/treinos/:id/concluir', autenticarAluno, async (req, res) => {
        try {
            const treino = await buscarTreinoPorId(db, req.params.id);
            if (!treino) return res.status(404).send({ success: false, erro: 'Treino não encontrado.' });

            const resultado = await registrarTreinoConcluido(db, req.alunoId, req.params.id);
            await verificarEConcluirRotina(db, req.alunoId, req.params.id); // <-- novo

            res.send({ success: true, streakAtual: resultado.streakAtual });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao registrar treino concluído.' });
        }
    });

    app.get('/api/aluno/historico', autenticarAluno, async (req, res) => {
        try {
            const historico = await listarHistoricoPorAluno(db, req.alunoId);
            res.send({ success: true, historico });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao buscar histórico.' });
        }
    });

    app.put('/api/aluno/atividades/:id/exercicios/:exercicioId', autenticarAluno, async (req, res) => {
        try {
            const resultado = await alternarConclusaoExercicio(
                db,
                req.params.id,
                req.alunoId,
                req.params.exercicioId
            );

            if (!resultado.sucesso) {
                return res.status(400).send({ success: false, erro: resultado.erro });
            }

            res.send({
                success: true,
                progresso: resultado.progresso,
                status: resultado.status
            });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao atualizar exercício.' });
        }
    });

    app.post('/api/aluno/atividades/:id/iniciar', autenticarAluno, async (req, res) => {
        try {
            const resultado = await iniciarExecucao(db, req.params.id, req.alunoId);

            if (!resultado.sucesso) {
                return res.status(400).send({ success: false, erro: resultado.erro });
            }

            res.send({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao iniciar execução.' });
        }
    });

    // ---------- ROTINAS (professor) ----------

    app.post('/api/professor/rotinas', autenticarProfessor, async (req, res) => {
        try {
            const resultado = await cadastrarRotina(db, req.professorId, req.body);
            if (!resultado.sucesso) return res.status(400).send({ success: false, erros: resultado.erros });
            res.status(201).send({ success: true, id: resultado.id });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao cadastrar rotina.' });
        }
    });

    app.put('/api/professor/rotinas/:id', autenticarProfessor, async (req, res) => {
        try {
            const resultado = await atualizarRotina(db, req.params.id, req.professorId, req.body);
            if (!resultado.sucesso) return res.status(400).send({ success: false, erros: resultado.erros });
            res.send({ success: true, body: 'Rotina atualizada com sucesso.' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao atualizar rotina.' });
        }
    });

    app.delete('/api/professor/rotinas/:id', autenticarProfessor, async (req, res) => {
        try {
            const excluido = await excluirRotina(db, req.params.id, req.professorId);
            if (!excluido) {
                return res.status(404).send({ success: false, erro: 'Rotina não encontrada ou você não tem permissão para excluí-la.' });
            }
            res.send({ success: true, body: 'Rotina excluída com sucesso.' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao excluir rotina.' });
        }
    });

    app.get('/api/rotinas', autenticarProfessor, async (req, res) => {
        try {
            const rotinas = await listarRotinas(db);
            res.send({ success: true, rotinas });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao buscar rotinas.' });
        }
    });

    app.get('/api/rotinas/:id', autenticarProfessor, async (req, res) => {
        try {
            const rotina = await buscarRotinaPorId(db, req.params.id);
            if (!rotina) return res.status(404).send({ success: false, erro: 'Rotina não encontrada.' });
            res.send({ success: true, rotina });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao buscar rotina.' });
        }
    });

    // ---------- ROTINAS (aluno) ----------

    app.get('/api/aluno/rotinas', autenticarAluno, async (req, res) => {
        try {
            const rotinas = await listarRotinas(db);
            res.send({ success: true, rotinas });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao buscar rotinas.' });
        }
    });

    app.get('/api/aluno/rotinas/:id', autenticarAluno, async (req, res) => {
        try {
            const rotina = await buscarRotinaPorId(db, req.params.id);
            if (!rotina) return res.status(404).send({ success: false, erro: 'Rotina não encontrada.' });
            res.send({ success: true, rotina });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao buscar rotina.' });
        }
    });

    // ---------- ESQUECI A SENHA ----------

    app.post('/api/esqueci-senha', async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).send({ success: false, erro: 'Informe um e-mail.' });
            }

            const novaSenha = gerarSenhaAleatoria();

            const professorAtualizado = await redefinirSenhaProfessor(db, email, novaSenha);
            if (professorAtualizado) {
                return res.send({ success: true, senha: novaSenha });
            }

            const alunoAtualizado = await redefinirSenhaAluno(db, email, novaSenha);
            if (alunoAtualizado) {
                return res.send({ success: true, senha: novaSenha });
            }

            res.status(404).send({ success: false, erro: 'E-mail não encontrado.' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ success: false, erro: 'Erro ao redefinir senha.' });
        }
    });


    // ---------- LOGIN ----------

    app.post('/api/login', async (req, res) => {
        try {
            const { email, senha } = req.body;
            const senhaHash = hashSenha(senha);

            const adm = await buscarAdmPorEmail(db, email);
            if (adm && senhaHash === adm.senha) {
                const token = jwt.sign({ id: adm._id, tipo: 'adm' }, process.env.JWT_SEGREDO, { expiresIn: '7d' });
                return res.send({
                    success: true,
                    statusCode: 200,
                    token,
                    tipo: 'adm',
                });
            }

            const professor = await buscarProfessorPorEmail(db, email);
            if (professor && senhaHash === professor.senha) {
                const token = jwt.sign({ id: professor._id, tipo: 'professor' }, process.env.JWT_SEGREDO, { expiresIn: '7d' });
                return res.send({
                    success: true,
                    statusCode: 200,
                    token,
                    tipo: 'professor',
                });
            }

            const aluno = await buscarAlunoPorEmail(db, email);
            if (aluno && aluno.senha !== null && senhaHash === aluno.senha) {
                const token = jwt.sign({ id: aluno._id, tipo: 'aluno' }, process.env.JWT_SEGREDO, { expiresIn: '7d' });
                return res.send({
                    success: true,
                    statusCode: 200,
                    token,
                    tipo: 'aluno',
                });
            }

            if (aluno && aluno.senha === null) {
                return res.status(400).send({
                    success: false,
                    statusCode: 400,
                    erro: 'Você ainda não definiu sua senha. Use "Primeiro acesso".',
                });
            }

            return res.status(400).send({
                success: false,
                statusCode: 400,
                erro: 'E-mail ou senha inválidos.',
            });
        } catch (err) {
            console.error(err);
            res.status(500).send({
                success: false,
                statusCode: 500,
                erro: 'Erro ao fazer login.',
            });
        }
    });

    app.listen(port, () => {
        console.log(`Server rodando em: http://${hostname}:${port}`);
    });
}

main().catch((err) => {
    console.error('Erro fatal ao iniciar o servidor:', err);
    process.exit(1);
});