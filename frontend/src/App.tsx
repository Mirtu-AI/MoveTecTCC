import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing/Landingpage";
import Login from "./pages/Login/Login";
import PrimeiroAcesso from "./pages/PrimeiroAcesso/PrimeiroAcesso";
import EsqueciSenha from "./pages/EsqueciSenha/EsqueciSenha";
import Cadastro from "./pages/admin/Cadastro";
import ListaProfessores from "./pages/admin/ListaProfessores";
import DetalhesProfessor from "./pages/admin/DetalhesProfessor";
import ListaSalas from "./pages/admin/ListaSalas";
import CadastrarSala from "./pages/admin/CadastrarSalas";
import DetalhesSala from "./pages/admin/DetalhesSala";
import ListaSalasProfessor from "./pages/professor/ListaSalasProfessor";
import PerfilProfessor from "./pages/professor/PerfilProfessor";
import DetalhesSalaProfessor from "./pages/professor/DetalhesSalaProfessor";
import DetalhesAlunoProfessor from "./pages/professor/DetalhesAlunoProfessor";
import ListaTreinos from "./pages/professor/ListaTreinos";
import CadastrarTreino from "./pages/professor/CadastrarTreino";
import TelaAlunoLicitacao from "./pages/aluno/TelaAlunoLicitacao"; // import da tela do aluno
import PerfilAluno from "./pages/aluno/PerfilAluno";
import NaoEncontrado from "./pages/NaoEncontrado/NaoEncontrado";
import ListaExercicios from "./pages/professor/ListaExercicios";
import CadastrarExercicio from "./pages/professor/CadastrarExercicio";
import AdicionarAtividade from "./pages/professor/AdicionarAtividade";
import DetalhesExercicio from "./pages/professor/DetalhesExercicio";
import DetalhesAtividadeProfessor from "./pages/professor/DetalhesAtividadeProfessor";
import DetalhesAtividadeAluno from "./pages/aluno/DetalhesAtividadeAluno";
import DetalhesExercicioAluno from "./pages/aluno/DetalhesExercicioAluno";
import ExecutarExercicios from "./pages/aluno/ExecutarExercicios";
import ParabensExercicios from "./pages/aluno/ParabensExercicios";
import TelaFoguinho from "./pages/aluno/TelaFoguinho";
import DetalhesRotinaAluno from "./pages/aluno/DetalhesRotinaAluno";
import CadastrarRotina from "./pages/professor/CadastrarRotina";
import ListaRotinas from "./pages/professor/ListaRotinas";
import CadastrarAviso from "./pages/professor/cadastrarAviso";
import ListaAvisos from "./pages/professor/ListaAvisos";
import DesempenhoAluno from "./pages/aluno/DesempenhoAluno";
import HistoriaAluno from "./pages/aluno/HistoricoAluno";
import DetalhesTreinoEspecificaAluno from "./pages/aluno/DetalhesTreinoEspecifico";
import DetalhesTreinoRotinaAluno from "./pages/aluno/DetalhesTreinoRotinaAluno";

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

        {/* Rotas Protegidas - Aluno */}
        <Route
          path="/aluno"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <TelaAlunoLicitacao />
            </RotaProtegida>
          }
        />
        <Route
          path="/aluno/perfil"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <PerfilAluno />
            </RotaProtegida>
          }
        />
        <Route
          path="/aluno/atividades/:id"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <DetalhesAtividadeAluno />
            </RotaProtegida>
          }
        />
        <Route
          path="/aluno/exercicios/:id"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <DetalhesExercicioAluno />
            </RotaProtegida>
          }
        />
        <Route
          path="/aluno/atividades/:id/executar"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <ExecutarExercicios tipo="atividade" />
            </RotaProtegida>}
        />
        <Route
          path="/aluno/atividades/:id/parabens"
          element={
          <RotaProtegida tipoPermitido="aluno">
            <ParabensExercicios tipo="atividade" />
          </RotaProtegida>}
        />
        <Route
          path="/aluno/execucoes-treino/:id/executar"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <ExecutarExercicios tipo="treino" />
            </RotaProtegida>}
        />
        <Route
          path="/aluno/execucoes-treino/:id/parabens"
          element={
            <RotaProtegida tipoPermitido="aluno">
                <ParabensExercicios tipo="treino" />
            </RotaProtegida>}
        />
        <Route
          path="/aluno/foguinho"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <TelaFoguinho />
            </RotaProtegida>
          }
        />
        <Route path="/aluno/rotinas/:id"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <DetalhesRotinaAluno />
            </RotaProtegida>}
        />
        <Route
          path="/aluno/rotinas/:rotinaId/treinos/:treinoId"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <DetalhesTreinoRotinaAluno />
            </RotaProtegida>
          }
        />
        <Route
          path="/aluno/desempenho"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <DesempenhoAluno />
            </RotaProtegida>
          }
        />
        <Route
          path="/aluno/minha-historia"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <HistoriaAluno />
            </RotaProtegida>
          }
        />
        <Route
          path="/aluno/treinos-especificos/:id"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <DetalhesTreinoEspecificaAluno />
            </RotaProtegida>
          }
        />
        {/* Rotas Protegidas - Professor */}
        < Route
          path="/dashboard"
          element={
            <RotaProtegida tipoPermitido="professor">
              <ListaSalasProfessor />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/perfil"
          element={
            <RotaProtegida tipoPermitido="professor">
              <PerfilProfessor />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/sala/:id"
          element={
            <RotaProtegida tipoPermitido="professor">
              <DetalhesSalaProfessor />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/aluno/:id"
          element={
            <RotaProtegida tipoPermitido="professor">
              <DetalhesAlunoProfessor />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/atividades/:id"
          element={
            <RotaProtegida tipoPermitido="professor">
              <DetalhesAtividadeProfessor />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/treinos"
          element={
            <RotaProtegida tipoPermitido="professor">
              <ListaTreinos />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/treinos/novo"
          element={
            <RotaProtegida tipoPermitido="professor">
              <CadastrarTreino />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/aluno/:alunoId/atividades/nova"
          element={
            <RotaProtegida tipoPermitido="professor">
              <AdicionarAtividade />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/atividades/:id/editar"
          element={
            <RotaProtegida tipoPermitido="professor">
              <AdicionarAtividade />
            </RotaProtegida>
          } />
        <Route
          path="/professor/exercicios/:id"
          element={
            <RotaProtegida tipoPermitido="professor">
              <DetalhesExercicio />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/rotinas"
          element={
            <RotaProtegida tipoPermitido="professor">
              <ListaRotinas />
            </RotaProtegida>
          }
        />

        <Route
          path="/professor/rotinas/nova"
          element={
            <RotaProtegida tipoPermitido="professor">
              <CadastrarRotina />
            </RotaProtegida>
          }
        />

        <Route
          path="/professor/rotinas/:id/editar"
          element={
            <RotaProtegida tipoPermitido="professor">
              <CadastrarRotina />
            </RotaProtegida>
          }
        />

        <Route
          path="/aluno/rotinas/:id"
          element={
            <RotaProtegida tipoPermitido="aluno">
              <DetalhesRotinaAluno />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/avisos"
          element={
            <RotaProtegida tipoPermitido="professor">
              <ListaAvisos />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/avisos/novo"
          element={
            <RotaProtegida tipoPermitido="professor">
              <CadastrarAviso />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/avisos/:id/editar"
          element={
            <RotaProtegida tipoPermitido="professor">
              <CadastrarAviso />
            </RotaProtegida>
          }
        />
        {/* Rotas Protegidas - Admin */}
        <Route
          path="/admin"
          element={
            <RotaProtegida tipoPermitido="adm">
              <ListaProfessores />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/cadastrar-professor"
          element={
            <RotaProtegida tipoPermitido="adm">
              <Cadastro />
            </RotaProtegida>
          }
        />
        <Route
          path="/admin/professor/:id"
          element={
            <RotaProtegida tipoPermitido="adm">
              <DetalhesProfessor />
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
        <Route
          path="/professor/treinos/:id/editar"
          element={
            <RotaProtegida tipoPermitido="professor">
              <CadastrarTreino />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/exercicios"
          element={
            <RotaProtegida tipoPermitido="professor">
              <ListaExercicios />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/exercicios/novo"
          element={
            <RotaProtegida tipoPermitido="professor">
              <CadastrarExercicio />
            </RotaProtegida>
          }
        />
        <Route
          path="/professor/exercicios/:id/editar"
          element={
            <RotaProtegida tipoPermitido="professor">
              <CadastrarExercicio />
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