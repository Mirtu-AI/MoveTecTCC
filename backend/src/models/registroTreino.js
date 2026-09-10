import { ObjectId } from 'mongodb';

const NOME_COLECAO = 'registrosTreino';
const NOME_COLECAO_ALUNOS = 'alunos';

function inicioDoDia(data) {
    const d = new Date(data);
    d.setHours(0, 0, 0, 0);
    return d;
}

function diferencaEmDias(dataMaisRecente, dataMaisAntiga) {
    const umDiaEmMs = 24 * 60 * 60 * 1000;
    return Math.round((inicioDoDia(dataMaisRecente) - inicioDoDia(dataMaisAntiga)) / umDiaEmMs);
}

export async function registrarTreinoConcluido(db, alunoId, treinoId) {
    const colecaoRegistros = db.collection(NOME_COLECAO);
    const colecaoAlunos = db.collection(NOME_COLECAO_ALUNOS);

    const agora = new Date();

    await colecaoRegistros.insertOne({
        alunoId: new ObjectId(alunoId),
        treinoId: new ObjectId(treinoId),
        concluidoEm: agora,
    });

    const aluno = await colecaoAlunos.findOne({ _id: new ObjectId(alunoId) });
    const streakAtual = aluno?.streakAtual || 0;
    const ultimoTreinoData = aluno?.ultimoTreinoData || null;

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

    await colecaoAlunos.updateOne(
        { _id: new ObjectId(alunoId) },
        { $set: { streakAtual: novoStreak, ultimoTreinoData: agora } }
    );

    return { sucesso: true, streakAtual: novoStreak };
}
export async function listarHistoricoPorAluno(db, alunoId) {
    const colecao = db.collection(NOME_COLECAO);
    const registros = await colecao
        .find({ alunoId: new ObjectId(alunoId) })
        .sort({ concluidoEm: -1 })
        .toArray();

    return registros.map((registro) => ({
        treinoId: registro.treinoId.toString(),
        dataConclusao: registro.concluidoEm,
    }));
}