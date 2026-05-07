const API = "http://localhost:5001";

let carrinho = [];
let totalGeral = 0;

const idUsuarioLogado = localStorage.getItem("id_usuario");

window.onload = function () {
  verificarLogin();
  controlarMenuAdmin();
  listarProdutos();
  listarPedidosUsuario();
};

function listarProdutos() {
  fetch(`${API}/produtos`)
    .then((res) => res.json())
    .then((produtos) => {
      const vitrine = document.getElementById("vitrine");
      vitrine.innerHTML = "";

      produtos.forEach((p) => {
        vitrine.innerHTML += `
          <div class="produto-card">
            <h3>${p.nome}</h3>
            <p>R$ ${p.preco.toFixed(2)}</p>
            <p><small>Estoque: ${p.estoque}</small></p>
            <button onclick="adicionarNaSacola(${p.id}, '${p.nome}', ${p.preco})">
              Adicionar
            </button>
          </div>
        `;
      });
    })
    .catch(() => {
      document.getElementById("vitrine").innerHTML =
        "<p>Erro ao carregar produtos.</p>";
    });
}

function adicionarNaSacola(id, nome, preco) {
  carrinho.push({
    id_produto: id,
    nome: nome,
    preco: preco,
  });

  atualizarVisualizacaoSacola();
}

function atualizarVisualizacaoSacola() {
  const lista = document.getElementById("itens_sacola");
  const totalTxt = document.getElementById("valor_total_sacola");

  lista.innerHTML = "";
  totalGeral = 0;

  if (carrinho.length === 0) {
    lista.innerHTML = "<li>Nenhum item adicionado.</li>";
  } else {
    carrinho.forEach((item) => {
      totalGeral += item.preco;

      lista.innerHTML += `
        <li>${item.nome} - R$ ${item.preco.toFixed(2)}</li>
      `;
    });
  }

  totalTxt.innerText = totalGeral.toFixed(2);
}

function finalizarVenda() {
  if (carrinho.length === 0) {
    alert("Sua sacola está vazia!");
    return;
  }

  if (!idUsuarioLogado) {
    alert("Você precisa estar logado para finalizar a compra.");
    window.location.href = "../login/login.html";
    return;
  }

  const dadosPedido = {
    id_usuario: idUsuarioLogado,
    valor_total: totalGeral,
    itens: carrinho.map((item) => ({
      id_produto: item.id_produto,
      quantidade: 1,
    })),
  };

  fetch(`${API}/pedidos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dadosPedido),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.mensagem) {
        alert(data.mensagem);
      } else if (data.erro) {
        alert("Erro: " + data.erro);
      } else {
        alert("Erro inesperado.");
      }

      carrinho = [];
      atualizarVisualizacaoSacola();
      listarProdutos();
    })
    .catch(() => {
      alert("Erro ao finalizar venda.");
    });
}

function listarPedidosUsuario() {
  const id = localStorage.getItem("id_usuario");

  if (!id) {
    alert("Você precisa estar logado para ver seus pedidos.");
    window.location.href = "../login/login.html";
    return;
  }

  fetch(`${API}/usuarios/${id}/pedidos`)
    .then((res) => res.json())
    .then((pedidos) => {
      const div = document.getElementById("lista_usuario");

      if (!pedidos.length) {
        div.innerHTML = "<p>Você ainda não possui pedidos.</p>";
        return;
      }

      div.innerHTML = pedidos
        .map(
          (p) => `
            <p>
              Pedido #${p.id} - ${p.data} -
              <b>R$ ${p.total.toFixed(2)}</b>
              [${p.status}]
            </p>
          `
        )
        .join("");
    })
    .catch(() => {
      alert("Erro ao carregar seus pedidos.");
    });
}

const hamburger = document.getElementById("hamburger");
const nav = document.querySelector("nav");

hamburger.addEventListener("click", function () {
  nav.classList.toggle("aberto");
  hamburger.classList.toggle("ativo");
});

verificarLogin();
controlarMenuAdmin();
carregarFotoPerfil();