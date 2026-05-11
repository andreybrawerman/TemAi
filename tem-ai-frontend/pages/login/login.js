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

document
  .getElementById("formLogin")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const msgBox = document.getElementById("mensagemBox");
    msgBox.innerHTML = "Autenticando...";
    msgBox.className = "mensagem";

    const email = document.getElementById("email_login").value;
    const senha = document.getElementById("senha_login").value;

    try {
      const response = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const result = await response.json();

      if (response.ok) {
        msgBox.innerHTML = "Login efetuado com sucesso! Redirecionando...";
        msgBox.className = "mensagem sucesso";

        localStorage.setItem("usuarioLogado", JSON.stringify(result));
        localStorage.setItem("id_usuario", result.id_usuario);
        localStorage.setItem("nome_usuario", result.nome);
        localStorage.setItem("tipo_usuario", result.tipo);

        setTimeout(() => {
          window.location.href = "../vendas/testar_vendas.html";
        }, 500);
      } else {
        msgBox.innerHTML = result.erro || "E-mail ou senha incorretos.";
        msgBox.className = "mensagem erro";
      }
    } catch (error) {
      msgBox.innerHTML = "Erro ao conectar com o servidor.";
      msgBox.className = "mensagem erro";
    }
  });

verificarLogin();
controlarMenuAdmin();
carregarFotoPerfil();