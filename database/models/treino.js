import { ObjectId } from 'mongodb';

const NOME_COLECAO = 'treinos';
const NOME_COLECAO_EXERCICIOS = 'exercicios';
const TIPOS_VALIDOS = ['rotina', 'especifica'];

function validarItensExercicios(itens) {
    if (!Array.isArray(itens) || itens.length === 0) {
        return false;
    }

    return itens.every((item) => {
        if (!item.exercicioId) return false;
        const formato = item.formatoMedida || 'repeticoes';
        const temSeries = item.series && String(item.series).trim().length > 0;
        const temRepeticoes = item.repeticoes && String(item.repeticoes).trim().length > 0;
        const temTempo = item.tempo && String(item.tempo).trim().length > 0;
        const temDistancia = item.distancia && String(item.distancia).trim().length > 0;
        const temNotas = item.notas && String(item.notas).trim().length > 0;

        if (formato === 'repeticoes') return temSeries && temRepeticoes;
        if (formato === 'tempo') return temSeries && temTempo;
        if (formato === 'distancia') return temDistancia || temTempo;
        if (formato === 'livre') return temNotas || temTempo || temRepeticoes;
        return temSeries || temRepeticoes || temTempo;
    });
}

function validarDados({ titulo, descricao, exercicios }) {
    const erros = [];
    if (!titulo || titulo.trim().length < 2) erros.push('Título do treino inválido.');
    if (!descricao || descricao.trim().length < 5) erros.push('Descrição do treino inválida.');
    if (!validarItensExercicios(exercicios)) {
        erros.push('Preencha os campos obrigatórios do tipo de medida selecionado para cada exercício.');
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
        objetivos: Array.isArray(dados.objetivos) ? dados.objetivos : [],
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
                objetivos: Array.isArray(dados.objetivos) ? dados.objetivos : [],
            },
        }
    );

    if (resultado.matchedCount === 0) {
        return { sucesso: false, erros: ['Treino não encontrado.'] };
    }
    return { sucesso: true };
}

// listarTreinos passa a filtrar só por "especifica" (usado pelo aluno)
export async function listarTreinos(db, apenasEspecificas = false, objetivo = null) {
    const colecao = db.collection(NOME_COLECAO);
    const filtro = apenasEspecificas ? { especifica: true } : {};

    const pipeline = montarPipelinePopularExercicios(filtro);
    pipeline.splice(1, 0, { $sort: { criadoEm: -1 } });

    const treinos = await colecao.aggregate(pipeline).toArray();

    if (objetivo && objetivo !== 'sem-objetivo') {
        return [
            ...treinos.filter((t) => Array.isArray(t.objetivos) && t.objetivos.includes(objetivo)),
            ...treinos.filter((t) => !Array.isArray(t.objetivos) || !t.objetivos.includes(objetivo)),
        ];
    }
    return treinos;
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
                            formatoMedida: '$$item.formatoMedida',
                            series: '$$item.series',
                            repeticoes: '$$item.repeticoes',
                            tempo: '$$item.tempo',
                            distancia: '$$item.distancia',
                            descanso: '$$item.descanso',
                            carga: '$$item.carga',
                            notas: '$$item.notas',
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

function montarItensExercicios(itens) {
    return itens.map((item) => {
        const formato = item.formatoMedida || 'repeticoes';
        return {
            exercicioId: new ObjectId(item.exercicioId),
            formatoMedida: formato,
            series: (formato === 'repeticoes' || formato === 'tempo') && item.series ? String(item.series).trim() : '',
            repeticoes: formato === 'repeticoes' && item.repeticoes ? String(item.repeticoes).trim() : '',
            tempo: (formato === 'tempo' || formato === 'distancia' || formato === 'livre') && item.tempo ? String(item.tempo).trim() : '',
            distancia: formato === 'distancia' && item.distancia ? String(item.distancia).trim() : '',
            descanso: item.descanso ? String(item.descanso).trim() : '',
            carga: (formato === 'repeticoes' || formato === 'tempo') && item.carga ? String(item.carga).trim() : '',
            notas: item.notas ? String(item.notas).trim() : '',
        };
    });
}