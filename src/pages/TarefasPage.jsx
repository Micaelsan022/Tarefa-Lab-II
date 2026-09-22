import { useEffect, useState } from "react";
import {
  listarTarefas,
  cadastrarTarefa,
  atualizarTarefa,
  excluirTarefa,
} from "../services/tarefaService";
import "../App.css";

const STATUS = {
  pendente: "Pendente",
  andamento: "Em andamento",
  concluida: "Concluída",
};

const tarefaInicial = {
  titulo: "",
  descricao: "",
  prazo: "",
  status: "pendente",
};

function obterValorPrazo(tarefa) {
  return (
    tarefa?.prazo ??
    tarefa?.dataPrazo ??
    tarefa?.data_prazo ??
    tarefa?.dataLimite ??
    tarefa?.deadline ??
    ""
  );
}

function normalizarPrazo(prazo) {
  if (!prazo) return "";

  const texto = String(prazo).trim();

  // Formato usado pelo input type="date".
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return texto;
  }

  // ISO / datetime: 2026-09-25T00:00:00.000Z
  const iso = texto.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) {
    return iso[1];
  }

  // Também aceita datas que a API possa devolver como 25/09/2026.
  const brasileira = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brasileira) {
    return `${brasileira[3]}-${brasileira[2]}-${brasileira[1]}`;
  }

  return "";
}

function formatarPrazo(prazo) {
  if (!prazo) return "Não informado";

  const data = normalizarPrazo(prazo);

  if (!data) {
    // Se a API devolver outro formato, não esconde o valor salvo.
    return String(prazo);
  }

  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function normalizarStatus(status) {
  const valor = String(status || "pendente")
    .trim()
    .toLowerCase();

  const aliases = {
    pendente: "pendente",
    pending: "pendente",
    andamento: "andamento",
    em_andamento: "andamento",
    "em andamento": "andamento",
    in_progress: "andamento",
    concluida: "concluida",
    concluída: "concluida",
    completed: "concluida",
  };

  return aliases[valor] || "pendente";
}

function statusParaApi(status) {
  const valores = {
    pendente: "pendente",
    andamento: "em_andamento",
    concluida: "concluida",
  };

  return valores[status] || "pendente";
}

export default function TarefasPage() {
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const [novaTarefa, setNovaTarefa] = useState(tarefaInicial);

  const [tarefaEmEdicao, setTarefaEmEdicao] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarTarefas();
  }, []);

  async function carregarTarefas() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await listarTarefas();
      setTarefas(Array.isArray(dados) ? dados : []);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  function alterarCampo(event) {
    const { name, value } = event.target;

    setNovaTarefa({
      ...novaTarefa,
      [name]: value,
    });
  }

  function iniciarEdicao(tarefa) {
    setTarefaEmEdicao(tarefa);

    setNovaTarefa({
      titulo: tarefa.titulo || "",
      descricao: tarefa.descricao || "",
      prazo: normalizarPrazo(obterValorPrazo(tarefa)),
      status: normalizarStatus(tarefa.status),
    });

    setErro("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelarEdicao() {
    setTarefaEmEdicao(null);
    setNovaTarefa({ ...tarefaInicial });
    setErro("");
  }

  async function salvarTarefa(event) {
    event.preventDefault();

    try {
      setSalvando(true);
      setErro("");

      const payload = {
        titulo: novaTarefa.titulo,
        descricao: novaTarefa.descricao,
        prazo: novaTarefa.prazo || null,
        status: statusParaApi(novaTarefa.status),
      };

      if (tarefaEmEdicao) {
        const tarefaAtualizada = await atualizarTarefa(
          tarefaEmEdicao.id,
          payload
        );

        // Algumas APIs não devolvem todos os campos no PUT. Mantemos os
        // valores enviados caso a resposta venha incompleta.
        const tarefaFinal = {
          ...tarefaEmEdicao,
          ...tarefaAtualizada,
          prazo:
            obterValorPrazo(tarefaAtualizada) ||
            payload.prazo ||
            obterValorPrazo(tarefaEmEdicao),
          status:
            tarefaAtualizada?.status || payload.status,
        };

        setTarefas((lista) =>
          lista.map((tarefa) =>
            tarefa.id === tarefaEmEdicao.id ? tarefaFinal : tarefa
          )
        );

        cancelarEdicao();
      } else {
        const tarefaCriada = await cadastrarTarefa(payload);

        const tarefaFinal = {
          ...tarefaCriada,
          prazo:
            obterValorPrazo(tarefaCriada) || payload.prazo || "",
          status: tarefaCriada?.status || payload.status,
        };

        setTarefas((lista) => [...lista, tarefaFinal]);
        setNovaTarefa({ ...tarefaInicial });
      }
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function removerTarefa(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta tarefa?"
    );

    if (!confirmar) {
      return;
    }

    try {
      setErro("");

      await excluirTarefa(id);

      setTarefas((lista) => lista.filter((tarefa) => tarefa.id !== id));

      if (tarefaEmEdicao?.id === id) {
        cancelarEdicao();
      }
    } catch (error) {
      setErro(error.message);
    }
  }

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    if (filtroStatus === "todos") {
      return true;
    }

    return normalizarStatus(tarefa.status) === filtroStatus;
  });

  if (carregando) {
    return (
      <main className="clientes-page">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <p>Carregando tarefas...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="clientes-page">
      <div className="clientes-container">
        <section className="page-header">
          <div>
            <span className="page-label">GERENCIAMENTO</span>

            <h1>Tarefas</h1>

            <p>
              Cadastre, edite e gerencie as tarefas do sistema.
            </p>
          </div>

          <div className="total-card">
            <span>Total</span>
            <strong>{tarefas.length}</strong>
          </div>
        </section>

        {erro && (
          <div className="error-message">
            <strong>Erro:</strong> {erro}
          </div>
        )}

        <section className="form-card">
          <div className="section-title">
            <div>
              <h2>
                {tarefaEmEdicao ? "Editar tarefa" : "Nova tarefa"}
              </h2>

              <p>
                {tarefaEmEdicao
                  ? "Altere as informações da tarefa."
                  : "Preencha os dados para cadastrar uma nova tarefa."}
              </p>
            </div>
          </div>

          <form onSubmit={salvarTarefa}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="titulo">Título</label>

                <input
                  id="titulo"
                  type="text"
                  name="titulo"
                  placeholder="Digite o título da tarefa"
                  value={novaTarefa.titulo}
                  onChange={alterarCampo}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="descricao">Descrição</label>

                <input
                  id="descricao"
                  type="text"
                  name="descricao"
                  placeholder="Digite a descrição"
                  value={novaTarefa.descricao}
                  onChange={alterarCampo}
                />
              </div>

              <div className="form-group">
                <label htmlFor="prazo">Prazo</label>

                <input
                  id="prazo"
                  type="date"
                  name="prazo"
                  value={novaTarefa.prazo}
                  onChange={alterarCampo}
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>

                <select
                  id="status"
                  name="status"
                  value={novaTarefa.status}
                  onChange={alterarCampo}
                >
                  <option value="pendente">Pendente</option>
                  <option value="andamento">Em andamento</option>
                  <option value="concluida">Concluída</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={salvando}
              >
                {salvando
                  ? "Salvando..."
                  : tarefaEmEdicao
                  ? "Salvar alterações"
                  : "Cadastrar tarefa"}
              </button>

              {tarefaEmEdicao && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={cancelarEdicao}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="clients-card">
          <div className="section-title tasks-list-header">
            <div>
              <h2>Tarefas cadastradas</h2>

              <p>
                Lista de tarefas registradas no sistema.
              </p>
            </div>

            <div className="status-filter">
              <label htmlFor="filtroStatus">Filtrar por status</label>
              <select
                id="filtroStatus"
                value={filtroStatus}
                onChange={(event) => setFiltroStatus(event.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="andamento">Em andamento</option>
                <option value="concluida">Concluída</option>
              </select>
            </div>
          </div>

          {tarefas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>

              <h3>Nenhuma tarefa encontrada</h3>

              <p>
                Cadastre a primeira tarefa usando o formulário acima.
              </p>
            </div>
          ) : tarefasFiltradas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔎</div>

              <h3>Nenhuma tarefa nesse status</h3>

              <p>
                Altere o filtro ou cadastre uma nova tarefa.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Descrição</th>
                    <th>Prazo</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {tarefasFiltradas.map((tarefa) => {
                    const status = normalizarStatus(tarefa.status);

                    return (
                      <tr key={tarefa.id}>
                        <td>
                          <strong>{tarefa.titulo}</strong>
                        </td>

                        <td>
                          {tarefa.descricao || "Não informado"}
                        </td>

                        <td>
                          {formatarPrazo(obterValorPrazo(tarefa))}
                        </td>

                        <td>
                          <span className={`status-badge status-${status}`}>
                            {STATUS[status]}
                          </span>
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              className="edit-button"
                              onClick={() => iniciarEdicao(tarefa)}
                            >
                              Editar
                            </button>

                            <button
                              className="delete-button"
                              onClick={() => removerTarefa(tarefa.id)}
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
