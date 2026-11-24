import { ObjectId } from 'mongodb';

const NOME_COLECAO = 'metas';
const NOME_COLECAO_ATIVIDADES = 'atividades';
const NOME_COLECAO_REGISTROS_TREINO = 'registrosTreino';
const NOME_COLECAO_TREINOS = 'treinos';
const NOME_COLECAO_EXERCICIOS = 'exercicios';

const TIPOS_VALIDOS = ['tempo', 'atividades'];

function validarDados({ titulo, tipo, valorAlvo, prazo }) {
    const erros = [];
    if (!titulo || titulo.trim().length < 2) erros.push('Título da meta inválido.');
    if (!TIPOS_VALIDOS.includes(tipo)) erros.push('Tipo de meta inválido.');
    if (!valorAlvo || Number(valorAlvo) <= 0) erros.push('Informe um valor alvo maior que zero.');
    if (!prazo || isNaN(new Date(prazo).getTime())) erros.push('Informe um prazo válido.');
    return erros;
}

export async function cadastrarMeta(db, alunoId, dados) {
    const erros = validarDados(dados);
    if (erros.length > 0) return { sucesso: false, erros };

    const colecao = db.collection(NOME_COLECAO);
    const meta = {
        titulo: dados.titulo,
        tipo: dados.tipo, // 'tempo' (minutos) | 'atividades' (quantidade)
        valorAlvo: Number(dados.valorAlvo),
        prazo: new Date(dados.prazo),
        alunoId: new ObjectId(alunoId),
        criadaEm: new Date(),
        concluida: false,
        concluidaEm: null,
    };

    const resultado = await colecao.insertOne(meta);
    return { sucesso: true, id: resultado.insertedId };
}

async function contarAtividadesENoPeriodo(db, alunoId, inicio, fim) {
    const atividades = await db.collection(NOME_COLECAO_ATIVIDADES)
        .countDocuments({ alunoId, status: 'entregue', entregueEm: { $gte: inicio, $lte: fim } });
    const registros = await db.collection(NOME_COLECAO_REGISTROS_TREINO)
        .countDocuments({ alunoId, concluidoEm: { $gte: inicio, $lte: fim } });
    return atividades + registros;
}

async function somarSegundosNoPeriodo(db, alunoId, inicio, fim) {
    const colecaoAtividades = db.collection(NOME_COLECAO_ATIVIDADES);
    const resultadoAtividades = await colecaoAtividades.aggregate([
        { $match: { alunoId, status: 'entregue', entregueEm: { $gte: inicio, $lte: fim } } },
        { $unwind: { path: '$exercicios', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: NOME_COLECAO_EXERCICIOS,
                localField: 'exercicios.exercicioId',
                foreignField: '_id',
                as: 'exercicioInfo',
            },
        },
        { $unwind: { path: '$exercicioInfo', preserveNullAndEmptyArrays: true } },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$exercicioInfo.tempoEstimado', 0] } } } },
    ]).toArray();

    const colecaoRegistros = db.collection(NOME_COLECAO_REGISTROS_TREINO);
    const resultadoTreinos = await colecaoRegistros.aggregate([
        { $match: { alunoId, concluidoEm: { $gte: inicio, $lte: fim } } },
        {
            $lookup: {
                from: NOME_COLECAO_TREINOS,
                localField: 'treinoId',
                foreignField: '_id',
                as: 'treinoInfo',
            },
        },
        { $unwind: { path: '$treinoInfo', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$treinoInfo.exercicios', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: NOME_COLECAO_EXERCICIOS,
                localField: 'treinoInfo.exercicios.exercicioId',
                foreignField: '_id',
                as: 'exercicioInfo',
            },
        },
        { $unwind: { path: '$exercicioInfo', preserveNullAndEmptyArrays: true } },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$exercicioInfo.tempoEstimado', 0] } } } },
    ]).toArray();

    const totalSegundos = (resultadoAtividades[0]?.total || 0) + (resultadoTreinos[0]?.total || 0);
    return totalSegundos;
}

async function calcularValorAtual(db, meta) {
    const inicio = meta.criadaEm;
    const fim = meta.concluida && meta.concluidaEm ? meta.concluidaEm : new Date();

    if (meta.tipo === 'atividades') {
        return contarAtividadesENoPeriodo(db, meta.alunoId, inicio, fim);
    }

    const totalSegundos = await somarSegundosNoPeriodo(db, meta.alunoId, inicio, fim);
    return Math.round(totalSegundos / 60); // minutos
}

export async function listarMetasPorAluno(db, alunoId) {
    const colecao = db.collection(NOME_COLECAO);
    const metas = await colecao.find({ alunoId: new ObjectId(alunoId) }).sort({ criadaEm: -1 }).toArray();

    const metasComProgresso = [];
    for (const meta of metas) {
        const valorAtual = await calcularValorAtual(db, meta);
        let concluida = meta.concluida;
        let concluidaEm = meta.concluidaEm;

        if (!concluida && valorAtual >= meta.valorAlvo) {
            concluida = true;
            concluidaEm = new Date();
            await colecao.updateOne({ _id: meta._id }, { $set: { concluida: true, concluidaEm } });
        }

        metasComProgresso.push({
            _id: meta._id.toString(),
            titulo: meta.titulo,
            tipo: meta.tipo,
            valorAlvo: meta.valorAlvo,
            valorAtual,
            prazo: meta.prazo,
            concluida,
            concluidaEm,
            percentual: Math.min(Math.round((valorAtual / meta.valorAlvo) * 100), 100),
        });
    }

    return metasComProgresso;
}

export async function excluirMeta(db, id, alunoId) {
    if (!ObjectId.isValid(id)) return false;
    const colecao = db.collection(NOME_COLECAO);
    const resultado = await colecao.deleteOne({ _id: new ObjectId(id), alunoId: new ObjectId(alunoId) });
    return resultado.deletedCount > 0;
}

export async function atualizarMeta(db, id, alunoId, dados) {
    if (!ObjectId.isValid(id)) return { sucesso: false, erros: ['ID inválido.'] };

    const erros = validarDados(dados);
    if (erros.length > 0) return { sucesso: false, erros };

    const colecao = db.collection(NOME_COLECAO);
    const resultado = await colecao.updateOne(
        { _id: new ObjectId(id), alunoId: new ObjectId(alunoId) },
        {
            $set: {
                titulo: dados.titulo,
                tipo: dados.tipo,
                valorAlvo: Number(dados.valorAlvo),
                prazo: new Date(dados.prazo),
            },
        }
    );

    if (resultado.matchedCount === 0) {
        return { sucesso: false, erros: ['Meta não encontrada ou você não tem permissão para editá-la.'] };
    }
    return { sucesso: true };
}