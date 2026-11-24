import { ObjectId } from 'mongodb';

const NOME_COLECAO = 'salas';

function validarDados({ nome }) {
    const erros = [];

    if (!nome || nome.trim().length < 1) {
        erros.push('Nome da sala é obrigatório.');
    }

    return erros;
}

export async function cadastrarSala(db, dados) {
    const erros = validarDados(dados);
    if (erros.length > 0) {
        return { sucesso: false, erros };
    }

    const colecao = db.collection(NOME_COLECAO);

    const jaExiste = await colecao.findOne({ nome: dados.nome });
    if (jaExiste) {
        return { sucesso: false, erros: ['Já existe uma sala com esse nome.'] };
    }

    const sala = {
        nome: dados.nome,
        professorId: dados.professorId ? new ObjectId(dados.professorId) : null,
        criadoEm: new Date(),
    };

    const resultado = await colecao.insertOne(sala);

    return { sucesso: true, id: resultado.insertedId };
}

export async function listarSalas(db) {
    const colecao = db.collection(NOME_COLECAO);
    return colecao.find({}).toArray();
}

export async function listarSalasPorProfessor(db, professorId) {
    const colecao = db.collection(NOME_COLECAO);
    return colecao.find({ professorId: new ObjectId(professorId) }).toArray();
}

export async function buscarSalaPorId(db, id) {
    const colecao = db.collection(NOME_COLECAO);
    return colecao.findOne({ _id: new ObjectId(id) });
}

export async function atualizarSala(db, id, dados) {
    const erros = validarDados(dados);
    if (erros.length > 0) {
        return { sucesso: false, erros };
    }

    const colecao = db.collection(NOME_COLECAO);

    const jaExiste = await colecao.findOne({
        nome: dados.nome,
        _id: { $ne: new ObjectId(id) },
    });
    if (jaExiste) {
        return { sucesso: false, erros: ['Já existe uma sala com esse nome.'] };
    }

    const resultado = await colecao.updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                nome: dados.nome,
                professorId: dados.professorId ? new ObjectId(dados.professorId) : null,
            },
        }
    );

    if (resultado.matchedCount === 0) {
        return { sucesso: false, erros: ['Sala não encontrada.'] };
    }

    return { sucesso: true };
}

export async function excluirSala(db, id) {
    const colecao = db.collection(NOME_COLECAO);
    const resultado = await colecao.deleteOne({ _id: new ObjectId(id) });
    return resultado.deletedCount > 0;
}