import { ObjectId } from 'mongodb';
import { registrarTreinoConcluido } from './registroTreino.js';
import { verificarEConcluirRotina } from './rotina.js';

const NOME_COLECAO = 'execucoesTreino';
const NOME_COLECAO_TREINOS = 'treinos';
const NOME_COLECAO_EXERCICIOS = 'exercicios';

export async function iniciarExecucaoTreino(db, alunoId, treinoId, rotinaId) {
    if (!ObjectId.isValid(treinoId)) return { sucesso: false, erro: 'ID de treino inválido.' };

    const treino = await db.collection(NOME_COLECAO_TREINOS).findOne({ _id: new ObjectId(treinoId) });
    if (!treino) return { sucesso: false, erro: 'Treino não encontrado.' };

    const colecao = db.collection(NOME_COLECAO);
    const resultado = await colecao.insertOne({
        alunoId: new ObjectId(alunoId),
        treinoId: new ObjectId(treinoId),
        rotinaId: rotinaId && ObjectId.isValid(rotinaId) ? new ObjectId(rotinaId) : null,
        exercicios: treino.exercicios.map((ex) => ({ exercicioId: ex.exercicioId, concluido: false })),
        finalizada: false,
        criadaEm: new Date(),
    });

    return { sucesso: true, id: resultado.insertedId };
}

async function popularExecucao(db, execucao) {
    const treino = await db.collection(NOME_COLECAO_TREINOS).findOne({ _id: execucao.treinoId });
    const ids = execucao.exercicios.map((e) => e.exercicioId);
    const exerciciosEncontrados = await db.collection(NOME_COLECAO_EXERCICIOS).find({ _id: { $in: ids } }).toArray();
    const mapa = new Map(exerciciosEncontrados.map((e) => [e._id.toString(), e]));

    return {
        _id: execucao._id.toString(),
        titulo: treino?.titulo || 'Treino removido',
        rotinaId: execucao.rotinaId ? execucao.rotinaId.toString() : null,
        finalizada: execucao.finalizada,
        exercicios: execucao.exercicios.map((item) => ({
            exercicioId: item.exercicioId.toString(),
            concluido: item.concluido,
            exercicio: mapa.get(item.exercicioId.toString()) || null,
        })),
    };
}

export async function buscarExecucaoTreino(db, id, alunoId) {
    if (!ObjectId.isValid(id)) return null;
    const execucao = await db.collection(NOME_COLECAO).findOne({ _id: new ObjectId(id) });
    if (!execucao || execucao.alunoId.toString() !== alunoId.toString()) return null;
    return popularExecucao(db, execucao);
}

export async function alternarConclusaoExercicioTreino(db, execucaoId, alunoId, exercicioId) {
    if (!ObjectId.isValid(execucaoId)) return { sucesso: false, erro: 'ID inválido.' };

    const colecao = db.collection(NOME_COLECAO);
    const execucao = await colecao.findOne({ _id: new ObjectId(execucaoId) });
    if (!execucao) return { sucesso: false, erro: 'Execução não encontrada.' };
    if (execucao.alunoId.toString() !== alunoId.toString()) {
        return { sucesso: false, erro: 'Você não tem acesso a essa execução.' };
    }

    const novosExercicios = execucao.exercicios.map((item) =>
        item.exercicioId.toString() === exercicioId ? { ...item, concluido: true } : item
    );
    const todosConcluidos = novosExercicios.every((item) => item.concluido);

    await colecao.updateOne(
        { _id: new ObjectId(execucaoId) },
        { $set: { exercicios: novosExercicios, finalizada: todosConcluidos } }
    );

    if (todosConcluidos) {
        await registrarTreinoConcluido(
            db, alunoId, execucao.treinoId.toString(),
            execucao.rotinaId ? execucao.rotinaId.toString() : null
        );
        await verificarEConcluirRotina(
            db, alunoId, execucao.treinoId.toString(),
            execucao.rotinaId ? execucao.rotinaId.toString() : null
        );
    }

    const concluidosCount = novosExercicios.filter((i) => i.concluido).length;
    const progresso = Math.round((concluidosCount / novosExercicios.length) * 100);

    return { sucesso: true, progresso, finalizada: todosConcluidos };
}