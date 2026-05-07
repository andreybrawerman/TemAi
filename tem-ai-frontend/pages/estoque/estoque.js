const API_URL = "http://localhost:5001/produtos";

function confirmar(msg) {
  return Swal.fire({
    title: msg,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sim",
    cancelButtonText: "Cancelar"
  }).then(result => result.isConfirmed);
}

// 1. Função para carregar (Listar) os produtos na tabela (GET)
async function carregarProdutos() {
  try {
    const resposta = await fetch(API_URL);
    const produtos = await resposta.json();

    const tbody = document.getElementById("tabelaProdutos");
    tbody.innerHTML = "";

    produtos.forEach((produto) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${produto.id}</td>
                <td>${produto.nome}</td>
                <td>R$ ${produto.preco.toFixed(2)}</td>
                <td>${produto.estoque} un.</td>
                <td>
                    <button class="btn-editar" onclick="prepararEdicao(${produto.id}, '${produto.nome}', ${produto.preco}, ${produto.estoque})">Editar</button>
                    <button class="btn-deletar" onclick="deletarProduto(${produto.id})">Excluir</button>
                </td>
            `;
      tbody.appendChild(tr);
    });
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
    Swal.fire({
    title: 'Erro!',
    text: 'O servidor flask está rodando?',
    icon: 'error',
    confirmButtonText: 'OK'
    });
  }
}

// 2. Função para Salvar (Criar ou Atualizar) um produto
document
  .getElementById("formProduto")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const id = document.getElementById("produtoId").value;
    const nome = document.getElementById("nome").value.trim().toUpperCase();
    const preco = parseFloat(document.getElementById("preco").value);
    const estoque = parseInt(document.getElementById("estoque").value);

    const payload = { nome, preco, estoque };

    try {
      const metodo = id ? "PUT" : "POST";
      const url = id ? `${API_URL}/${id}` : API_URL;

      const resposta = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resultado = await resposta.json();

      if (resposta.ok) {
        Swal.fire({
          title: id ? "Produto atualizado!" : "Produto cadastrado com sucesso!",
          icon: "success",
          confirmButtonText: "OK"
        });
        cancelarEdicao();
        carregarProdutos();
      } else {
        if (resultado.id_existente) {
          Swal.fire({
        title: 'Erro!',
        text: `Produto já existe! ID: ${resultado.id_existente}`,
        icon: 'error',
        confirmButtonText: 'OK'
        });
        } else {
          alert(resultado.erro || "Erro ao salvar o produto.");
        }
      }
    } catch (erro) {
      console.error("Erro ao salvar:", erro);
    }
  });

// 3. Função para Deletar um produto (DELETE)
async function deletarProduto(id) {
  if (await confirmar("Tem certeza que deseja excluir este produto?")) {
    
    try {
      const resposta = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (resposta.ok) {
        Swal.fire({
          title: "Excluído!",
          text: "Produto removido com sucesso.",
          icon: "success"
        });
        carregarProdutos();
      }
    } catch (erro) {
      console.error("Erro ao deletar:", erro);
    }
  }
}

// 4. Funções auxiliares para o formulário de Edição
function prepararEdicao(id, nome, preco, estoque) {
  document.getElementById("produtoId").value = id;
  document.getElementById("nome").value = nome;
  document.getElementById("preco").value = preco;
  document.getElementById("estoque").value = estoque;

  document.getElementById("btnSalvar").innerText = "Atualizar Produto";
  document.getElementById("btnCancelar").style.display = "inline-block";
}

function cancelarEdicao() {
  document.getElementById("produtoId").value = "";
  document.getElementById("formProduto").reset();

  document.getElementById("btnSalvar").innerText = "Salvar Produto";
  document.getElementById("btnCancelar").style.display = "none";
}

window.onload = carregarProdutos;

const hamburger = document.getElementById("hamburger");
const nav = document.querySelector("nav");

hamburger.addEventListener("click", function () {
  nav.classList.toggle("aberto");
  hamburger.classList.toggle("ativo");
});

verificarLogin();
controlarMenuAdmin();
carregarFotoPerfil();