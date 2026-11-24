import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';
import { cadastrarComunidadeGeral, adicionarAlunoNaComunidadeGeral } from '../src/models/comunidade.js'; // ajusta o caminho conforme sua estrutura

async function migrar() {
    const mongoUri = process.env.MONGO_URI;
    const client = new MongoClient(mongoUri);

    try {
        await client.connect();
        console.log('MongoDB conectado');

        const db = client.db('app_tcc');
        const colecaoSalas = db.collection('salas');
        const colecaoAlunos = db.collection('alunos');
        const colecaoComunidades = db.collection('comunidades');

        const salas = await colecaoSalas.find({}).toArray();
        console.log(`Encontradas ${salas.length} salas.`);

        let criadas = 0;
        let corrigidas = 0;
        let puladas = 0;
        let totalAlunosConfirmados = 0;

        for (const sala of salas) {
            if (!sala.professorId) {
                console.log(`- Sala "${sala.nome}" sem professor vinculado — pulando.`);
                puladas++;
                continue;
            }

            const comunidadeExistente = await colecaoComunidades.findOne({
                tipo: 'geral',
                salaId: sala._id,
            });

            if (!comunidadeExistente) {
                // Sala antiga que nunca teve comunidade geral criada
                await cadastrarComunidadeGeral(db, sala._id.toString(), sala.professorId.toString(), sala.nome);
                console.log(`+ Criada comunidade geral para a sala "${sala.nome}".`);
                criadas++;
            } else if (comunidadeExistente.nome !== sala.nome) {
                // Comunidade já existia, mas com o nome genérico antigo
                await colecaoComunidades.updateOne(
                    { _id: comunidadeExistente._id },
                    {
                        $set: {
                            nome: sala.nome,
                            descricao: `Comunidade oficial da sala ${sala.nome}.`,
                        },
                    }
                );
                console.log(`~ Corrigido nome da comunidade da sala "${sala.nome}".`);
                corrigidas++;
            } else {
                console.log(`= Sala "${sala.nome}" já está correta.`);
            }

            // Garante que todos os alunos da sala estão como membros da comunidade geral
            const alunosDaSala = await colecaoAlunos.find({ salaId: sala._id }).toArray();
            for (const aluno of alunosDaSala) {
                await adicionarAlunoNaComunidadeGeral(db, sala._id.toString(), aluno._id.toString());
            }
            console.log(`  → ${alunosDaSala.length} aluno(s) confirmado(s) como membro(s) da sala "${sala.nome}".`);
            totalAlunosConfirmados += alunosDaSala.length;
        }

        console.log(
            `\nConcluído: ${criadas} criadas, ${corrigidas} corrigidas, ${puladas} puladas, ${totalAlunosConfirmados} aluno(s) confirmado(s) no total.`
        );
    } catch (err) {
        console.error('Erro na migração:', err);
    } finally {
        await client.close();
    }
}

migrar();