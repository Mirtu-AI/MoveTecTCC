import jwt from 'jsonwebtoken';

export function autenticarAdm(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ success: false, erro: 'Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SEGREDO);

        if (payload.tipo !== 'adm') {
            return res.status(403).send({ success: false, erro: 'Acesso negado. Apenas ADM.' });
        }

        req.admId = payload.id;
        next();
    } catch (err) {
        return res.status(401).send({ success: false, erro: 'Token inválido ou expirado.' });
    }
}