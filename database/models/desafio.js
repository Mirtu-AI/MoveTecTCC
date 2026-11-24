import { ObjectId } from 'mongodb';

const NOME_COLECAO = 'desafios';
const UMA_SEMANA_MS = 7 * 24 * 60 * 60 * 1000;

function validarDados({ titulo, descricao }) {
    const erros = [];
    if (!titulo || titulo.trim().length < 2) erros.push('Título do desafio inválido.');
    if (!descricao || descricao.trim().length < 5) erros.push('Descrição do desafio inválida.');
    return erros;
}

export async function podeCriarDesafio(db, comunidadeId, criadorId, criadorTipo, comunidadeTipo) {
    // Comunidade geral: só o professor admin pode criar
    if (comunidadeTipo === 'geral' && criadorTipo !== 'professor') {
        return { pode: false, erro: 'Só o professor pode criar desafios na comunidade geral.' };
    }

    // Limite: 1 desafio por criador por comunidade a cada 7 dias
    const colecao = db.collection(NOME_COLECAO);
    const ultimoDesafio = await colecao.findOne(
        { comunidadeId: new ObjectId(comunidadeId), criadorId: new ObjectId(criadorId) },
        { sort: { criadoEm: -1 } }
    );

    if (ultimoDesafio) {
        const diasPassados = Date.now() - new Date(ultimoDesafio.criadoEm).getTime();
        if (diasPassados < UMA_SEMANA_MS) {
            const diasRestantes = Math.ceil((UMA_SEMANA_MS - diasPassados) / (24 * 60 * 60 * 1000));
            return {
                pode: false,
                erro: `Você já criou um desafio nessa comunidade recentemente. Espere ${diasRestantes} dia(s) para criar outro.`,
            };
        }
    }

    return { pode: true };
}

export async function cadastrarDesafio(db, comunidadeId, criadorId, criadorTipo, comunidadeTipo, dados) {
    const erros = validarDados(dados);
    if (erros.length > 0) return { sucesso: false, erros };

    const checagem = await podeCriarDesafio(db, comunidadeId, criadorId, criadorTipo, comunidadeTipo);
    if (!checagem.pode) return { sucesso: false, erros: [checagem.erro] };

    const colecao = db.collection(NOME_COLECAO);
    const agora = new Date();
    const prazo = new Date(agora.getTime() + UMA_SEMANA_MS);

    const desafio = {
        comunidadeId: new ObjectId(comunidadeId),
        titulo: dados.titulo.trim(),
        descricao: dados.descricao.trim(),
        criadorId: new ObjectId(criadorId),
        criadorTipo,
        criadoEm: agora,
        prazo,
        participantes: [], // { id, tipo, aceitoEm, concluido, concluidoEm }
    };

    const resultado = await colecao.insertOne(desafio);
    return { sucesso: true, id: resultado.insertedId };
}

async function popularNomesCriadores(db, desafios) {
    const idsAlunos = desafios.filter((d) => d.criadorTipo === 'aluno').map((d) => d.criadorId);
    const idsProfessores = desafios.filter((d) => d.criadorTipo === 'professor').map((d) => d.criadorId);

    const [alunos, professores] = await Promise.all([
        idsAlunos.length > 0
            ? db.collection('alunos').find({ _id: { $in: idsAlunos } }, { projection: { nome: 1 } }).toArray()
            : [],
        idsProfessores.length > 0
            ? db.collection('professores').find({ _id: { $in: idsProfessores } }, { projection: { nome: 1 } }).toArray()
            : [],
    ]);

    const mapaNomes = new Map([
        ...alunos.map((a) => [a._id.toString(), a.nome]),
        ...professores.map((p) => [p._id.toString(), p.nome]),
    ]);

    return desafios.map((d) => ({ ...d, criadorNome: mapaNomes.get(d.criadorId.toString()) || 'Usuário' }));
}

export async function listarDesafiosPorComunidade(db, comunidadeId, usuarioId) {
    const colecao = db.collection(NOME_COLECAO);
    const desafios = await colecao
        .find({ comunidadeId: new ObjectId(comunidadeId) })
        .sort({ criadoEm: -1 })
        .toArray();

    const desafiosComNomes = await popularNomesCriadores(db, desafios);

    return desafiosComNomes.map((d) => {
        const minhaParticipacao = d.participantes.find((p) => p.id.toString() === usuarioId.toString());
        return {
            _id: d._id.toString(),
            titulo: d.titulo,
            descricao: d.descricao,
            criadorId: d.criadorId.toString(),
            criadorNome: d.criadorNome,
            criadorTipo: d.criadorTipo,
            criadoEm: d.criadoEm,
            prazo: d.prazo,
            totalParticipantes: d.participantes.length,
            totalConcluidos: d.participantes.filter((p) => p.concluido).length,
            expirado: new Date() > new Date(d.prazo),
            minhaParticipacao: minhaParticipacao
                ? { aceito: true, concluido: minhaParticipacao.concluido, concluidoEm: minhaParticipacao.concluidoEm }
                : { aceito: false, concluido: false, concluidoEm: null },
        };
    });
}

export async function aceitarDesafio(db, desafioId, usuarioId, usuarioTipo) {
    if (!ObjectId.isValid(desafioId)) return { sucesso: false, erro: 'ID inválido.' };

    const colecao = db.collection(NOME_COLECAO);
    const desafio = await colecao.findOne({ _id: new ObjectId(desafioId) });
    if (!desafio) return { sucesso: false, erro: 'Desafio não encontrado.' };
    if (new Date() > new Date(desafio.prazo)) return { sucesso: false, erro: 'O prazo desse desafio já passou.' };

    const jaParticipa = desafio.participantes.some((p) => p.id.toString() === usuarioId.toString());
    if (jaParticipa) return { sucesso: false, erro: 'Você já está participando desse desafio.' };

    await colecao.updateOne(
        { _id: new ObjectId(desafioId) },
        {
            $push: {
                participantes: {
                    id: new ObjectId(usuarioId),
                    tipo: usuarioTipo,
                    aceitoEm: new Date(),
                    concluido: false,
                    concluidoEm: null,
                },
            },
        }
    );

    return { sucesso: true };
}

export async function concluirDesafio(db, desafioId, usuarioId) {
    if (!ObjectId.isValid(desafioId)) return { sucesso: false, erro: 'ID inválido.' };

    const colecao = db.collection(NOME_COLECAO);
    const desafio = await colecao.findOne({ _id: new ObjectId(desafioId) });
    if (!desafio) return { sucesso: false, erro: 'Desafio não encontrado.' };

    const participa = desafio.participantes.some((p) => p.id.toString() === usuarioId.toString());
    if (!participa) return { sucesso: false, erro: 'Você precisa aceitar o desafio antes de concluí-lo.' };

    if (new Date() > new Date(desafio.prazo)) {
        return { sucesso: false, erro: 'O prazo desse desafio já passou.' };
    }

    await colecao.updateOne(
        { _id: new ObjectId(desafioId), 'participantes.id': new ObjectId(usuarioId) },
        { $set: { 'participantes.$.concluido': true, 'participantes.$.concluidoEm': new Date() } }
    );

    return { sucesso: true };
}

export async function excluirDesafio(db, desafioId, usuarioId) {
    if (!ObjectId.isValid(desafioId)) return false;

    const colecao = db.collection(NOME_COLECAO);
    const resultado = await colecao.deleteOne({
        _id: new ObjectId(desafioId),
        criadorId: new ObjectId(usuarioId),
    });

    return resultado.deletedCount > 0;
}