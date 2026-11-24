import { ObjectId } from 'mongodb';

const NOME_COLECAO = 'exercicios';

function validarDados({ nome, orientacoes, tempoEstimado }) {
    const erros = [];

    if (!nome || nome.trim().length < 2) {
        erros.push('Nome do exercício inválido.');
    }
    if (!orientacoes || orientacoes.trim().length < 5) {
        erros.push('Adicione uma orientação para a execução do exercício.');
    }
    if (tempoEstimado !== undefined && tempoEstimado !== null && tempoEstimado !== '') {
        const numero = Number(tempoEstimado);
        if (isNaN(numero) || numero <= 0) {
            erros.push('Tempo estimado precisa ser um número maior que zero.');
        }
    }

    return erros;
}

export async function cadastrarExercicio(db, professorId, dados) {
    const erros = validarDados(dados);
    if (erros.length > 0) {
        return { sucesso: false, erros };
    }

    const colecao = db.collection(NOME_COLECAO);

    const exercicio = {
        nome: dados.nome,
        midiaUrl: dados.midiaUrl || null,
        orientacoes: dados.orientacoes,
        adaptacoes: dados.adaptacoes || '',
        tempoEstimado: dados.tempoEstimado ? Number(dados.tempoEstimado) : null,
        professorId: new ObjectId(professorId),
        criadoEm: new Date(),
    };

    const resultado = await colecao.insertOne(exercicio);

    return { sucesso: true, id: resultado.insertedId };
}

export async function listarExercicios(db) {
    const colecao = db.collection(NOME_COLECAO);
    return colecao.find({}).sort({ nome: 1 }).toArray();
}

export async function buscarExercicioPorId(db, id) {
    const colecao = db.collection(NOME_COLECAO);
    return colecao.findOne({ _id: new ObjectId(id) });
}

export async function atualizarExercicio(db, id, professorId, dados) {
    const erros = validarDados(dados);
    if (erros.length > 0) {
        return { sucesso: false, erros };
    }

    const colecao = db.collection(NOME_COLECAO);

    // Atualiza buscando apenas pelo ID do exercício (qualquer professor pode editar)
    const resultado = await colecao.updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                nome: dados.nome,
                midiaUrl: dados.midiaUrl || null,
                orientacoes: dados.orientacoes,
                adaptacoes: dados.adaptacoes || '',
                tempoEstimado: dados.tempoEstimado ? Number(dados.tempoEstimado) : null,
            },
        }
    );

    if (resultado.matchedCount === 0) {
        return {
            sucesso: false,
            erros: ['Exercício não encontrado.'],
        };
    }

    return { sucesso: true };
}

export async function excluirExercicio(db, id) {
    const colecao = db.collection(NOME_COLECAO);
    // Exclui buscando apenas pelo ID do exercício
    const resultado = await colecao.deleteOne({ _id: new ObjectId(id) });
    return resultado.deletedCount > 0;
}