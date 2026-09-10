import { ObjectId } from 'mongodb';

const NOME_COLECAO = 'atividades';
const NOME_COLECAO_EXERCICIOS = 'exercicios';

const EXTENSOES_PERMITIDAS = ['.docx', '.pdf', '.pptx'];

function validarExercicios(exercicioIds) {
    return Array.isArray(exercicioIds) && exercicioIds.length > 0 && exercicioIds.every((id) => ObjectId.isValid(id));
}

function validarDataEntrega(dataEntrega) {
    if (!dataEntrega) return false;
    const data = new Date(dataEntrega);
    return !isNaN(data.getTime());
}

function validarDados({ titulo, descricao, exercicios, dataEntrega, permiteArquivoAlternativo }) {
    const erros = [];

    if (!titulo || titulo.trim().length < 2) {
        erros.push('Título da atividade inválido.');
    }
    if (!descricao || descricao.trim().length < 5) {
        erros.push('Descrição da atividade inválida.');
    }

    // Só exige e valida os exercícios se NÃO for um meio avaliativo alternativo
    if (!permiteArquivoAlternativo && !validarExercicios(exercicios)) {
        erros.push('Selecione ao menos um exercício válido.');
    }

    if (!validarDataEntrega(dataEntrega)) {
        erros.push('Informe uma data de entrega válida.');
    }

    return erros;
}
function montarExercicios(exercicioIds) {
    return exercicioIds.map((id) => ({
        exercicioId: new ObjectId(id),
        concluido: false,
    }));
}
export async function cadastrarAtividade(db, professorId, alunoId, dados) {
    if (!ObjectId.isValid(alunoId) || !ObjectId.isValid(professorId)) {
        return { sucesso: false, erros: ['ID de aluno ou professor inválido.'] };
    }

    const erros = validarDados(dados);
    if (erros.length > 0) {
        return { sucesso: false, erros };
    }

    const colecao = db.collection(NOME_COLECAO);

    const atividade = {
        titulo: dados.titulo,
        descricao: dados.descricao,
        midiaUrl: dados.midiaUrl || null,
        exercicios: montarExercicios(dados.exercicios),
        dataEntrega: new Date(dados.dataEntrega),
        permiteArquivoAlternativo: Boolean(dados.permiteArquivoAlternativo),
        arquivoAlternativoAluno: null,
        alunoId: new ObjectId(alunoId),
        professorId: new ObjectId(professorId),
        status: 'andamento',
        criadoEm: new Date(),
    };

    const resultado = await colecao.insertOne(atividade);

    return { sucesso: true, id: resultado.insertedId };
}

export async function atualizarAtividade(db, id, professorId, dados) {
    if (!ObjectId.isValid(id) || !ObjectId.isValid(professorId)) {
        return { sucesso: false, erros: ['ID inválido.'] };
    }

    const erros = validarDados(dados);
    if (erros.length > 0) {
        return { sucesso: false, erros };
    }

    const colecao = db.collection(NOME_COLECAO);

    const resultado = await colecao.updateOne(
        { _id: new ObjectId(id), professorId: new ObjectId(professorId) },
        {
            $set: {
                titulo: dados.titulo,
                descricao: dados.descricao,
                midiaUrl: dados.midiaUrl || null,
                exercicios: montarExercicios(dados.exercicios),
                status: 'andamento',
                dataEntrega: new Date(dados.dataEntrega),
                permiteArquivoAlternativo: Boolean(dados.permiteArquivoAlternativo),
            },
        }
    );

    if (resultado.matchedCount === 0) {
        return {
            sucesso: false,
            erros: ['Atividade não encontrada ou você não tem permissão para editá-la.'],
        };
    }

    return { sucesso: true };
}

function calcularProgresso(exercicios) {
    if (!exercicios || exercicios.length === 0) return 0;
    const concluidos = exercicios.filter((ex) => ex.concluido).length;
    return Math.round((concluidos / exercicios.length) * 100);
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
                            concluido: '$$item.concluido',
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

export async function listarAtividadesPorAluno(db, alunoId) {
    if (!ObjectId.isValid(alunoId)) return [];

    const colecao = db.collection(NOME_COLECAO);

    const pipeline = montarPipelinePopularExercicios({ alunoId: new ObjectId(alunoId) });
    pipeline.splice(1, 0, { $sort: { criadoEm: -1 } }); // ordena logo após o $match

    const atividades = await colecao.aggregate(pipeline).toArray();

    return atividades.map((atividade) => ({
        ...atividade,
        progresso: calcularProgresso(atividade.exercicios),
    }));
}

export async function buscarAtividadePorId(db, id) {
    if (!ObjectId.isValid(id)) return null;

    const colecao = db.collection(NOME_COLECAO);
    const pipeline = montarPipelinePopularExercicios({ _id: new ObjectId(id) });

    const resultado = await colecao.aggregate(pipeline).toArray();
    if (resultado.length === 0) return null;

    const atividade = resultado[0];
    return { ...atividade, progresso: calcularProgresso(atividade.exercicios) };
}
export async function alternarConclusaoExercicio(db, atividadeId, alunoId, exercicioId) {
    if (!ObjectId.isValid(atividadeId) || !ObjectId.isValid(exercicioId)) {
        return { sucesso: false, erro: 'ID inválido.' };
    }

    const colecao = db.collection(NOME_COLECAO);

    const atividade = await colecao.findOne({ _id: new ObjectId(atividadeId) });
    if (!atividade) {
        return { sucesso: false, erro: 'Atividade não encontrada.' };
    }
    if (atividade.alunoId.toString() !== alunoId.toString()) {
        return { sucesso: false, erro: 'Você não tem acesso a essa atividade.' };
    }

    const novosExercicios = atividade.exercicios.map((item) =>
        item.exercicioId.toString() === exercicioId
            ? { ...item, concluido: !item.concluido }
            : item
    );

    const todosConcluidos = novosExercicios.every((item) => item.concluido);
    const novoStatus = todosConcluidos ? 'entregue' : 'andamento';

    const camposParaAtualizar = { exercicios: novosExercicios, status: novoStatus };
    if (novoStatus === 'entregue') {
        camposParaAtualizar.entregueEm = new Date();
    }

    await colecao.updateOne(
        { _id: new ObjectId(atividadeId) },
        { $set: camposParaAtualizar }
    );

    return {
        sucesso: true,
        progresso: calcularProgresso(novosExercicios),
        status: novoStatus,
    };
}

export async function atualizarStatusAtividade(db, id, novoStatus) {
    if (!ObjectId.isValid(id)) {
        return { sucesso: false, erro: 'ID de atividade inválido.' };
    }

    if (!['andamento', 'entregue'].includes(novoStatus)) {
        return { sucesso: false, erro: 'Status inválido.' };
    }

    const colecao = db.collection(NOME_COLECAO);
    const camposParaAtualizar = { status: novoStatus };
    if (novoStatus === 'entregue') {
        camposParaAtualizar.entregueEm = new Date();
    }

    const resultado = await colecao.updateOne(
        { _id: new ObjectId(id) },
        { $set: camposParaAtualizar }
    );

    if (resultado.matchedCount === 0) {
        return { sucesso: false, erro: 'Atividade não encontrada.' };
    }

    return { sucesso: true };
}

export async function enviarArquivoAlternativo(db, id, alunoId, arquivoBase64, nomeArquivo) {
    if (!ObjectId.isValid(id) || !ObjectId.isValid(alunoId)) {
        return { sucesso: false, erro: 'ID inválido.' };
    }

    const extensao = nomeArquivo
        ? nomeArquivo.slice(nomeArquivo.lastIndexOf('.')).toLowerCase()
        : '';

    if (!EXTENSOES_PERMITIDAS.includes(extensao)) {
        return { sucesso: false, erro: 'Formato inválido. Envie um arquivo .docx, .pdf ou .pptx.' };
    }

    const colecao = db.collection(NOME_COLECAO);

    const atividade = await colecao.findOne({ _id: new ObjectId(id) });
    if (!atividade) {
        return { sucesso: false, erro: 'Atividade não encontrada.' };
    }
    if (atividade.alunoId.toString() !== alunoId.toString()) {
        return { sucesso: false, erro: 'Você não tem acesso a essa atividade.' };
    }
    if (!atividade.permiteArquivoAlternativo) {
        return { sucesso: false, erro: 'Essa atividade não aceita envio de arquivo alternativo.' };
    }

    await colecao.updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                arquivoAlternativoAluno: { arquivo: arquivoBase64, nome: nomeArquivo },
                status: 'entregue',
                entregueEm: new Date(),
            },
        }
    );

    return { sucesso: true };
}

export async function cancelarEnvioArquivoAlternativo(db, id, alunoId) {
    if (!ObjectId.isValid(id)) {
        return { sucesso: false, erro: 'ID inválido.' };
    }

    const colecao = db.collection(NOME_COLECAO);

    const atividade = await colecao.findOne({ _id: new ObjectId(id) });
    if (!atividade) {
        return { sucesso: false, erro: 'Atividade não encontrada.' };
    }
    if (atividade.alunoId.toString() !== alunoId.toString()) {
        return { sucesso: false, erro: 'Você não tem acesso a essa atividade.' };
    }
    if (!atividade.arquivoAlternativoAluno) {
        return { sucesso: false, erro: 'Nenhum arquivo foi enviado ainda.' };
    }
    if (new Date() > new Date(atividade.dataEntrega)) {
        return { sucesso: false, erro: 'O prazo de entrega já passou. Não é possível cancelar o envio.' };
    }

    await colecao.updateOne(
        { _id: new ObjectId(id) },
        { $set: { arquivoAlternativoAluno: null, status: 'andamento' }, $unset: { entregueEm: '' } }
    );

    return { sucesso: true };
}

export async function excluirAtividade(db, id, professorId) {
    if (!ObjectId.isValid(id) || !ObjectId.isValid(professorId)) return false;

    const colecao = db.collection(NOME_COLECAO);
    const resultado = await colecao.deleteOne({
        _id: new ObjectId(id),
        professorId: new ObjectId(professorId),
    });

    return resultado.deletedCount > 0;
}