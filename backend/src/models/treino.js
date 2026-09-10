import { ObjectId } from 'mongodb';

const NOME_COLECAO = 'treinos';
const NOME_COLECAO_EXERCICIOS = 'exercicios';
const TIPOS_VALIDOS = ['rotina', 'especifica'];

function validarItensExercicios(itens) {
    if (!Array.isArray(itens) || itens.length === 0) {
        return false;
    }

    return itens.every((item) => item.exercicioId && item.series && item.repeticoes);
}

// TIPOS_VALIDOS não é mais necessário, pode remover essa constante

function validarDados({ titulo, descricao, exercicios }) {
    const erros = [];
    if (!titulo || titulo.trim().length < 2) erros.push('Título do treino inválido.');
    if (!descricao || descricao.trim().length < 5) erros.push('Descrição do treino inválida.');
    if (!validarItensExercicios(exercicios)) {
        erros.push('Selecione ao menos um exercício e informe séries e repetições.');
    }
    return erros;
}

export async function cadastrarTreino(db, professorId, dados) {
    const erros = validarDados(dados);
    if (erros.length > 0) return { sucesso: false, erros };

    const colecao = db.collection(NOME_COLECAO);
    const treino = {
        titulo: dados.titulo,
        descricao: dados.descricao,
        midiaUrl: dados.midiaUrl || null,
        especifica: Boolean(dados.especifica),
        exercicios: montarItensExercicios(dados.exercicios),
        professorId: new ObjectId(professorId),
        criadoEm: new Date(),
    };

    const resultado = await colecao.insertOne(treino);
    return { sucesso: true, id: resultado.insertedId };
}

export async function atualizarTreino(db, id, professorId, dados) {
    const erros = validarDados(dados);
    if (erros.length > 0) return { sucesso: false, erros };

    const colecao = db.collection(NOME_COLECAO);
    const resultado = await colecao.updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                titulo: dados.titulo,
                descricao: dados.descricao,
                midiaUrl: dados.midiaUrl || null,
                exercicios: montarItensExercicios(dados.exercicios),
                especifica: Boolean(dados.especifica),
            },
        }
    );

    if (resultado.matchedCount === 0) {
        return { sucesso: false, erros: ['Treino não encontrado.'] };
    }
    return { sucesso: true };
}

// listarTreinos passa a filtrar só por "especifica" (usado pelo aluno)
export async function listarTreinos(db, apenasEspecificas = false) {
    const colecao = db.collection(NOME_COLECAO);
    const filtro = apenasEspecificas ? { especifica: true } : {};

    const treinos = await colecao.find(filtro).sort({ criadoEm: -1 }).toArray();
    return popularExercicios(db, treinos);
}

function montarPipelinePopularExercicios(filtro) {
    return [
        { $match: filtro },
        {
            $lookup: {
                from: NOME_COLECAO_EXERCICIOS,
                localField: 'exercicios.exercicioId',
                foreignField: '_id',
                as: 'exerciciosPopulados',
            },
        },
        {
            $addFields: {
                exercicios: {
                    $map: {
                        input: '$exercicios',
                        as: 'item',
                        in: {
                            exercicioId: '$$item.exercicioId',
                            series: '$$item.series',
                            repeticoes: '$$item.repeticoes',
                            exercicio: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: '$exerciciosPopulados',
                                            as: 'ex',
                                            cond: { $eq: ['$$ex._id', '$$item.exercicioId'] },
                                        },
                                    },
                                    0,
                                ],
                            },
                        },
                    },
                },
            },
        },
        { $project: { exerciciosPopulados: 0 } },
    ];
}

export async function buscarTreinoPorId(db, id) {
    if (!ObjectId.isValid(id)) return null;

    const colecao = db.collection(NOME_COLECAO);
    const pipeline = montarPipelinePopularExercicios({ _id: new ObjectId(id) });

    const resultado = await colecao.aggregate(pipeline).toArray();
    return resultado[0] || null;
}

export async function excluirTreino(db, id) {
    const colecao = db.collection(NOME_COLECAO);
    // Remove o filtro do professorId para permitir exclusão global
    const resultado = await colecao.deleteOne({
        _id: new ObjectId(id),
    });
    return resultado.deletedCount > 0;
}