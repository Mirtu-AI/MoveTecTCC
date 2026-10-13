import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavegacaoAluno from "./NavegacaoAluno";
import "./PlanoSemanalAluno.css";

interface ItemPlanoDia {
  tipo: "rotina" | "treino";
  id: string;
  titulo: string;
}

type PlanoSemanal = Record<string, ItemPlanoDia | null>;

const DIAS_SEMANA_LABELS = [
  { indice: "1", curto: "Seg", completo: "Segunda-feira" },
  { indice: "2", curto: "Ter", completo: "Terça-feira" },
  { indice: "3", curto: "Qua", completo: "Quarta-feira" },
  { indice: "4", curto: "Qui", completo: "Quinta-feira" },
  { indice: "5", curto: "Sex", completo: "Sexta-feira" },
  { indice: "6", curto: "Sáb", completo: "Sábado" },
  { indice: "0", curto: "Dom", completo: "Domingo" },
];

interface Perfil {
  nome: string;
  objetivo?: string | null;
  planoSemanal?: PlanoSemanal | null;
}

interface Rotina {
  _id: string;
  titulo: string;
  objetivos?: string[];
}

interface Treino {
  _id: string;
  titulo: string;
  objetivos?: string[];
}

export default function PlanoSemanalAluno() {
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [rotinas, setRotinas] = useState<Rotina[]>([]);
  const [especificas, setEspecificas] = useState<Treino[]>([]);
  const [planoTemp, setPlanoTemp] = useState<PlanoSemanal>({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  const diaHojeIndice = String(new Date().getDay());

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const token = localStorage.getItem("token");
      const cabecalho = { headers: { Authorization: `Bearer ${token}` } };

      const [respPerfil, respRotinas, respEspecificas] = await Promise.all([
        axios.get("http://localhost:3000/api/aluno/perfil", cabecalho),
        axios.get("http://localhost:3000/api/aluno/rotinas", cabecalho),
        axios.get("http://localhost:3000/api/aluno/treinos?tipo=especifica", cabecalho),
      ]);

      const alunoRecebido = respPerfil.data.aluno || null;
      setPerfil(alunoRecebido);
      setPlanoTemp(alunoRecebido?.planoSemanal || {});
      setRotinas(respRotinas.data.rotinas || []);
      setEspecificas(respEspecificas.data.treinos || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  const rotinasOrdenadas = [...rotinas].sort((a, b) => {
    const obj = perfil?.objetivo;
    if (!obj || obj === "sem-objetivo") return 0;
    const aComp = a.objetivos?.includes(obj) ? 1 : 0;
    const bComp = b.objetivos?.includes(obj) ? 1 : 0;
    return bComp - aComp;
  });

  const especificasOrdenadas = [...especificas].sort((a, b) => {
    const obj = perfil?.objetivo;
    if (!obj || obj === "sem-objetivo") return 0;
    const aComp = a.objetivos?.includes(obj) ? 1 : 0;
    const bComp = b.objetivos?.includes(obj) ? 1 : 0;
    return bComp - aComp;
  });

  const opcoesParaPlano: ItemPlanoDia[] = [
    ...rotinasOrdenadas.map((r) => ({ tipo: "rotina" as const, id: r._id, titulo: r.titulo })),
    ...especificasOrdenadas.map((t) => ({ tipo: "treino" as const, id: t._id, titulo: t.titulo })),
  ];

  async function salvarPlanoNoBanco(novoPlano: PlanoSemanal) {
    setSalvando(true);
    setMensagemSucesso("");
    try {
      const token = localStorage.getItem("token");
      const resp = await axios.put(
        "http://localhost:3000/api/aluno/plano-semanal",
        { planoSemanal: novoPlano },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const planoSalvo = resp.data.planoSemanal || novoPlano;
      setPerfil((prev) => (prev ? { ...prev, planoSemanal: planoSalvo } : prev));
      setPlanoTemp(planoSalvo);
      setMensagemSucesso("Plano semanal salvo com sucesso! 🎉");
      setTimeout(() => setMensagemSucesso(""), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setSalvando(false);
    }
  }

  async function gerarPlanoInicianteRecomendado() {
    if (opcoesParaPlano.length === 0) return;

    const item1 = opcoesParaPlano[0];
    const item2 = opcoesParaPlano[1] || opcoesParaPlano[0];
    const item3 = opcoesParaPlano[2] || opcoesParaPlano[0];

    const sugerido: PlanoSemanal = {
      "0": null,
      "1": item1,
      "2": null,
      "3": item2,
      "4": null,
      "5": item3,
      "6": null,
    };

    await salvarPlanoNoBanco(sugerido);
  }

  function alterarDiaPlanoTemp(diaIndice: string, valorSelect: string) {
    if (!valorSelect) {
      setPlanoTemp((atual) => ({ ...atual, [diaIndice]: null }));
      return;
    }
    const [tipo, id] = valorSelect.split(":");
    const encontrado = opcoesParaPlano.find((op) => op.tipo === tipo && op.id === id) || null;
    setPlanoTemp((atual) => ({ ...atual, [diaIndice]: encontrado }));
  }

  function abrirItemDoPlano(item: ItemPlanoDia | null | undefined) {
    if (!item) return;
    if (item.tipo === "rotina") {
      navigate(`/aluno/rotinas/${item.id}`);
    } else {
      navigate(`/aluno/treinos-especificos/${item.id}`);
    }
  }

  if (carregando) {
    return <p className="plano-semanal-mensagem">Carregando seu plano...</p>;
  }

  return (
    <div className="plano-semanal-page">
      <NavegacaoAluno />

      <div className="plano-semanal-container">
        <header className="plano-semanal-header">
          <div className="plano-semanal-header-topo">
            <button
              type="button"
              className="plano-semanal-voltar-btn"
              onClick={() => navigate("/aluno")}
              aria-label="Voltar para o início"
            >
              ←
            </button>
            <div>
              <h1>Meu Plano Semanal</h1>
              <p className="plano-semanal-subtitulo">
                Monte sua semana de forma personalizada ou gere uma sugestão pronta para iniciantes.
              </p>
            </div>
          </div>

          {opcoesParaPlano.length > 0 && (
            <button
              type="button"
              className="plano-semanal-sugerir-btn"
              onClick={gerarPlanoInicianteRecomendado}
              disabled={salvando}
            >
              ✨ Gerar plano para iniciante (Seg, Qua e Sex)
            </button>
          )}
        </header>

        {mensagemSucesso && (
          <div className="plano-semanal-alerta-sucesso">{mensagemSucesso}</div>
        )}

        <main className="plano-semanal-lista-dias">
          {DIAS_SEMANA_LABELS.map((dia) => {
            const itemSelecionado = planoTemp[dia.indice] || null;
            const valorSelect = itemSelecionado
              ? `${itemSelecionado.tipo}:${itemSelecionado.id}`
              : "";
            const eHoje = diaHojeIndice === dia.indice;

            return (
              <div
                key={dia.indice}
                className={`plano-semanal-dia-card ${eHoje ? "hoje" : ""} ${
                  itemSelecionado ? "ativo" : "descanso"
                }`}
              >
                <div className="plano-semanal-dia-info">
                  <div className="plano-semanal-dia-titulo-linha">
                    <span className="plano-semanal-dia-nome">{dia.completo}</span>
                    {eHoje && <span className="plano-semanal-badge-hoje">Hoje</span>}
                  </div>

                  {itemSelecionado && (
                    <button
                      type="button"
                      className="plano-semanal-ir-treino-link"
                      onClick={() => abrirItemDoPlano(itemSelecionado)}
                    >
                      Ver treino →
                    </button>
                  )}
                </div>

                <select
                  value={valorSelect}
                  onChange={(e) => alterarDiaPlanoTemp(dia.indice, e.target.value)}
                  className="plano-semanal-select"
                >
                  <option value="">😌 Dia de Descanso / Livre</option>
                  {rotinasOrdenadas.length > 0 && (
                    <optgroup label="Rotinas">
                      {rotinasOrdenadas.map((r) => (
                        <option key={`rotina:${r._id}`} value={`rotina:${r._id}`}>
                          🏃 {r.titulo}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {especificasOrdenadas.length > 0 && (
                    <optgroup label="Atividades Específicas">
                      {especificasOrdenadas.map((t) => (
                        <option key={`treino:${t._id}`} value={`treino:${t._id}`}>
                          🏋️ {t.titulo}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            );
          })}
        </main>

        <footer className="plano-semanal-footer">
          <button
            type="button"
            className="plano-semanal-salvar-btn"
            onClick={() => salvarPlanoNoBanco(planoTemp)}
            disabled={salvando}
          >
            {salvando ? "Salvando alterações..." : "✓ Salvar Meu Plano Semanal"}
          </button>
        </footer>
      </div>
    </div>
  );
}
