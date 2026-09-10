import crypto from 'crypto';

const NOME_COLECAO = 'adms';

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

function montarAdm({ nome, email, senha }) {
    return {
        nome,
        email,
        senha: hashSenha(senha),
        criadoEm: new Date(),
    };
}

export async function buscarAdmPorEmail(db, email) {
    const colecao = db.collection(NOME_COLECAO);
    return colecao.findOne({ email });
}

export async function cadastrarAdm(db, dados) {
    const erros = validarDados(dados);
    if (erros.length > 0) {
        return { sucesso: false, erros };
    }

    const colecao = db.collection(NOME_COLECAO);

    const jaExiste = await colecao.findOne({ email: dados.email });
    if (jaExiste) {
        return { sucesso: false, erros: ['E-mail já cadastrado.'] };
    }

    const adm = montarAdm(dados);
    const resultado = await colecao.insertOne(adm);

    return { sucesso: true, id: resultado.insertedId };
}