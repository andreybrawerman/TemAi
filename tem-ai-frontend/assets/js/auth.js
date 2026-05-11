function bloquearAdminAntesDeCarregar() {
  const usuario = localStorage.getItem("usuarioLogado");
  const tipo = localStorage.getItem("tipo_usuario");

  if (!usuario) {
    window.location.replace("../login/login.html");
    throw new Error("Acesso bloqueado: usuário não logado.");
  }

  if (tipo !== "admin") {
    window.location.replace("../home/landingpage.html");
    throw new Error("Acesso bloqueado: usuário sem permissão.");
  }
}

function verificarLogin() {
  const usuario = localStorage.getItem("usuarioLogado");

  if (!usuario) {
    window.location.replace("../login/login.html");
  }
}

function verificarAdmin() {
  const usuario = localStorage.getItem("usuarioLogado");
  const tipo = localStorage.getItem("tipo_usuario");

  if (!usuario) {
    window.location.replace("../login/login.html");
    return;
  }

  if (tipo !== "admin") {
    window.location.replace("../home/landingpage.html");
  }
}

function logout() {
  localStorage.clear();
  window.location.href = "../login/login.html";
}

function controlarMenuAdmin() {
  const tipo = localStorage.getItem("tipo_usuario");
  const linksAdmin = document.querySelectorAll(".admin-only");

  linksAdmin.forEach((link) => {
    if (tipo !== "admin") {
      link.style.display = "none";
    }
  });
}

async function carregarFotoPerfil() {
    const idUsuario = localStorage.getItem("id_usuario");

    if (!idUsuario) return;

    try {
        const resposta = await fetch(`http://localhost:5001/usuarios/${idUsuario}`);
        const usuario = await resposta.json();

        const foto = document.getElementById("headerFotoPerfil");
        if (foto) {
            if (usuario.foto_perfil) {
                foto.src = `http://localhost:5001/uploads/${usuario.foto_perfil}?t=${new Date().getTime()}`;
            } else {
                foto.src = "../../assets/img/perfil_padrao.png";
            }
        }

        const nomeEl = document.querySelector(".headerUser a:first-child");
        if (nomeEl) {
            nomeEl.textContent = usuario.nome || "Usuário";
        }

    } catch (erro) {
        console.error("Erro ao carregar foto:", erro);
    }
}