import { ObjectId } from 'mongodb';

const NOME_COLECAO = 'avisos';

function validarDados({ titulo, descricao, data }) {
    const erros = [];
    if (!titulo || titulo.trim().length < 2) erros.push('Título do aviso inválido.');
    if (!descricao || descricao.trim().length < 5) erros.push('Descrição do aviso inválida.');
    if (!data || isNaN(new Date(data).getTime())) erros.push('Informe uma data válida.');
    return erros;
}

export async function cadastrarAviso(db, professorId, dados) {
    const erros = validarDados(dados);
    if (erros.length > 0) return { sucesso: false, erros };

    const colecao = db.collection(NOME_COLECAO);
    const aviso = {
        titulo: dados.titulo,
        descricao: dados.descricao,
        data: new Date(dados.data),
        salaId: dados.salaId ? new ObjectId(dados.salaId) : null, // null = geral
        professorId: new ObjectId(professorId),
        criadoEm: new Date(),
    };

    const resultado = await colecao.insertOne(aviso);
    return { sucesso: true, id: resultado.insertedId };
}

export async function listarAvisosPorProfessor(db, professorId) {
    const colecao = db.collection(NOME_COLECAO);
    return colecao.find({ professorId: new ObjectId(professorId) }).sort({ data: -1 }).toArray();
}

export async function excluirAviso(db, id, professorId) {
    if (!ObjectId.isValid(id)) return false;
    const colecao = db.collection(NOME_COLECAO);
    const resultado = await colecao.deleteOne({
        _id: new ObjectId(id),
        professorId: new ObjectId(professorId),
    });
    return resultado.deletedCount > 0;
}

export async function listarAvisosParaAluno(db, salaIdAluno, professorIdDaSala, idsOcultos = []) {
    const colecao = db.collection(NOME_COLECAO);

    const filtro = {
        $or: [
            { salaId: new ObjectId(salaIdAluno) },
            { salaId: null, professorId: new ObjectId(professorIdDaSala) },
        ],
    };

    if (idsOcultos.length > 0) {
        filtro._id = { $nin: idsOcultos.map((id) => new ObjectId(id)) };
    }

    return colecao.find(filtro).sort({ data: -1 }).toArray();
}

export async function buscarAvisoPorId(db, id) {
    if (!ObjectId.isValid(id)) return null;
    const colecao = db.collection(NOME_COLECAO);
    return colecao.findOne({ _id: new ObjectId(id) });
}

export async function atualizarAviso(db, id, professorId, dados) {
    const erros = validarDados(dados);
    if (erros.length > 0) return { sucesso: false, erros };

    const colecao = db.collection(NOME_COLECAO);
    const resultado = await colecao.updateOne(
        { _id: new ObjectId(id), professorId: new ObjectId(professorId) },
        {
            $set: {
                titulo: dados.titulo,
                descricao: dados.descricao,
                data: new Date(dados.data),
                salaId: dados.salaId ? new ObjectId(dados.salaId) : null,
            },
        }
    );

    if (resultado.matchedCount === 0) {
        return { sucesso: false, erros: ['Aviso não encontrado ou você não tem permissão para editá-lo.'] };
    }
    return { sucesso: true };
}