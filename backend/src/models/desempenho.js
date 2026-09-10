import { ObjectId } from 'mongodb';

const NOME_COLECAO_ATIVIDADES = 'atividades';
const NOME_COLECAO_REGISTROS_TREINO = 'registrosTreino';
const NOME_COLECAO_ALUNOS = 'alunos';

const CONQUISTAS = [
    { id: 'primeira-atividade', nome: 'Primeira atividade', criterio: (d) => d.totalRealizadas >= 1 },
    { id: 'dez-atividades', nome: '10 atividades', criterio: (d) => d.totalRealizadas >= 10 },
    { id: 'streak-3', nome: 'Sequência de 3 dias', criterio: (d) => d.streakAtual >= 3 },
    { id: 'streak-7', nome: 'Sequência de 7 dias', criterio: (d) => d.streakAtual >= 7 },
];

function inicioDoDia(data) {
    const d = new Date(data);
    d.setHours(0, 0, 0, 0);
    return d;
}

function mesmoDia(a, b) {
    return inicioDoDia(a).getTime() === inicioDoDia(b).getTime();
}

function mesmoMes(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export async function calcularDesempenho(db, alunoId) {
    const colecaoAtividades = db.collection(NOME_COLECAO_ATIVIDADES);
    const colecaoRegistros = db.collection(NOME_COLECAO_REGISTROS_TREINO);
    const colecaoAlunos = db.collection(NOME_COLECAO_ALUNOS);

    const atividadesEntregues = await colecaoAtividades
        .find({ alunoId: new ObjectId(alunoId), status: 'entregue', entregueEm: { $exists: true } })
        .toArray();

    const registrosTreino = await colecaoRegistros
        .find({ alunoId: new ObjectId(alunoId) })
        .toArray();

    const datasConclusao = [
        ...atividadesEntregues.map((a) => new Date(a.entregueEm)),
        ...registrosTreino.map((r) => new Date(r.concluidoEm)),
    ];

    const agora = new Date();
    const ontem = new Date(agora);
    ontem.setDate(ontem.getDate() - 1);
    const mesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);

    const totalRealizadas = datasConclusao.length;
    const realizadasOntem = datasConclusao.filter((data) => mesmoDia(data, ontem)).length;
    const realizadasEsteMes = datasConclusao.filter((data) => mesmoMes(data, agora)).length;
    const realizadasMesAnterior = datasConclusao.filter((data) => mesmoMes(data, mesAnterior)).length;
    const diferencaMesAnterior = realizadasEsteMes - realizadasMesAnterior;

    const aluno = await colecaoAlunos.findOne({ _id: new ObjectId(alunoId) });
    const streakAtual = aluno?.streakAtual || 0;

    const conquistas = CONQUISTAS.map((c) => ({
        id: c.id,
        nome: c.nome,
        desbloqueada: c.criterio({ totalRealizadas, streakAtual }),
    }));

    return { totalRealizadas, realizadasOntem, diferencaMesAnterior, conquistas };
}