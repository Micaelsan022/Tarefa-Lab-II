const API_URL = "/api";

export async function listarProduto() {
  const resposta = await fetch(`${API_URL}/produtos`);

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar os produtos.");
  }

  return resposta.json();
}

export async function cadastrarProduto(produto) {
  const resposta = await fetch(`${API_URL}/produtos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(produto),
  });

  if (!resposta.ok) {
    const dados = await resposta.json();

    throw new Error(
      dados.erros?.join(", ") ||
        "Não foi possível cadastrar o produto."
    );
  }

  return resposta.json();
}

export async function atualizarProduto(id, produto) {
  const resposta = await fetch(`${API_URL}/produtos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(produto),
  });

  if (!resposta.ok) {
    const dados = await resposta.json();

    throw new Error(
      dados.erros?.join(", ") ||
        "Não foi possível atualizar o produto."
    );
  }

  return resposta.json();
}

export async function excluirProduto(id) {
  const resposta = await fetch(`${API_URL}/produtos/${id}`, {
    method: "DELETE",
  });

  if (!resposta.ok) {
    let mensagem = "Não foi possível excluir o produto.";

    try {
      const dados = await resposta.json();
      mensagem = dados.erro || mensagem;
    } catch {
      // A API pode não retornar conteúdo no DELETE
    }

    throw new Error(mensagem);
  }
}