import { ObjectId } from 'mongodb';

const NOME_COLECAO = 'rotinas';
const NOME_COLECAO_TREINOS = 'treinos';

function validarGrupos(grupos) {
    if (!Array.isArray(grupos) || grupos.length === 0) return false;
    return grupos.every(
        (grupo) =>
            grupo.nome &&
            grupo.nome.trim().length > 0 &&
            Array.isArray(grupo.treinos) &&
            grupo.treinos.length > 0 &&
            grupo.treinos.every((id) => ObjectId.isValid(id))
    );
}

function validarDados({ titulo, descricao, grupos }) {
    const erros = [];
    if (!titulo || titulo.trim().length < 2) erros.push('Título da rotina inválido.');
    if (!descricao || descricao.trim().length < 5) erros.push('Descrição da rotina inválida.');
    if (!validarGrupos(grupos)) {
        erros.push('Cada rotina precisa de ao menos um grupo, com nome e ao menos um treino selecionado.');
    }
    return erros;
}

function montarGrupos(grupos) {
    return grupos.map((grupo) => ({
        nome: grupo.nome.trim(),
        treinos: grupo.treinos.map((id) => new ObjectId(id)),
    }));
}

export async function cadastrarRotina(db, professorId, dados) {
    const erros = validarDados(dados);
    if (erros.length > 0) return { sucesso: false, erros };

    const colecao = db.collection(NOME_COLECAO);
    const rotina = {
        titulo: dados.titulo,
        descricao: dados.descricao,
        midiaUrl: dados.midiaUrl || null,
        grupos: montarGrupos(dados.grupos),
        professorId: new ObjectId(professorId),
        criadoEm: new Date(),
    };

    const resultado = await colecao.insertOne(rotina);
    return { sucesso: true, id: resultado.insertedId };
}

export async function atualizarRotina(db, id, professorId, dados) {
    const erros = validarDados(dados);
    if (erros.length > 0) return { sucesso: false, erros };

    const colecao = db.collection(NOME_COLECAO);
    const resultado = await colecao.updateOne(
        { _id: new ObjectId(id), professorId: new ObjectId(professorId) },
        {
            $set: {
                titulo: dados.titulo,
                descricao: dados.descricao,
                midiaUrl: dados.midiaUrl || null,
                grupos: montarGrupos(dados.grupos),
            },
        }
    );

    if (resultado.matchedCount === 0) {
        return { sucesso: false, erros: ['Rotina não encontrada ou você não tem permissão para editá-la.'] };
    }
    return { sucesso: true };
}

async function popularTreinosDaRotina(db, rotinas) {
    const colecaoTreinos = db.collection(NOME_COLECAO_TREINOS);
    const todosIds = rotinas.flatMap((r) => r.grupos.flatMap((g) => g.treinos));

    const treinosEncontrados = todosIds.length > 0
        ? await colecaoTreinos
              .find({ _id: { $in: todosIds } }, { projection: { titulo: 1, midiaUrl: 1 } })
              .toArray()
        : [];

    const mapaTreinos = new Map(treinosEncontrados.map((t) => [t._id.toString(), t]));

    return rotinas.map((rotina) => ({
        ...rotina,
        grupos: rotina.grupos.map((grupo) => ({
            nome: grupo.nome,
            treinos: grupo.treinos.map((treinoId) => ({
                treinoId: treinoId.toString(),
                treino: mapaTreinos.get(treinoId.toString()) || null,
            })),
        })),
    }));
}

export async function listarRotinas(db) {
    const colecao = db.collection(NOME_COLECAO);
    const rotinas = await colecao.find({}).sort({ criadoEm: -1 }).toArray();
    return popularTreinosDaRotina(db, rotinas);
}

export async function buscarRotinaPorId(db, id) {
    if (!ObjectId.isValid(id)) return null;

    const colecao = db.collection(NOME_COLECAO);
    const rotina = await colecao.findOne({ _id: new ObjectId(id) });
    if (!rotina) return null;

    const [rotinaPopulada] = await popularTreinosDaRotina(db, [rotina]);
    return rotinaPopulada;
}

export async function excluirRotina(db, id, professorId) {
    if (!ObjectId.isValid(id)) return false;

    const colecao = db.collection(NOME_COLECAO);
    const resultado = await colecao.deleteOne({
        _id: new ObjectId(id),
        professorId: new ObjectId(professorId),
    });
    return resultado.deletedCount > 0;
}

// ---------- Conclusão automática da rotina ----------

const NOME_COLECAO_REGISTROS_TREINO = 'registrosTreino';
const NOME_COLECAO_REGISTROS_ROTINA = 'registrosRotina';

function inicioDoDia(data) {
    const d = new Date(data);
    d.setHours(0, 0, 0, 0);
    return d;
}

export async function verificarEConcluirRotina(db, alunoId, treinoId) {
    const colecaoRotinas = db.collection(NOME_COLECAO);
    const colecaoRegistrosTreino = db.collection(NOME_COLECAO_REGISTROS_TREINO);
    const colecaoRegistrosRotina = db.collection(NOME_COLECAO_REGISTROS_ROTINA);

    const treinoObjectId = new ObjectId(treinoId);

    // Acha as rotinas que contêm esse treino em algum grupo
    const rotinas = await colecaoRotinas.find({ 'grupos.treinos': treinoObjectId }).toArray();
    if (rotinas.length === 0) return;

    const hoje = inicioDoDia(new Date());
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    for (const rotina of rotinas) {
        const idsUnicos = [...new Set(rotina.grupos.flatMap((g) => g.treinos.map((id) => id.toString())))];

        const registrosHoje = await colecaoRegistrosTreino
            .find({
                alunoId: new ObjectId(alunoId),
                treinoId: { $in: idsUnicos.map((id) => new ObjectId(id)) },
                concluidoEm: { $gte: hoje, $lt: amanha },
            })
            .toArray();

        const idsConcluidosHoje = new Set(registrosHoje.map((r) => r.treinoId.toString()));
        const rotinaCompleta = idsUnicos.every((id) => idsConcluidosHoje.has(id));

        if (!rotinaCompleta) continue;

        const jaRegistrada = await colecaoRegistrosRotina.findOne({
            alunoId: new ObjectId(alunoId),
            rotinaId: rotina._id,
            concluidaEm: { $gte: hoje, $lt: amanha },
        });

        if (!jaRegistrada) {
            await colecaoRegistrosRotina.insertOne({
                alunoId: new ObjectId(alunoId),
                rotinaId: rotina._id,
                concluidaEm: new Date(),
            });
        }
    }
}