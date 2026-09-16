import { ObjectId } from 'mongodb';

const NOME_COLECAO = 'registrosTreino';
const NOME_COLECAO_ALUNOS = 'alunos';
const NOME_COLECAO_TREINOS = 'treinos';
const NOME_COLECAO_ROTINAS = 'rotinas';

function inicioDoDia(data) {
    const d = new Date(data);
    d.setHours(0, 0, 0, 0);
    return d;
}

function diferencaEmDias(dataMaisRecente, dataMaisAntiga) {
    const umDiaEmMs = 24 * 60 * 60 * 1000;
    return Math.round((inicioDoDia(dataMaisRecente) - inicioDoDia(dataMaisAntiga)) / umDiaEmMs);
}

export async function registrarTreinoConcluido(db, alunoId, treinoId, rotinaId = null) {
    const colecaoRegistros = db.collection(NOME_COLECAO);
    const colecaoAlunos = db.collection(NOME_COLECAO_ALUNOS);

    const agora = new Date();

    await colecaoRegistros.insertOne({
        alunoId: new ObjectId(alunoId),
        treinoId: new ObjectId(treinoId),
        rotinaId: rotinaId && ObjectId.isValid(rotinaId) ? new ObjectId(rotinaId) : null, // <-- novo
        concluidoEm: agora,
    });

    const aluno = await colecaoAlunos.findOne({ _id: new ObjectId(alunoId) });
    const streakAtual = aluno?.streakAtual || 0;
    const ultimoTreinoData = aluno?.ultimoTreinoData || null;
    const maiorStreakAtual = aluno?.maiorStreak || 0;

    let novoStreak;

    if (!ultimoTreinoData) {
        novoStreak = 1;
    } else {
        const diffDias = diferencaEmDias(agora, ultimoTreinoData);

        if (diffDias === 0) {
            novoStreak = streakAtual || 1;
        } else if (diffDias <= 3) {
            novoStreak = streakAtual + 1;
        } else {
            novoStreak = 1;
        }
    }

    const novoMaiorStreak = Math.max(novoStreak, maiorStreakAtual); // <-- novo

    await colecaoAlunos.updateOne(
        { _id: new ObjectId(alunoId) },
        { $set: { streakAtual: novoStreak, ultimoTreinoData: agora, maiorStreak: novoMaiorStreak } }
    );

    return { sucesso: true, streakAtual: novoStreak, maiorStreak: novoMaiorStreak };
}

export async function listarHistoricoPorAluno(db, alunoId) {
    const colecao = db.collection(NOME_COLECAO);

    const pipeline = [
        { $match: { alunoId: new ObjectId(alunoId) } },
        { $sort: { concluidoEm: -1 } },
        {
            $lookup: {
                from: NOME_COLECAO_TREINOS,
                localField: 'treinoId',
                foreignField: '_id',
                as: 'treinoInfo',
            },
        },
        { $unwind: { path: '$treinoInfo', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                treinoId: 1,
                rotinaId: 1, // <-- agora vem direto do registro, não de um lookup
                dataConclusao: '$concluidoEm',
                titulo: { $ifNull: ['$treinoInfo.titulo', 'Treino removido'] },
                especifica: { $ifNull: ['$treinoInfo.especifica', false] },
            },
        },
    ];

    const registros = await colecao.aggregate(pipeline).toArray();

    return registros.map((r) => ({
        treinoId: r.treinoId.toString(),
        dataConclusao: r.dataConclusao,
        titulo: r.titulo,
        especifica: r.especifica,
        rotinaId: r.rotinaId ? r.rotinaId.toString() : null,
    }));
}