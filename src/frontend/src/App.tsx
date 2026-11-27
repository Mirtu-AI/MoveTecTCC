import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing/Landingpage";
import Login from "./pages/Login/Login";
import PrimeiroAcesso from "./pages/PrimeiroAcesso/PrimeiroAcesso";
import EsqueciSenha from "./pages/EsqueciSenha/EsqueciSenha";
import Cadastro from "./pages/admin/Cadastro";
import ListaProfissionais from "./pages/admin/ListaProfissionais";
import DetalhesProfissional from "./pages/admin/DetalhesProfissionais";
import ListaSalas from "./pages/admin/ListaSalas";
import CadastrarSala from "./pages/admin/CadastrarGrupo";
import DetalhesSala from "./pages/admin/DetalhesGrupos";
import ListaSalasProfissional from "./pages/professor/ListaGrupoProfissional";
import PerfilProfissional from "./pages/professor/PerfilProfissional";
import DetalhesSalaProfissional from "./pages/professor/DetalhesGrupoProfissional";
import DetalhesJovemProfissional from "./pages/professor/DetalhesJovemProfissional";
import ListaTreinos from "./pages/professor/ListaTreinos";
import CadastrarTreino from "./pages/professor/CadastrarTreino";
import TelaJovemLicitacao from "./pages/aluno/TelaAlunoLicitacao"; // import da tela do jovem
import PerfilJovem from "./pages/aluno/PerfilJovem";
import NaoEncontrado from "./pages/NaoEncontrado/NaoEncontrado";
import ListaExercicios from "./pages/professor/ListaExercicios";
import CadastrarExercicio from "./pages/professor/CadastrarExercicio";
import AdicionarAtividade from "./pages/professor/AdicionarAtividade";
import DetalhesExercicio from "./pages/professor/DetalhesExercicio";
import DetalhesAtividadeProfissional from "./pages/professor/DetalhesAtividadeProfissional";
import DetalhesAtividadeJovem from "./pages/aluno/DetalhesAtividadeJovem";
import DetalhesExercicioJovem from "./pages/aluno/DetalhesExercicioJovem";
import ExecutarExercicios from "./pages/aluno/ExecutarExercicios";
import ParabensExercicios from "./pages/aluno/ParabensExercicios";
import TelaFoguinho from "./pages/aluno/TelaFoguinho";
import DetalhesRotinaJovem from "./pages/aluno/DetalhesRotinaJovem";
import CadastrarRotina from "./pages/professor/CadastrarRotina";
import ListaRotinas from "./pages/professor/ListaRotinas";
import CadastrarAviso from "./pages/professor/cadastrarAviso";
import ListaAvisos from "./pages/professor/ListaAvisos";
import DesempenhoJovem from "./pages/aluno/Desempenho";
import HistoriaJovem from "./pages/aluno/Historico";
import DetalhesTreinoEspecificaJovem from "./pages/aluno/DetalhesTreinoEspecifico";
import DetalhesTreinoRotinaJovem from "./pages/aluno/DetalhesTreinoRotinaJovem";
import MetasJovem from "./pages/aluno/MetasJovem";
import AnexarVideoAtividade from "./pages/aluno/AnexarVideoAtividade";
import ListaComunidades from "./pages/aluno/ListaComunidades";
import CriarComunidade from "./pages/aluno/CriarComunidades";
import DetalhesComunidade from "./pages/aluno/DetalhesComunidade";
import ListaComunidadesProfissional from "./pages/professor/ListaComunidadesProfissional";
import CriarComunidadeProfissional from "./pages/professor/CriarComunidadeProfissional";
import PlanoSemanalJovem from "./pages/aluno/PlanoSemanalJovem";

import RotaProtegida from "./pages/components/RotaProtegida";
import RotaPublica from "./pages/components/RotaPublica";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route
          path="/"
          element={
            <RotaPublica>
              <Landing />
            </RotaPublica>
          }
        />
        <Route
          path="/login"
          element={
            <RotaPublica>
              <Login />
            </RotaPublica>
          }
        />
        <Route
          path="/primeiro-acesso"
          element={
            <RotaPublica>
              <PrimeiroAcesso />
            </RotaPublica>
          }
        />
        <Route
          path="/esqueci-senha"
          element={
            <RotaPublica>
              <EsqueciSenha />
            </RotaPublica>
          }
        />

        {/* Rotas Protegidas - Jovem */}
        <Route
          path="/jovem"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <TelaJovemLicitacao />
            </RotaProtegida>
          }
        />
        <Route
          path="/jovem/plano-semanal"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <PlanoSemanalJovem />
            </RotaProtegida>
          }
        />
        <Route
          path="/jovem/perfil"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <PerfilJovem />
            </RotaProtegida>
          }
        />
        <Route
          path="/jovem/atividades/:id"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <DetalhesAtividadeJovem />
            </RotaProtegida>
          }
        />
        <Route
          path="/jovem/exercicios/:id"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <DetalhesExercicioJovem />
            </RotaProtegida>
          }
        />
        <Route
          path="/jovem/atividades/:id/executar"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <ExecutarExercicios tipo="atividade" />
            </RotaProtegida>
          }
        />
        <Route
          path="/jovem/atividades/:id/parabens"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <ParabensExercicios tipo="atividade" />
            </RotaProtegida>
          }
        />
        <Route
          path="/jovem/execucoes-treino/:id/executar"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <ExecutarExercicios tipo="treino" />
            </RotaProtegida>
          }
        />
        <Route
          path="/jovem/execucoes-treino/:id/parabens"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <ParabensExercicios tipo="treino" />
            </RotaProtegida>
          }
        />
        <Route
          path="/jovem/foguinho"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <TelaFoguinho />
            </RotaProtegida>
          }
        />
        <Route
          path="/jovem/rotinas/:id"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <DetalhesRotinaJovem />
            </RotaProtegida>
          }
        />
        <Route
          path="/jovem/rotinas/:rotinaId/treinos/:treinoId"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <DetalhesTreinoRotinaJovem />
            </RotaProtegida>
          }
        />
        <Route
          path="/jovem/desempenho"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <DesempenhoJovem />
            </RotaProtegida>
          }
        />
        <Route
          path="/jovem/minha-historia"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <HistoriaJovem />
            </RotaProtegida>
          }
        />
        <Route
          path="/jovem/treinos-especificos/:id"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <DetalhesTreinoEspecificaJovem />
            </RotaProtegida>
          }
        />
        <Route
          path="/jovem/metas"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <MetasJovem />
            </RotaProtegida>
          }
        />
        <Route
          path="/jovem/atividades/:id/anexar-video"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <AnexarVideoAtividade />
            </RotaProtegida>
          }
        />
        <Route
          path="/jovem/comunidades"
          element={<RotaProtegida tipoPermitido="aluno"><ListaComunidades /></RotaProtegida>}
        />
        <Route
          path="/jovem/comunidades/nova"
          element={<RotaProtegida tipoPermitido="aluno"><CriarComunidade /></RotaProtegida>}
        />
        <Route
          path="/jovem/comunidades/:id"
          element={<RotaProtegida tipoPermitido="aluno"><DetalhesComunidade /></RotaProtegida>}
        />

        {/* Rotas Protegidas - Profissional */}
        <Route
          path="/dashboard"
          element={
            <RotaProtegida tipoPermitido="professor">
              <ListaSalasProfissional />
            </RotaProtegida>
          }
        />
        <Route
          path="/profissional/perfil"
          element={
            <RotaProtegida tipoPermitido="professor">
              <PerfilProfissional />
            </RotaProtegida>
          }
        />
        <Route
          path="/profissional/sala/:id"
          element={
            <RotaProtegida tipoPermitido="professor">
              <DetalhesSalaProfissional />
            </RotaProtegida>
          }
        />
        <Route
          path="/profissional/jovem/:id"
          element={
            <RotaProtegida tipoPermitido="professor">
              <DetalhesJovemProfissional />
            </RotaProtegida>
          }
        />
        <Route
          path="/profissional/atividades/:id"
          element={
            <RotaProtegida tipoPermitido="professor">
              <DetalhesAtividadeProfissional />
            </RotaProtegida>
          }
        />
        <Route
          path="/profissional/treinos"
          element={
            <RotaProtegida tipoPermitido="professor">
              <ListaTreinos />
            </RotaProtegida>
          }
        />
        <Route
          path="/profissional/treinos/novo"
          element={
            <RotaProtegida tipoPermitido="professor">
              <CadastrarTreino />
            </RotaProtegida>
          }
        />
        <Route
          path="/profissional/jovem/:alunoId/atividades/nova"
          element={
            <RotaProtegida tipoPermitido="professor">
              <AdicionarAtividade />
            </RotaProtegida>
          }
        />
        <Route
          path="/profissional/atividades/:id/editar"
          element={
            <RotaProtegida tipoPermitido="professor">
              <AdicionarAtividade />
            </RotaProtegida>
          }
        />
        <Route
          path="/profissional/exercicios/:id"
          element={
            <RotaProtegida tipoPermitido="professor">
              <DetalhesExercicio />
            </RotaProtegida>
          }
        />
        <Route
          path="/profissional/rotinas"
          element={
            <RotaProtegida tipoPermitido="professor">
              <ListaRotinas />
            </RotaProtegida>
          }
        />
        <Route
          path="/profissional/rotinas/nova"
          element={
            <RotaProtegida tipoPermitido="professor">
              <CadastrarRotina />
            </RotaProtegida>
          }
        />
        <Route
          path="/profissional/rotinas/:id/editar"
          element={
            <RotaProtegida tipoPermitido="professor">
              <CadastrarRotina />
            </RotaProtegida>
          }
        />
        <Route
          path="/profissional/avisos"
          element={
            <RotaProtegida tipoPermitido="professor">
              <ListaAvisos />
            </RotaProtegida>
          }
        />
        <Route
          path="/profissional/avisos/novo"
          element={
            <RotaProtegida tipoPermitido="professor">
              <CadastrarAviso />
            </RotaProtegida>
          }
        />
        <Route
          path="/profissional/avisos/:id/editar"
          element={
            <RotaProtegida tipoPermitido="professor">
              <CadastrarAviso />
            </RotaProtegida>
          }
        />
        <Route
          path="/profissional/comunidades"
          element={<RotaProtegida tipoPermitido="professor"><ListaComunidadesProfissional /></RotaProtegida>}
        />
        <Route
          path="/profissional/comunidade"
          element={<RotaProtegida tipoPermitido="professor"><ListaComunidadesProfissional /></RotaProtegida>}
        />
        <Route
          path="/profissional/comunidades/nova"
          element={<RotaProtegida tipoPermitido="professor"><CriarComunidadeProfissional /></RotaProtegida>}
        />
        <Route
          path="/profissional/comunidades/:id"
          element={<RotaProtegida tipoPermitido="professor"><DetalhesComunidade /></RotaProtegida>}
        />
        <Route
          path="/profissional/comunidades/:id/editar"
          element={<RotaProtegida tipoPermitido="professor"><CriarComunidadeProfissional /></RotaProtegida>}
        />
        <Route
          path="/profissional/treinos/:id/editar"
          element={
            <RotaProtegida tipoPermitido="professor">
              <CadastrarTreino />
            </RotaProtegida>
          }
        />
        <Route
          path="/profissional/exercicios"
          element={
            <RotaProtegida tipoPermitido="professor">
              <ListaExercicios />
            </RotaProtegida>
          }
        />
        <Route
          path="/profissional/exercicios/novo"
          element={
            <RotaProtegida tipoPermitido="professor">
              <CadastrarExercicio />
            </RotaProtegida>
          }
        />
        <Route
          path="/profissional/exercicios/:id/editar"
          element={
            <RotaProtegida tipoPermitido="professor">
              <CadastrarExercicio />
            </RotaProtegida>
          }
        />

        {/* Rotas Protegidas - Admin */}
        <Route
          path="/admin"
          element={
            <RotaProtegida tipoPermitido="adm">
              <ListaProfissionais />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/cadastrar-profissional"
          element={
            <RotaProtegida tipoPermitido="adm">
              <Cadastro />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/profissional/:id"
          element={
            <RotaProtegida tipoPermitido="adm">
              <DetalhesProfissional />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/salas"
          element={
            <RotaProtegida tipoPermitido="adm">
              <ListaSalas />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/cadastrar-sala"
          element={
            <RotaProtegida tipoPermitido="adm">
              <CadastrarSala />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/sala/:id"
          element={
            <RotaProtegida tipoPermitido="adm">
              <CadastrarSala />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/sala/:id/detalhes"
          element={
            <RotaProtegida tipoPermitido="adm">
              <DetalhesSala />
            </RotaProtegida>
          }
        />

        {/* Rota 404 */}
        <Route path="*" element={<NaoEncontrado />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;