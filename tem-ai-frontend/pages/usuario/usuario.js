const API_URL = "http://localhost:5001/usuarios";

function toggleSenha(inputId, iconId) {
  const passwordInput = document.getElementById(inputId);
  const eyeIconImage = document.getElementById(iconId);

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeIconImage.src = "../../assets/img/olho_fechado.png";
  } else {
    passwordInput.type = "password";
    eyeIconImage.src = "../../assets/img/olho.png";
  }
}

// Listar Usuários
document.getElementById("btnListar").addEventListener("click", async () => {
  try {
    const response = await fetch(API_URL);
    const usuarios = await response.json();
    const lista = document.getElementById("lista");
    lista.innerHTML = "";

    usuarios.forEach((u) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>ID: ${u.id}</strong> - ${u.nome} <br><small>${u.email}</small>`;
      lista.appendChild(li);
    });
  } catch (error) {
    console.error("Erro ao listar:", error);
  }
});

// Buscar por ID
document.getElementById("btnBuscar").addEventListener("click", async () => {
  const id = document.getElementById("buscar_id").value;
  if (!id) return alert("Informe um ID");

  try {
    const response = await fetch(`${API_URL}/${id}`);
    const data = await response.json();
    document.getElementById("buscar_result").innerText = JSON.stringify(
      data,
      null,
      2,
    );
  } catch (error) {
    document.getElementById("buscar_result").innerText =
      "Usuário não encontrado.";
  }
});

// Atualizar Usuário
// NO usuario.js, SUBSTITUA TODO O BLOCO DO EVENTO 'btnAtualizar' POR ESTE:

document.getElementById("btnAtualizar").addEventListener("click", async () => {
  const id = document.getElementById("up_id").value;
  const dados = {
    nome: document.getElementById("up_nome").value,
    email: document.getElementById("up_email").value,
    cpf: document.getElementById("up_cpf").value,
    cep: document.getElementById("up_cep").value,
    data_nascimento: document.getElementById("up_data").value,
    senha: document.getElementById("up_senha").value,
    confirma_senha: document.getElementById("up_confirma_senha").value,
  };

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    const resultado = await response.json();

    if (response.ok) {
      document.getElementById("update_msg").innerText =
        resultado.mensagem || "✅ Atualizado com sucesso!";
      document.getElementById("update_msg").style.color = "#2ecc71";
    } else {
      let msgErro = resultado.erro || "";
      if (resultado.erros) {
        msgErro = resultado.erros.join(" | ");
      }
      document.getElementById("update_msg").innerText =
        msgErro || "Erro ao atualizar usuário.";
      document.getElementById("update_msg").style.color = "#ff4d4d";
    }
  } catch (error) {
    console.error("Erro ao atualizar:", error);
    document.getElementById("update_msg").innerText =
      "Erro ao conectar com o servidor.";
    document.getElementById("update_msg").style.color = "#ff4d4d";
  }
});

// Deletar Usuário
document.getElementById("btnDeletar").addEventListener("click", async () => {
  const id = document.getElementById("del_id").value;
  if (!id || !confirm("Deseja realmente excluir este usuário?")) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (response.ok) {
      document.getElementById("delete_msg").innerText = "🗑️ Usuário removido.";
      document.getElementById("delete_msg").style.color = "#ff4d4d";
    }
  } catch (error) {
    console.error("Erro ao deletar:", error);
  }
});

const hamburger = document.getElementById("hamburger");
const nav = document.querySelector("nav");

hamburger.addEventListener("click", function () {
  nav.classList.toggle("aberto");
  hamburger.classList.toggle("ativo");
});
