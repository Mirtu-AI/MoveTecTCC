import { ObjectId } from 'mongodb';

const NOME_COLECAO = 'atividadesAutonomas';

export async function registrarAtividadeAutonoma(db, alunoId, dados) {
    const colecao = db.collection(NOME_COLECAO);
    const { tipoAtividade, data, duracaoMinutos, observacoes } = dados;

    if (!tipoAtividade || typeof tipoAtividade !== 'string' || !tipoAtividade.trim()) {
        return { sucesso: false, erro: 'O tipo de atividade é obrigatório.' };
    }

    if (!data) {
        return { sucesso: false, erro: 'A data da atividade é obrigatória.' };
    }

    const duracaoNum = Number(duracaoMinutos);
    if (!duracaoMinutos || isNaN(duracaoNum) || duracaoNum <= 0) {
        return { sucesso: false, erro: 'A duração deve ser informada em minutos (número maior que zero).' };
    }

    const registro = {
        alunoId: new ObjectId(alunoId),
        tipoAtividade: tipoAtividade.trim(),
        data: new Date(data),
        duracaoMinutos: Math.round(duracaoNum),
        observacoes: observacoes && typeof observacoes === 'string' ? observacoes.trim() : '',
        criadoEm: new Date(),
    };

    const resultado = await colecao.insertOne(registro);

    return {
        sucesso: true,
        id: resultado.insertedId,
        atividade: {
            _id: resultado.insertedId.toString(),
            ...registro,
            alunoId: alunoId.toString(),
        },
    };
}

export async function listarAtividadesAutonomasPorAluno(db, alunoId) {
    const colecao = db.collection(NOME_COLECAO);

    const registros = await colecao
        .find({ alunoId: new ObjectId(alunoId) })
        .sort({ data: -1, criadoEm: -1 })
        .toArray();

    return registros.map((r) => ({
        _id: r._id.toString(),
        alunoId: r.alunoId.toString(),
        tipoAtividade: r.tipoAtividade,
        data: r.data,
        duracaoMinutos: r.duracaoMinutos,
        observacoes: r.observacoes || '',
        criadoEm: r.criadoEm,
    }));
}
