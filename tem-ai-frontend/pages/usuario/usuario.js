const API_URL = "http://localhost:5001/usuarios";

function confirmar(msg) {
  return Swal.fire({
    title: msg,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sim",
    cancelButtonText: "Cancelar"
  }).then(result => result.isConfirmed);
}

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

document.getElementById('up_id').addEventListener('blur', async () => {
    const id = document.getElementById('up_id').value.trim();

    if (!id) return;

    try {
        const response = await fetch(`${API_URL}/${id}`);
        const data = await response.json();

        if (!response.ok) {
            document.getElementById('update_msg').innerText = data.erro || "Usuário não encontrado.";
            document.getElementById('update_msg').style.color = "#ff4d4d";
            return;
        }

        document.getElementById('up_nome').value = data.nome || "";
        document.getElementById('up_email').value = data.email || "";
        document.getElementById('up_cpf').value = data.cpf || "";
        document.getElementById('up_cep').value = data.cep || "";
        document.getElementById('up_data').value = data.data_nascimento || "";

        document.getElementById('update_msg').innerText = "Dados carregados com sucesso.";
        document.getElementById('update_msg').style.color = "#2ecc71";

    } catch (error) {
        document.getElementById('update_msg').innerText = "Erro ao buscar usuário.";
        document.getElementById('update_msg').style.color = "#ff4d4d";
    }
});

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

document.getElementById('btnBuscar').addEventListener('click', async () => {
    const id = document.getElementById('buscar_id').value;
    if (!id) return Swal.fire({
          title: "Informe um ID",
          icon: "error",
          confirmButtonText: "OK"
        });;

    try {
        const response = await fetch(`${API_URL}/${id}`);
        const data = await response.json();

        if (!response.ok) {
            document.getElementById('buscar_result').innerText = data.erro || "Usuário não encontrado.";
            return;
        }

        document.getElementById('buscar_result').innerText = JSON.stringify(data, null, 2);

        document.getElementById('up_id').value = data.ID_usuario || "";
        document.getElementById('up_nome').value = data.nome || "";
        document.getElementById('up_email').value = data.email || "";
        document.getElementById('up_cpf').value = data.cpf || "";
        document.getElementById('up_cep').value = data.cep || "";
        document.getElementById('up_data').value = data.data_nascimento || "";
    } catch (error) {
        document.getElementById('buscar_result').innerText = "Usuário não encontrado.";
    }
});

document.getElementById('btnAtualizar').addEventListener('click', async () => {
    const id = document.getElementById('up_id').value;

    const dados = {
        nome: document.getElementById('up_nome').value,
        email: document.getElementById('up_email').value,
        cpf: document.getElementById('up_cpf').value,
        cep: document.getElementById('up_cep').value,
        data_nascimento: document.getElementById('up_data').value,
        senha_atual: document.getElementById('senha_atual').value,
        nova_senha: document.getElementById('nova_senha').value,
        confirma_senha: document.getElementById('confirma_senha').value
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        const resultado = await response.json();

        if (response.ok) {
            document.getElementById('update_msg').innerText = ""; 
            Swal.fire({
                title: resultado.mensagem || "Usuário atualizado com sucesso!",
                icon: "success",
                confirmButtonText: "OK"
            });

            document.getElementById('senha_atual').value = "";
            document.getElementById('nova_senha').value = "";
            document.getElementById('confirma_senha').value = "";
        } else {
            let msgErro = resultado.erro || "";
            if (resultado.erros) {
                msgErro = resultado.erros.join(" | ");
            }
            document.getElementById('update_msg').innerText = msgErro || "Erro ao atualizar usuário.";
            document.getElementById('update_msg').style.color = "#ff4d4d";
        }
    } catch (error) {
        console.error("Erro ao atualizar:", error);
        document.getElementById('update_msg').innerText = "Erro ao conectar com o servidor.";
        document.getElementById('update_msg').style.color = "#ff4d4d";
    }
});

document.getElementById("btnDeletar").addEventListener("click", async () => {
  const id = document.getElementById("del_id").value;
  if (!id || !(await confirmar("Deseja realmente excluir este usuário?"))) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (response.ok) {
       Swal.fire({
          title:"Usuário excluído com sucesso.",
          icon: "success",
          confirmButtonText: "OK"
        });
        document.getElementById("del_id").value = "";
        document.getElementById("btnListar").click();
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
