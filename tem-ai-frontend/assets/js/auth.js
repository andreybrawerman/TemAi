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