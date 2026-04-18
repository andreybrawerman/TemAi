function TestaCPF(strCPF) {
  var Soma;
  var Resto;
  Soma = 0;

  strCPF = strCPF.replace(/[^\d]+/g, "");

  if (strCPF == "00000000000" || strCPF.length !== 11) return false;

  for (i = 1; i <= 9; i++)
    Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
  Resto = (Soma * 10) % 11;

  if (Resto == 10 || Resto == 11) Resto = 0;
  if (Resto != parseInt(strCPF.substring(9, 10))) return false;

  Soma = 0;
  for (i = 1; i <= 10; i++)
    Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
  Resto = (Soma * 10) % 11;

  if (Resto == 10 || Resto == 11) Resto = 0;
  if (Resto != parseInt(strCPF.substring(10, 11))) return false;
  return true;
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

document.getElementById('cpf').addEventListener('input', function (e) {
  let valor = e.target.value;

  valor = valor.replace(/\D/g, '');

  if (valor.length > 3) valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
  if (valor.length > 6) valor = valor.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
  if (valor.length > 9) valor = valor.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');

  e.target.value = valor;
});

document
  .getElementById("formCadastro")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const msgBox = document.getElementById("mensagemBox");
    msgBox.innerHTML = "Carregando...";
    msgBox.className = "mensagem";

    const data = {
      nome: document.getElementById("nome").value,
      email: document.getElementById("email").value,
      cpf: document.getElementById("cpf").value.replace(/\D/g, ""),
      data_nascimento: document.getElementById("data_nascimento").value,
      cep: document.getElementById("cep").value,
      senha: document.getElementById("senha").value,
      confirma_senha: document.getElementById("confirma_senha").value,
    };

    if (!TestaCPF(data.cpf)) {
      msgBox.innerHTML = "CPF inválido.";
      msgBox.className = "mensagem erro";
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        msgBox.innerHTML = result.mensagem;
        msgBox.className = "mensagem sucesso";
        document.getElementById("formCadastro").reset();
        setTimeout(() => {
          window.location.href = "../login/login.html";
        }, 1000);
      } else {
        let msgErro = result.erro || "";
        if (result.erros) {
          msgErro = result.erros.join("<br>");
        }
        msgBox.innerHTML = msgErro;
        msgBox.className = "mensagem erro";
      }
    } catch (error) {
      msgBox.innerHTML =
        "Erro ao conectar com o servidor. Verifique se o Flask está rodando.";
      msgBox.className = "mensagem erro";
    }
  });

const hamburger = document.getElementById("hamburger");
const nav = document.querySelector("nav");

hamburger.addEventListener("click", function () {
  nav.classList.toggle("aberto");
  hamburger.classList.toggle("ativo");
});
