import { useEffect, useState } from "react";
import {
  listarTarefas,
  cadastrarTarefa,
  atualizarTarefa,
  excluirTarefa,
} from "../services/tarefaService";
import "../App.css";

export default function TarefasPage() {
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [novaTarefa, setNovaTarefa] = useState({
    titulo: "",
    descricao: "",
    prazo: "",
  });

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
      setTarefas(dados);
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
      titulo: tarefa.titulo,
      descricao: tarefa.descricao || "",
      prazo: tarefa.prazo || "",
    });

    setErro("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelarEdicao() {
    setTarefaEmEdicao(null);

    setNovaTarefa({
      titulo: "",
      descricao: "",
      prazo: "",
    });

    setErro("");
  }

  async function salvarTarefa(event) {
    event.preventDefault();

    try {
      setSalvando(true);
      setErro("");

      // Envia o status padrão "pendente" (ou mantém o status existente na edição)
      const payload = {
        ...novaTarefa,
        status: tarefaEmEdicao?.status || "pendente",
      };

      if (tarefaEmEdicao) {
        const tarefaAtualizada = await atualizarTarefa(
          tarefaEmEdicao.id,
          payload
        );

        setTarefas(
          tarefas.map((tarefa) =>
            tarefa.id === tarefaEmEdicao.id
              ? tarefaAtualizada
              : tarefa
          )
        );

        cancelarEdicao();
      } else {
        const tarefaCriada = await cadastrarTarefa(payload);

        setTarefas([...tarefas, tarefaCriada]);

        setNovaTarefa({
          titulo: "",
          descricao: "",
          prazo: "",
        });
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

      setTarefas(
        tarefas.filter((tarefa) => tarefa.id !== id)
      );

      if (tarefaEmEdicao?.id === id) {
        cancelarEdicao();
      }
    } catch (error) {
      setErro(error.message);
    }
  }

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
                {tarefaEmEdicao
                  ? "Editar tarefa"
                  : "Nova tarefa"}
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

              <div className="form-group estado-group">
                <label htmlFor="prazo">Prazo</label>

                <input
                  id="prazo"
                  type="date"
                  name="prazo"
                  value={novaTarefa.prazo}
                  onChange={alterarCampo}
                />
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
          <div className="section-title">
            <div>
              <h2>Tarefas cadastradas</h2>

              <p>
                Lista de tarefas registradas no sistema.
              </p>
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
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Descrição</th>
                    <th>Prazo</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {tarefas.map((tarefa) => (
                    <tr key={tarefa.id}>
                      <td>
                        <strong>{tarefa.titulo}</strong>
                      </td>

                      <td>
                        {tarefa.descricao || "Não informado"}
                      </td>

                      <td>
                        {tarefa.prazo || "Não informado"}
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
                            onClick={() =>
                              removerTarefa(tarefa.id)
                            }
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}