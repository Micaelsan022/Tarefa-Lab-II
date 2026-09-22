const API_URL = "/api";

export async function listarClientes() {
  const resposta = await fetch(`${API_URL}/clientes`);

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar os clientes.");
  }

  return resposta.json();
}

export async function cadastrarCliente(cliente) {
  const resposta = await fetch(`${API_URL}/clientes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cliente),
  });

  if (!resposta.ok) {
    const dados = await resposta.json();

    throw new Error(
      dados.erros?.join(", ") ||
        "Não foi possível cadastrar o cliente."
    );
  }

  return resposta.json();
}

export async function atualizarCliente(id, cliente) {
  const resposta = await fetch(`${API_URL}/clientes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cliente),
  });

  if (!resposta.ok) {
    const dados = await resposta.json();

    throw new Error(
      dados.erros?.join(", ") ||
        "Não foi possível atualizar o cliente."
    );
  }

  return resposta.json();
}

export async function excluirCliente(id) {
  const resposta = await fetch(`${API_URL}/clientes/${id}`, {
    method: "DELETE",
  });

  if (!resposta.ok) {
    let mensagem = "Não foi possível excluir o cliente.";

    try {
      const dados = await resposta.json();
      mensagem = dados.erro || mensagem;
    } catch {
      // A API pode não retornar conteúdo no DELETE
    }

    throw new Error(mensagem);
  }
}