const API_URL = "http://localhost:5001/usuarios";

const idUsuario = localStorage.getItem("id_usuario");

if (!idUsuario) {
    alert("Usuário não está logado.");
    window.location.href = "../login/login.html";
}

function toggleSenha(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);

    if (input.type === "password") {
        input.type = "text";
        icon.src = "../../assets/img/olho_fechado.png";
    } else {
        input.type = "password";
        icon.src = "../../assets/img/olho.png";
    }
}

async function carregarPerfil() {
    try {
        const response = await fetch(`${API_URL}/${idUsuario}`);
        const data = await response.json();

        if (!response.ok) {
            document.getElementById("perfil_msg").innerText = data.erro || "Erro ao carregar perfil.";
            document.getElementById("perfil_msg").style.color = "#ff4d4d";
            return;
        }

        document.getElementById("perfil_nome").value = data.nome || "";
        document.getElementById("perfil_email").value = data.email || "";
        document.getElementById("perfil_cpf").value = data.cpf || "";
        document.getElementById("perfil_cep").value = data.cep || "";
        document.getElementById("perfil_data").value = data.data_nascimento || "";

        document.getElementById("perfil_senha_atual").value = "";
        document.getElementById("perfil_nova_senha").value = "";
        document.getElementById("perfil_confirma_senha").value = "";

        if (data.foto_perfil) {
            document.getElementById("previewFoto").src = `http://localhost:5001/uploads/${data.foto_perfil}`;
        }
    } catch (error) {
        document.getElementById("perfil_msg").innerText = "Erro ao buscar dados do perfil.";
        document.getElementById("perfil_msg").style.color = "#ff4d4d";
    }
}

document.getElementById("btnSalvarPerfil").addEventListener("click", async () => {
    const dados = {
        nome: document.getElementById("perfil_nome").value,
        email: document.getElementById("perfil_email").value,
        cpf: document.getElementById("perfil_cpf").value,
        cep: document.getElementById("perfil_cep").value,
        data_nascimento: document.getElementById("perfil_data").value,
        senha_atual: document.getElementById("perfil_senha_atual").value,
        nova_senha: document.getElementById("perfil_nova_senha").value,
        confirma_senha: document.getElementById("perfil_confirma_senha").value
    };

    try {
        const response = await fetch(`${API_URL}/${idUsuario}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        const resultado = await response.json();

        if (response.ok) {
            document.getElementById("perfil_msg").innerText = resultado.mensagem || "Perfil atualizado com sucesso!";
            document.getElementById("perfil_msg").style.color = "#2ecc71";

            document.getElementById("perfil_senha_atual").value = "";
            document.getElementById("perfil_nova_senha").value = "";
            document.getElementById("perfil_confirma_senha").value = "";
        } else {
            let msgErro = resultado.erro || "";
            if (resultado.erros) {
                msgErro = resultado.erros.join(" | ");
            }
            document.getElementById("perfil_msg").innerText = msgErro || "Erro ao atualizar perfil.";
            document.getElementById("perfil_msg").style.color = "#ff4d4d";
        }
    } catch (error) {
        document.getElementById("perfil_msg").innerText = "Erro ao conectar com o servidor.";
        document.getElementById("perfil_msg").style.color = "#ff4d4d";
    }
});

document.getElementById("fotoPerfil").addEventListener("change", async (event) => {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    document.getElementById("previewFoto").src = URL.createObjectURL(arquivo);

    const formData = new FormData();
    formData.append("foto", arquivo);

    try {
        const response = await fetch(`http://localhost:5001/usuarios/${idUsuario}/foto`, {
            method: "POST",
            body: formData
        });

        const resultado = await response.json();

        if (!response.ok) {
            document.getElementById("perfil_msg").innerText = resultado.erro || "Erro ao enviar imagem.";
            document.getElementById("perfil_msg").style.color = "#ff4d4d";
            return;
        }

        document.getElementById("perfil_msg").innerText = resultado.mensagem || "Foto atualizada com sucesso!";
        document.getElementById("perfil_msg").style.color = "#2ecc71";

        if (resultado.foto_perfil) {
            document.getElementById("previewFoto").src = `http://localhost:5001/uploads/${resultado.foto_perfil}?t=${new Date().getTime()}`;
        }
    } catch (error) {
        document.getElementById("perfil_msg").innerText = "Erro ao enviar a foto.";
        document.getElementById("perfil_msg").style.color = "#ff4d4d";
    }
});

carregarPerfil();

const hamburger = document.getElementById("hamburger");
const nav = document.querySelector("nav");

if (hamburger && nav) {
    hamburger.addEventListener("click", function () {
        nav.classList.toggle("aberto");
        hamburger.classList.toggle("ativo");
    });
}