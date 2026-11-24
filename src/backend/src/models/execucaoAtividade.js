import { ObjectId } from 'mongodb';

const NOME_COLECAO = 'atividades';

export async function iniciarExecucao(db, atividadeId, alunoId) {
    const colecao = db.collection(NOME_COLECAO);

    const atividade = await colecao.findOne({ _id: new ObjectId(atividadeId) });
    if (!atividade) {
        return { sucesso: false, erro: 'Atividade não encontrada.' };
    }
    if (atividade.alunoId.toString() !== alunoId.toString()) {
        return { sucesso: false, erro: 'Você não tem acesso a essa atividade.' };
    }

    if (!atividade.iniciadaEm) {
        await colecao.updateOne(
            { _id: new ObjectId(atividadeId) },
            { $set: { iniciadaEm: new Date() } }
        );
    }

    return { sucesso: true };
}