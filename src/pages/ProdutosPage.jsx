import { useEffect, useState } from "react";
import {
  listarProduto,
  cadastrarProduto,
  atualizarProduto,
  excluirProduto,
} from "../services/produtoService";
import "../App.css";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    descricao: "",
    preco: "",
    quantidadeEstoque: "",
  });

  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await listarProduto();
      setProdutos(dados);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  function alterarCampo(event) {
    const { name, value } = event.target;

    setNovoProduto({
      ...novoProduto,
      [name]: value,
    });
  }

  function iniciarEdicao(produto) {
    setProdutoEmEdicao(produto);

    setNovoProduto({
      nome: produto.nome,
      descricao: produto.descricao || "",
      preco: produto.preco ?? "",
      quantidadeEstoque: produto.quantidadeEstoque ?? 0,
    });

    setErro("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelarEdicao() {
    setProdutoEmEdicao(null);

    setNovoProduto({
      nome: "",
      descricao: "",
      preco: "",
      quantidadeEstoque: "",
    });

    setErro("");
  }

  async function salvarProduto(event) {
    event.preventDefault();

    try {
      setSalvando(true);
      setErro("");

      const payload = {
        ...novoProduto,
        preco: novoProduto.preco === "" ? null : Number(novoProduto.preco),
        quantidadeEstoque: Number(novoProduto.quantidadeEstoque),
      };

      if (produtoEmEdicao) {
        const produtoAtualizado = await atualizarProduto(
          produtoEmEdicao.id,
          payload
        );

        setProdutos(
          produtos.map((produto) =>
            produto.id === produtoEmEdicao.id
              ? produtoAtualizado
              : produto
          )
        );

        cancelarEdicao();
      } else {
        const produtoCriado = await cadastrarProduto(payload);

        setProdutos([...produtos, produtoCriado]);

        setNovoProduto({
          nome: "",
          descricao: "",
          preco: "",
          quantidadeEstoque: "",
        });
      }
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function removerProduto(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este produto?"
    );

    if (!confirmar) {
      return;
    }

    try {
      setErro("");

      await excluirProduto(id);

      setProdutos(
        produtos.filter((produto) => produto.id !== id)
      );

      if (produtoEmEdicao?.id === id) {
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
          <p>Carregando produtos...</p>
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

            <h1>Produtos</h1>

            <p>
              Cadastre, edite e gerencie os produtos do sistema.
            </p>
          </div>

          <div className="total-card">
            <span>Total</span>
            <strong>{produtos.length}</strong>
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
                {produtoEmEdicao
                  ? "Editar produto"
                  : "Novo produto"}
              </h2>

              <p>
                {produtoEmEdicao
                  ? "Altere as informações do produto."
                  : "Preencha os dados para cadastrar um novo produto."}
              </p>
            </div>
          </div>

          <form onSubmit={salvarProduto}>
            <div className="form-grid">

              <div className="form-group">
                <label htmlFor="nome">Nome</label>

                <input
                  id="nome"
                  type="text"
                  name="nome"
                  placeholder="Digite o nome do produto"
                  value={novoProduto.nome}
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
                  value={novoProduto.descricao}
                  onChange={alterarCampo}
                />
              </div>

              <div className="form-group">
                <label htmlFor="preco">Preço</label>

                <input
                  id="preco"
                  type="number"
                  step="0.01"
                  min="0"
                  name="preco"
                  placeholder="0,00"
                  value={novoProduto.preco}
                  onChange={alterarCampo}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantidadeEstoque">Quantidade em estoque</label>

                <input
                  id="quantidadeEstoque"
                  type="number"
                  min="0"
                  step="1"
                  name="quantidadeEstoque"
                  placeholder="Ex.: 50"
                  value={novoProduto.quantidadeEstoque}
                  onChange={alterarCampo}
                  required
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
                  : produtoEmEdicao
                  ? "Salvar alterações"
                  : "Cadastrar produto"}
              </button>

              {produtoEmEdicao && (
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
              <h2>Produtos cadastrados</h2>

              <p>
                Lista de produtos registrados no sistema.
              </p>
            </div>
          </div>

          {produtos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>

              <h3>Nenhum produto encontrado</h3>

              <p>
                Cadastre o primeiro produto usando o formulário acima.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {produtos.map((produto) => (
                    <tr key={produto.id}>
                      <td>
                        <strong>{produto.nome}</strong>
                      </td>

                      <td>
                        {produto.descricao || "Não informado"}
                      </td>

                      <td>
                        {produto.preco !== null &&
                        produto.preco !== undefined
                          ? Number(produto.preco).toLocaleString(
                              "pt-BR",
                              {
                                style: "currency",
                                currency: "BRL",
                              }
                            )
                          : "Não informado"}
                      </td>

                      <td>
                        <strong>{Number(produto.quantidadeEstoque ?? 0)}</strong>
                        <span> unidades</span>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-button"
                            onClick={() => iniciarEdicao(produto)}
                          >
                            Editar
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              removerProduto(produto.id)
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