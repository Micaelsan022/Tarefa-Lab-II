const API_URL = "/api";

export async function listarTarefas() {
  const resposta = await fetch(`${API_URL}/tarefas`);

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar as tarefas.");
  }

  return resposta.json();
}

export async function cadastrarTarefa(tarefa) {
  const resposta = await fetch(`${API_URL}/tarefas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tarefa),
  });

  if (!resposta.ok) {
    const dados = await resposta.json();

    throw new Error(
      dados.erros?.join(", ") ||
        "Não foi possível cadastrar a tarefa."
    );
  }

  return resposta.json();
}

export async function atualizarTarefa(id, tarefa) {
  const resposta = await fetch(`${API_URL}/tarefas/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tarefa),
  });

  if (!resposta.ok) {
    const dados = await resposta.json();

    throw new Error(
      dados.erros?.join(", ") ||
        "Não foi possível atualizar a tarefa."
    );
  }

  return resposta.json();
}

export async function excluirTarefa(id) {
  const resposta = await fetch(`${API_URL}/tarefas/${id}`, {
    method: "DELETE",
  });

  if (!resposta.ok) {
    let mensagem = "Não foi possível excluir a tarefa.";

    try {
      const dados = await resposta.json();
      mensagem = dados.erro || mensagem;
    } catch {
      // A API pode não retornar conteúdo no DELETE
    }

    throw new Error(mensagem);
  }
}