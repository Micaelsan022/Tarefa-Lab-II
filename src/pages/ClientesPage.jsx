import { useEffect, useState } from "react";
import {
  listarClientes,
  cadastrarCliente,
  atualizarCliente,
  excluirCliente,
} from "../services/clienteService";
import "../App.css";

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    email: "",
    telefone: "",
    cidade: "",
    estado: "",
  });

  const [clienteEmEdicao, setClienteEmEdicao] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await listarClientes();
      setClientes(dados);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  function alterarCampo(event) {
    const { name, value } = event.target;

    setNovoCliente({
      ...novoCliente,
      [name]: value,
    });
  }

  function iniciarEdicao(cliente) {
    setClienteEmEdicao(cliente);

    setNovoCliente({
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone || "",
      cidade: cliente.cidade || "",
      estado: cliente.estado || "",
    });

    setErro("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelarEdicao() {
    setClienteEmEdicao(null);

    setNovoCliente({
      nome: "",
      email: "",
      telefone: "",
      cidade: "",
      estado: "",
    });

    setErro("");
  }

  async function salvarCliente(event) {
    event.preventDefault();

    try {
      setSalvando(true);
      setErro("");

      if (clienteEmEdicao) {
        const clienteAtualizado = await atualizarCliente(
          clienteEmEdicao.id,
          novoCliente
        );

        setClientes(
          clientes.map((cliente) =>
            cliente.id === clienteEmEdicao.id
              ? clienteAtualizado
              : cliente
          )
        );

        cancelarEdicao();
      } else {
        const clienteCriado = await cadastrarCliente(novoCliente);

        setClientes([...clientes, clienteCriado]);

        setNovoCliente({
          nome: "",
          email: "",
          telefone: "",
          cidade: "",
          estado: "",
        });
      }
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function removerCliente(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este cliente?"
    );

    if (!confirmar) {
      return;
    }

    try {
      setErro("");

      await excluirCliente(id);

      setClientes(
        clientes.filter((cliente) => cliente.id !== id)
      );

      if (clienteEmEdicao?.id === id) {
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
          <p>Carregando clientes...</p>
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

            <h1>Clientes</h1>

            <p>
              Cadastre, edite e gerencie os clientes do sistema.
            </p>
          </div>

          <div className="total-card">
            <span>Total</span>
            <strong>{clientes.length}</strong>
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
                {clienteEmEdicao
                  ? "Editar cliente"
                  : "Novo cliente"}
              </h2>

              <p>
                {clienteEmEdicao
                  ? "Altere as informações do cliente."
                  : "Preencha os dados para cadastrar um novo cliente."}
              </p>
            </div>
          </div>

          <form onSubmit={salvarCliente}>
            <div className="form-grid">

              <div className="form-group">
                <label htmlFor="nome">Nome</label>

                <input
                  id="nome"
                  type="text"
                  name="nome"
                  placeholder="Digite o nome"
                  value={novoCliente.nome}
                  onChange={alterarCampo}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">E-mail</label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="exemplo@email.com"
                  value={novoCliente.email}
                  onChange={alterarCampo}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefone">Telefone</label>

                <input
                  id="telefone"
                  type="text"
                  name="telefone"
                  placeholder="(00) 00000-0000"
                  value={novoCliente.telefone}
                  onChange={alterarCampo}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cidade">Cidade</label>

                <input
                  id="cidade"
                  type="text"
                  name="cidade"
                  placeholder="Digite a cidade"
                  value={novoCliente.cidade}
                  onChange={alterarCampo}
                />
              </div>

              <div className="form-group estado-group">
                <label htmlFor="estado">Estado</label>

                <input
                  id="estado"
                  type="text"
                  name="estado"
                  placeholder="UF"
                  value={novoCliente.estado}
                  onChange={alterarCampo}
                  maxLength={2}
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
                  : clienteEmEdicao
                  ? "Salvar alterações"
                  : "Cadastrar cliente"}
              </button>

              {clienteEmEdicao && (
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
              <h2>Clientes cadastrados</h2>

              <p>
                Lista de clientes registrados no sistema.
              </p>
            </div>
          </div>

          {clientes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>

              <h3>Nenhum cliente encontrado</h3>

              <p>
                Cadastre o primeiro cliente usando o formulário acima.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Telefone</th>
                    <th>Localização</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>
                        <strong>{cliente.nome}</strong>
                      </td>

                      <td>{cliente.email}</td>

                      <td>
                        {cliente.telefone || "Não informado"}
                      </td>

                      <td>
                        {cliente.cidade || cliente.estado
                          ? `${cliente.cidade || ""}${
                              cliente.cidade && cliente.estado
                                ? " - "
                                : ""
                            }${cliente.estado || ""}`
                          : "Não informado"}
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-button"
                            onClick={() => iniciarEdicao(cliente)}
                          >
                            Editar
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              removerCliente(cliente.id)
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