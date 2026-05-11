const API_URL = "http://localhost:5001/usuarios";
const ADMIN_UPDATE_URL = "http://localhost:5001/admin/usuarios";

let usuariosCarregados = [];

function confirmar(msg) {
  return Swal.fire({
    title: msg,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sim",
    cancelButtonText: "Cancelar"
  }).then(result => result.isConfirmed);
}

async function listarUsuarios() {
  try {
    const response = await fetch(API_URL);
    const usuarios = await response.json();

    usuariosCarregados = usuarios;

    renderizarUsuarios(usuariosCarregados);

  } catch (error) {
    console.error("Erro ao listar usuários:", error);

    Swal.fire({
      title: "Erro ao listar usuários",
      text: "Não foi possível carregar a lista.",
      icon: "error",
      confirmButtonText: "OK"
    });
  }
}

function renderizarUsuarios(usuarios) {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  if (usuarios.length === 0) {
    lista.innerHTML = `
      <div class="linha-vazia">
        Nenhum usuário encontrado.
      </div>
    `;
    return;
  }

  usuarios.forEach((u) => {
    const linha = document.createElement("div");
    linha.classList.add("linha-usuario");

    linha.innerHTML = `
      <span class="usuario-id">#${u.id}</span>
      <span class="usuario-nome">${u.nome}</span>
      <span class="usuario-email">${u.email}</span>

      <div class="usuario-acoes">
        <button class="btn-acao btn-adm" onclick="tornarAdmin(${u.id})">
          Tornar ADM
        </button>

        <button class="btn-acao btn-editar" onclick="carregarParaEdicao(${u.id})">
          Editar
        </button>

        <button class="btn-acao btn-excluir" onclick="deletarUsuario(${u.id})">
          Excluir
        </button>
      </div>
    `;

    lista.appendChild(linha);
  });
}

async function carregarParaEdicao(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const data = await response.json();

    if (!response.ok) {
      Swal.fire({
        title: "Usuário não encontrado",
        text: data.erro || "Não foi possível buscar esse usuário.",
        icon: "error",
        confirmButtonText: "OK"
      });
      return;
    }

    document.getElementById("up_id").value = data.ID_usuario || "";
    document.getElementById("up_nome").value = data.nome || "";
    document.getElementById("up_email").value = data.email || "";
    document.getElementById("up_cpf").value = data.cpf || "";
    document.getElementById("up_cep").value = data.cep || "";
    document.getElementById("up_data").value = data.data_nascimento || "";

    document.getElementById("update_msg").innerText = "Dados carregados para edição.";
    document.getElementById("update_msg").style.color = "#2ecc71";

    document.querySelector(".card-form").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  } catch (error) {
    console.error("Erro ao buscar usuário:", error);

    Swal.fire({
      title: "Erro",
      text: "Não foi possível carregar os dados do usuário.",
      icon: "error",
      confirmButtonText: "OK"
    });
  }
}

async function tornarAdmin(id) {
  const confirmou = await confirmar("Deseja tornar este usuário administrador?");
  if (!confirmou) return;

  const idAdminLogado = localStorage.getItem("id_usuario");

  if (!idAdminLogado) {
    Swal.fire({
      title: "Erro",
      text: "ID do administrador logado não encontrado no localStorage.",
      icon: "error",
      confirmButtonText: "OK"
    });
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}/tornar-admin`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id_admin_logado: idAdminLogado
      })
    });

    const resultado = await response.json();

    if (response.ok) {
      Swal.fire({
        title: resultado.mensagem || "Usuário promovido a admin!",
        icon: "success",
        confirmButtonText: "OK"
      });

      listarUsuarios();
    } else {
      Swal.fire({
        title: "Erro",
        text: resultado.erro || "Não foi possível tornar o usuário admin.",
        icon: "error",
        confirmButtonText: "OK"
      });
    }

  } catch (error) {
    console.error("Erro ao tornar admin:", error);

    Swal.fire({
      title: "Erro de conexão",
      text: "Não foi possível comunicar com o servidor.",
      icon: "error",
      confirmButtonText: "OK"
    });
  }
}

async function deletarUsuario(id) {
  const confirmou = await confirmar("Deseja realmente excluir este usuário?");
  if (!confirmou) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    const resultado = await response.json();

    if (response.ok) {
      Swal.fire({
        title: resultado.mensagem || "Usuário excluído com sucesso.",
        icon: "success",
        confirmButtonText: "OK"
      });

      listarUsuarios();
      limparFormulario();

    } else {
      Swal.fire({
        title: "Erro",
        text: resultado.erro || "Não foi possível excluir o usuário.",
        icon: "error",
        confirmButtonText: "OK"
      });
    }

  } catch (error) {
    console.error("Erro ao deletar:", error);

    Swal.fire({
      title: "Erro de conexão",
      text: "Não foi possível comunicar com o servidor.",
      icon: "error",
      confirmButtonText: "OK"
    });
  }
}

document.getElementById("btnAtualizar").addEventListener("click", async () => {
  const id = document.getElementById("up_id").value;

  if (!id) {
    Swal.fire({
      title: "Selecione um usuário",
      text: "Clique em Editar na lista antes de salvar.",
      icon: "warning",
      confirmButtonText: "OK"
    });
    return;
  }

  const dados = {
    nome: document.getElementById("up_nome").value,
    email: document.getElementById("up_email").value,
    cpf: document.getElementById("up_cpf").value,
    cep: document.getElementById("up_cep").value,
    data_nascimento: document.getElementById("up_data").value
  };

  try {
    const response = await fetch(`${ADMIN_UPDATE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dados)
    });

    const resultado = await response.json();

    if (response.ok) {
      document.getElementById("update_msg").innerText = "";

      Swal.fire({
        title: resultado.mensagem || "Usuário atualizado com sucesso!",
        icon: "success",
        confirmButtonText: "OK"
      });

      listarUsuarios();
    } else {
      let msgErro = resultado.erro || "";

      if (resultado.erros) {
        msgErro = resultado.erros.join(" | ");
      }

      document.getElementById("update_msg").innerText = msgErro || "Erro ao atualizar usuário.";
      document.getElementById("update_msg").style.color = "#ff4d4d";
    }

  } catch (error) {
    console.error("Erro ao atualizar:", error);

    document.getElementById("update_msg").innerText = "Erro ao conectar com o servidor.";
    document.getElementById("update_msg").style.color = "#ff4d4d";
  }
});

function limparFormulario() {
  document.getElementById("up_id").value = "";
  document.getElementById("up_nome").value = "";
  document.getElementById("up_email").value = "";
  document.getElementById("up_cpf").value = "";
  document.getElementById("up_cep").value = "";
  document.getElementById("up_data").value = "";
  document.getElementById("update_msg").innerText = "";
}

document.getElementById("btnListar").addEventListener("click", listarUsuarios);

document.getElementById("pesquisaUsuario").addEventListener("input", () => {
  const termo = document
    .getElementById("pesquisaUsuario")
    .value
    .toLowerCase()
    .trim();

  const usuariosFiltrados = usuariosCarregados.filter((usuario) => {
    const nome = usuario.nome.toLowerCase();
    const email = usuario.email.toLowerCase();

    return nome.includes(termo) || email.includes(termo);
  });

  renderizarUsuarios(usuariosFiltrados);
});

document.addEventListener("DOMContentLoaded", listarUsuarios);

verificarLogin();
controlarMenuAdmin();
carregarFotoPerfil();