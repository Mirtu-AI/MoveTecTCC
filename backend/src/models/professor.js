import crypto from 'crypto';
import { ObjectId } from 'mongodb';

const NOME_COLECAO = 'professores';

function hashSenha(senha) {
    return crypto.createHash('sha256').update(senha).digest('hex');
}

function validarDados({ nome, email, senha }) {
    const erros = [];

    if (!nome || nome.trim().length < 2) {
        erros.push('Nome inválido.');
    }
    if (!email || !email.includes('@')) {
        erros.push('E-mail inválido.');
    }
    if (!senha || senha.length < 6) {
        erros.push('Senha deve ter no mínimo 6 caracteres.');
    }

    return erros;
}

function montarProfessor({ nome, email, senha }) {
    return {
        nome,
        email,
        senha: hashSenha(senha),
        criadoEm: new Date(),
    };
}

export async function cadastrarProfessor(db, dados) {
    const erros = validarDados(dados);
    if (erros.length > 0) {
        return { sucesso: false, erros };
    }

    const colecao = db.collection(NOME_COLECAO);

    const jaExiste = await colecao.findOne({ email: dados.email });
    if (jaExiste) {
        return { sucesso: false, erros: ['E-mail já cadastrado.'] };
    }

    const professor = montarProfessor(dados);
    const resultado = await colecao.insertOne(professor);

    return { sucesso: true, id: resultado.insertedId };
}

export async function buscarProfessorPorEmail(db, email) {
    const colecao = db.collection(NOME_COLECAO);
    return colecao.findOne({ email });
}

export async function buscarProfessorPorId(db, id) {
    const colecao = db.collection(NOME_COLECAO);
    return colecao.findOne(
        { _id: new ObjectId(id) },
        { projection: { senha: 0 } }
    );
}

export async function listarProfessores(db) {
    const colecao = db.collection(NOME_COLECAO);
    return colecao.find({}, { projection: { senha: 0 } }).toArray();
}

export async function excluirProfessor(db, id) {
    const colecao = db.collection(NOME_COLECAO);
    const resultado = await colecao.deleteOne({ _id: new ObjectId(id) });
    return resultado.deletedCount > 0;
}

export async function atualizarEmailProfessor(db, id, novoEmail) {
    if (!novoEmail || !novoEmail.includes('@')) {
        return { sucesso: false, erro: 'E-mail inválido.' };
    }

    const colecao = db.collection(NOME_COLECAO);

    const jaExiste = await colecao.findOne({
        email: novoEmail,
        _id: { $ne: new ObjectId(id) },
    });
    if (jaExiste) {
        return { sucesso: false, erro: 'E-mail já está em uso por outro professor.' };
    }

    const resultado = await colecao.updateOne(
        { _id: new ObjectId(id) },
        { $set: { email: novoEmail } }
    );

    if (resultado.matchedCount === 0) {
        return { sucesso: false, erro: 'Professor não encontrado.' };
    }

    return { sucesso: true };
}

export async function atualizarSenhaProfessor(db, id, senhaAtual, novaSenha) {
    if (!novaSenha || novaSenha.length < 6) {
        return { sucesso: false, erro: 'A nova senha deve ter no mínimo 6 caracteres.' };
    }

    const colecao = db.collection(NOME_COLECAO);

    const professor = await colecao.findOne({ _id: new ObjectId(id) });
    if (!professor) {
        return { sucesso: false, erro: 'Professor não encontrado.' };
    }

    if (hashSenha(senhaAtual) !== professor.senha) {
        return { sucesso: false, erro: 'Senha atual incorreta.' };
    }

    await colecao.updateOne(
        { _id: new ObjectId(id) },
        { $set: { senha: hashSenha(novaSenha) } }
    );

    return { sucesso: true };
}

export async function atualizarFotoProfessor(db, id, foto) {
    if (!foto) {
        return { sucesso: false, erro: 'Nenhuma imagem enviada.' };
    }

    const colecao = db.collection(NOME_COLECAO);

    const resultado = await colecao.updateOne(
        { _id: new ObjectId(id) },
        { $set: { foto } }
    );

    if (resultado.matchedCount === 0) {
        return { sucesso: false, erro: 'Professor não encontrado.' };
    }

    return { sucesso: true };
}

export async function redefinirSenhaProfessor(db, email, novaSenha) {
    const colecao = db.collection(NOME_COLECAO);

    const resultado = await colecao.updateOne(
        { email },
        { $set: { senha: hashSenha(novaSenha) } }
    );

    return resultado.matchedCount > 0;
}