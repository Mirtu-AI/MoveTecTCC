import { ObjectId } from 'mongodb';

const NOME_COLECAO = 'comunidades';

function validarDadosTematica({ nome, descricao }) {
    const erros = [];
    if (!nome || nome.trim().length < 2) erros.push('Nome da comunidade inválido.');
    if (!descricao || descricao.trim().length < 5) erros.push('Descrição da comunidade inválida.');
    return erros;
}

export async function cadastrarComunidadeGeral(db, salaId, professorId, nomeSala) {
    const colecao = db.collection(NOME_COLECAO);

    const jaExiste = await colecao.findOne({ tipo: 'geral', salaId: new ObjectId(salaId) });
    if (jaExiste) return { sucesso: true, id: jaExiste._id }; // idempotente

    const comunidade = {
        nome: nomeSala, // <-- agora usa o nome da sala em vez de texto fixo
        descricao: `Comunidade oficial da sala ${nomeSala}.`,
        tipo: 'geral',
        salaId: new ObjectId(salaId),
        criadorId: new ObjectId(professorId),
        criadorTipo: 'professor',
        adminId: new ObjectId(professorId),
        adminTipo: 'professor',
        membros: [],
        criadaEm: new Date(),
    };

    const resultado = await colecao.insertOne(comunidade);
    return { sucesso: true, id: resultado.insertedId };
}

export async function cadastrarComunidadeTematica(db, criadorId, criadorTipo, dados) {
    const erros = validarDadosTematica(dados);
    if (erros.length > 0) return { sucesso: false, erros };

    const colecao = db.collection(NOME_COLECAO);
    const comunidade = {
        nome: dados.nome,
        descricao: dados.descricao,
        tipo: 'tematica',
        salaId: null,
        criadorId: new ObjectId(criadorId),
        criadorTipo, // 'aluno' | 'professor'
        adminId: new ObjectId(criadorId),
        adminTipo: criadorTipo,
        membros: [{ id: new ObjectId(criadorId), tipo: criadorTipo }], // criador já entra como membro
        criadaEm: new Date(),
    };

    const resultado = await colecao.insertOne(comunidade);
    return { sucesso: true, id: resultado.insertedId };
}

export async function adicionarAlunoNaComunidadeGeral(db, salaId, alunoId) {
    const colecao = db.collection(NOME_COLECAO);
    await colecao.updateOne(
        { tipo: 'geral', salaId: new ObjectId(salaId) },
        { $addToSet: { membros: { id: new ObjectId(alunoId), tipo: 'aluno' } } }
    );
}

export async function entrarComunidade(db, comunidadeId, membroId, membroTipo) {
    if (!ObjectId.isValid(comunidadeId)) return { sucesso: false, erro: 'ID inválido.' };

    const colecao = db.collection(NOME_COLECAO);
    const comunidade = await colecao.findOne({ _id: new ObjectId(comunidadeId) });
    if (!comunidade) return { sucesso: false, erro: 'Comunidade não encontrada.' };
    if (comunidade.tipo === 'geral') {
        return { sucesso: false, erro: 'Não é possível entrar manualmente numa comunidade geral.' };
    }

    await colecao.updateOne(
        { _id: new ObjectId(comunidadeId) },
        { $addToSet: { membros: { id: new ObjectId(membroId), tipo: membroTipo } } }
    );

    return { sucesso: true };
}

export async function sairComunidade(db, comunidadeId, membroId) {
    if (!ObjectId.isValid(comunidadeId)) return { sucesso: false, erro: 'ID inválido.' };

    const colecao = db.collection(NOME_COLECAO);
    const comunidade = await colecao.findOne({ _id: new ObjectId(comunidadeId) });
    if (!comunidade) return { sucesso: false, erro: 'Comunidade não encontrada.' };
    if (comunidade.tipo === 'geral') {
        return { sucesso: false, erro: 'Não é possível sair da comunidade geral da sua sala.' };
    }
    if (comunidade.adminId.toString() === membroId.toString()) {
        return { sucesso: false, erro: 'O administrador não pode sair da própria comunidade. Exclua-a se desejar.' };
    }

    await colecao.updateOne(
        { _id: new ObjectId(comunidadeId) },
        { $pull: { membros: { id: new ObjectId(membroId) } } }
    );

    return { sucesso: true };
}

export async function listarComunidadesTematicas(db) {
    const colecao = db.collection(NOME_COLECAO);
    const comunidades = await colecao.find({ tipo: 'tematica' }).sort({ criadaEm: -1 }).toArray();
    return comunidades.map((c) => ({
        _id: c._id.toString(),
        nome: c.nome,
        descricao: c.descricao,
        totalMembros: c.membros.length,
        criadorTipo: c.criadorTipo,
    }));
}

export async function listarComunidadesDoAluno(db, alunoId, salaId) {
    const colecao = db.collection(NOME_COLECAO);

    const geral = salaId
        ? await colecao.findOne({ tipo: 'geral', salaId: new ObjectId(salaId) })
        : null;

    const tematicasDoAluno = await colecao
        .find({ tipo: 'tematica', 'membros.id': new ObjectId(alunoId) })
        .sort({ criadaEm: -1 })
        .toArray();

    const mapear = (c) => ({
        _id: c._id.toString(),
        nome: c.nome,
        descricao: c.descricao,
        tipo: c.tipo,
        totalMembros: c.membros.length,
    });

    return {
        geral: geral ? mapear(geral) : null,
        tematicas: tematicasDoAluno.map(mapear),
    };
}

export async function buscarComunidadePorId(db, id) {
    if (!ObjectId.isValid(id)) return null;
    const colecao = db.collection(NOME_COLECAO);
    const comunidade = await colecao.findOne({ _id: new ObjectId(id) });
    if (!comunidade) return null;

    return {
        _id: comunidade._id.toString(),
        nome: comunidade.nome,
        descricao: comunidade.descricao,
        tipo: comunidade.tipo,
        salaId: comunidade.salaId ? comunidade.salaId.toString() : null,
        adminId: comunidade.adminId.toString(),
        adminTipo: comunidade.adminTipo,
        totalMembros: comunidade.membros.length,
    };
}

export async function souMembro(db, comunidadeId, membroId) {
    if (!ObjectId.isValid(comunidadeId)) return false;
    const colecao = db.collection(NOME_COLECAO);
    const comunidade = await colecao.findOne({
        _id: new ObjectId(comunidadeId),
        'membros.id': new ObjectId(membroId),
    });
    return Boolean(comunidade);
}

export async function excluirComunidadeTematica(db, id, adminId) {
    if (!ObjectId.isValid(id)) return false;
    const colecao = db.collection(NOME_COLECAO);
    const resultado = await colecao.deleteOne({
        _id: new ObjectId(id),
        tipo: 'tematica',
        adminId: new ObjectId(adminId),
    });
    return resultado.deletedCount > 0;
}

export async function podeAcessarComunidade(db, comunidadeId, userId, userTipo) {
    if (!ObjectId.isValid(comunidadeId)) return false;

    const colecao = db.collection(NOME_COLECAO);
    const comunidade = await colecao.findOne({ _id: new ObjectId(comunidadeId) });
    if (!comunidade) return false;

    if (comunidade.tipo === 'geral') {
        if (userTipo === 'professor') {
            return comunidade.adminId.toString() === userId.toString();
        }
        // aluno: precisa estar na coleção de membros (populada automaticamente ao ser cadastrado na sala)
        return comunidade.membros.some((m) => m.id.toString() === userId.toString());
    }

    // temática: qualquer um que já entrou (incluindo o criador)
    return comunidade.membros.some((m) => m.id.toString() === userId.toString());
}

export async function listarComunidadesDoProfessor(db, professorId) {
    const colecao = db.collection(NOME_COLECAO);

    const gerais = await colecao.find({ tipo: 'geral', adminId: new ObjectId(professorId) }).toArray();
    const tematicas = await colecao
        .find({ tipo: 'tematica', 'membros.id': new ObjectId(professorId) })
        .sort({ criadaEm: -1 })
        .toArray();

    const mapear = (c) => ({
        _id: c._id.toString(),
        nome: c.nome,
        descricao: c.descricao,
        tipo: c.tipo,
        totalMembros: c.membros.length,
    });

    return {
        gerais: gerais.map(mapear), // um professor pode ter várias salas, por isso é lista
        tematicas: tematicas.map(mapear),
    };
}