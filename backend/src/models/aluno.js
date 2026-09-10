import crypto from 'crypto';
import { ObjectId } from 'mongodb';

const NOME_COLECAO = 'alunos';
const TIPOS_IMAGEM_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANHO_MAXIMO_FOTO = 2 * 1024 * 1024;

function hashSenha(senha) {
    return crypto.createHash('sha256').update(senha).digest('hex');
}

function validarDados({ nome, email }) {
    const erros = [];

    if (!nome || nome.trim().length < 2) {
        erros.push('Nome inválido.');
    }
    if (!email || !email.includes('@')) {
        erros.push('E-mail inválido.');
    }

    return erros;
}

export async function cadastrarAluno(db, salaId, dados) {
    const erros = validarDados(dados);
    if (erros.length > 0) {
        return { sucesso: false, erros };
    }

    const colecao = db.collection(NOME_COLECAO);

    const jaExiste = await colecao.findOne({ email: dados.email });
    if (jaExiste) {
        return { sucesso: false, erros: ['E-mail já cadastrado.'] };
    }

    const aluno = {
        nome: dados.nome,
        email: dados.email,
        senha: null,
        salaId: new ObjectId(salaId),
        criadoEm: new Date(),
    };

    const resultado = await colecao.insertOne(aluno);

    return { sucesso: true, id: resultado.insertedId };
}

export async function listarAlunosPorSala(db, salaId) {
    const colecao = db.collection(NOME_COLECAO);
    return colecao.find(
        { salaId: new ObjectId(salaId) },
        { projection: { senha: 0 } }
    ).toArray();
}

export async function buscarAlunoPorId(db, id) {
    const colecao = db.collection(NOME_COLECAO);
    return colecao.findOne(
        { _id: new ObjectId(id) },
        { projection: { senha: 0 } }
    );
}

export async function buscarAlunoPorEmail(db, email) {
    const colecao = db.collection(NOME_COLECAO);
    return colecao.findOne({ email });
}

export async function definirSenhaAluno(db, email, novaSenha) {
    if (!novaSenha || novaSenha.length < 6) {
        return { sucesso: false, erro: 'Senha deve ter no mínimo 6 caracteres.' };
    }

    const colecao = db.collection(NOME_COLECAO);
    const aluno = await colecao.findOne({ email });

    if (!aluno) {
        return { sucesso: false, erro: 'E-mail não encontrado. Confira com seu professor.' };
    }

    if (aluno.senha !== null) {
        return { sucesso: false, erro: 'Senha já definida. Faça login normalmente.' };
    }

    await colecao.updateOne(
        { email },
        { $set: { senha: hashSenha(novaSenha) } }
    );

    return { sucesso: true };
}

export async function atualizarEmailAluno(db, id, novoEmail) {
    if (!novoEmail || !novoEmail.includes('@')) {
        return { sucesso: false, erro: 'E-mail inválido.' };
    }

    const colecao = db.collection(NOME_COLECAO);

    const jaExiste = await colecao.findOne({
        email: novoEmail,
        _id: { $ne: new ObjectId(id) },
    });
    if (jaExiste) {
        return { sucesso: false, erro: 'E-mail já está em uso por outro aluno.' };
    }

    const resultado = await colecao.updateOne(
        { _id: new ObjectId(id) },
        { $set: { email: novoEmail } }
    );

    if (resultado.matchedCount === 0) {
        return { sucesso: false, erro: 'Aluno não encontrado.' };
    }

    return { sucesso: true };
}

export async function excluirAluno(db, id) {
    const colecao = db.collection(NOME_COLECAO);
    const resultado = await colecao.deleteOne({ _id: new ObjectId(id) });
    return resultado.deletedCount > 0;
}

export async function redefinirSenhaAluno(db, email, novaSenha) {
    const colecao = db.collection(NOME_COLECAO);

    const resultado = await colecao.updateOne(
        { email },
        { $set: { senha: hashSenha(novaSenha) } }
    );

    return resultado.matchedCount > 0;
}

export async function atualizarApelidoStreak(db, id, apelido) {
    if (!apelido || apelido.trim().length < 1 || apelido.trim().length > 20) {
        return { sucesso: false, erro: 'Apelido deve ter entre 1 e 20 caracteres.' };
    }

    const colecao = db.collection(NOME_COLECAO);
    const resultado = await colecao.updateOne(
        { _id: new ObjectId(id) },
        { $set: { apelidoStreak: apelido.trim() } }
    );

    if (resultado.matchedCount === 0) {
        return { sucesso: false, erro: 'Aluno não encontrado.' };
    }

    return { sucesso: true };
}

export async function atualizarFotoAluno(db, id, fotoBase64) {
    if (!fotoBase64 || typeof fotoBase64 !== 'string' || !fotoBase64.startsWith('data:image/')) {
        return { sucesso: false, erro: 'Formato de imagem inválido.' };
    }

    const tipoDeclarado = fotoBase64.substring(5, fotoBase64.indexOf(';'));
    if (!TIPOS_IMAGEM_PERMITIDOS.includes(tipoDeclarado)) {
        return { sucesso: false, erro: 'Envie uma imagem .jpg, .png ou .webp.' };
    }

    if (fotoBase64.length > TAMANHO_MAXIMO_FOTO) {
        return { sucesso: false, erro: 'Imagem muito grande. Envie uma foto de até 2MB.' };
    }

    const colecao = db.collection(NOME_COLECAO);
    const resultado = await colecao.updateOne(
        { _id: new ObjectId(id) },
        { $set: { foto: fotoBase64 } }
    );

    if (resultado.matchedCount === 0) {
        return { sucesso: false, erro: 'Aluno não encontrado.' };
    }

    return { sucesso: true };
}

export async function atualizarPerfilSocial(db, id, { nomeSocial, descricao }) {
    const erros = [];

    if (nomeSocial !== undefined && nomeSocial !== null && nomeSocial.trim().length > 50) {
        erros.push('Nome social deve ter no máximo 50 caracteres.');
    }
    if (descricao !== undefined && descricao !== null && descricao.length > 200) {
        erros.push('Descrição deve ter no máximo 200 caracteres.');
    }
    if (erros.length > 0) {
        return { sucesso: false, erros };
    }

    const colecao = db.collection(NOME_COLECAO);
    const camposParaAtualizar = {};
    if (nomeSocial !== undefined) camposParaAtualizar.nomeSocial = nomeSocial?.trim() || null;
    if (descricao !== undefined) camposParaAtualizar.descricao = descricao?.trim() || null;

    const resultado = await colecao.updateOne(
        { _id: new ObjectId(id) },
        { $set: camposParaAtualizar }
    );

    if (resultado.matchedCount === 0) {
        return { sucesso: false, erro: 'Aluno não encontrado.' };
    }

    return { sucesso: true };
}