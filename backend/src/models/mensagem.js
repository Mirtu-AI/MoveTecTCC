import { ObjectId } from 'mongodb';

const NOME_COLECAO = 'mensagens';

export async function cadastrarMensagem(db, comunidadeId, autorId, autorTipo, texto) {
    const colecao = db.collection(NOME_COLECAO);
    const mensagem = {
        comunidadeId: new ObjectId(comunidadeId),
        autorId: new ObjectId(autorId),
        autorTipo, // 'aluno' | 'professor'
        texto: texto.trim(),
        enviadaEm: new Date(),
    };

    const resultado = await colecao.insertOne(mensagem);
    return { ...mensagem, _id: resultado.insertedId };
}

export async function listarMensagensPorComunidade(db, comunidadeId, limite = 50) {
    const colecao = db.collection(NOME_COLECAO);
    const mensagens = await colecao
        .find({ comunidadeId: new ObjectId(comunidadeId) })
        .sort({ enviadaEm: -1 })
        .limit(limite)
        .toArray();

    return mensagens.reverse().map((m) => ({
        _id: m._id.toString(),
        autorId: m.autorId.toString(),
        autorTipo: m.autorTipo,
        texto: m.texto,
        enviadaEm: m.enviadaEm,
    }));
}

export async function popularAutores(db, mensagens) {
    const idsAlunos = mensagens.filter((m) => m.autorTipo === 'aluno').map((m) => new ObjectId(m.autorId));
    const idsProfessores = mensagens.filter((m) => m.autorTipo === 'professor').map((m) => new ObjectId(m.autorId));

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

    return mensagens.map((m) => ({ ...m, autorNome: mapaNomes.get(m.autorId) || 'Usuário' }));
}