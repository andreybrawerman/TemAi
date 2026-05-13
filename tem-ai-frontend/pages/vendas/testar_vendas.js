const API = "http://localhost:5001";

let carrinho = [];
let totalGeral = 0;
let todosProdutos = [];

const idUsuarioLogado = localStorage.getItem("id_usuario");

window.onload = function () {
  verificarLogin();
  controlarMenuAdmin();
  listarProdutos();
  listarPedidosUsuario();
};

function getEmoji(nome) {
  const n = nome.toLowerCase();
  if (n.includes("arroz") || n.includes("feijao") || n.includes("feijão")) return "🍚";
  if (n.includes("coca") || n.includes("refri") || n.includes("suco") || n.includes("bebida")) return "🥤";
  if (n.includes("nugget")) return "🍗";
  if (n.includes("batata")) return "🥔";
  if (n.includes("macarrao") || n.includes("macarrão") || n.includes("massa")) return "🍝";
  if (n.includes("chiclete") || n.includes("bala") || n.includes("doce")) return "🍬";
  if (n.includes("papel") || n.includes("toalha")) return "🧻";
  if (n.includes("vodka") || n.includes("cerveja") || n.includes("vinho") || n.includes("alcool") || n.includes("álcool")) return "🍾";
  if (n.includes("cafe") || n.includes("café")) return "☕";
  if (n.includes("leite")) return "🥛";
  if (n.includes("ovo") || n.includes("ovos")) return "🥚";
  if (n.includes("frango") || n.includes("carne") || n.includes("bife")) return "🥩";
  if (n.includes("pao") || n.includes("pão")) return "🍞";
  if (n.includes("queijo")) return "🧀";
  if (n.includes("manteiga")) return "🧈";
  if (n.includes("sabao") || n.includes("sabão") || n.includes("detergente") || n.includes("shampoo")) return "🧴";
  return "🛒";
}

function getEstoqueBadge(estoque) {
  if (estoque <= 5) {
    return `<span class="estoque-badge baixo">⚠️ Apenas ${estoque} restante${estoque === 1 ? '' : 's'}</span>`;
  }
  return `<span class="estoque-badge normal">${estoque} em estoque</span>`;
}

function listarProdutos() {
  fetch(`${API}/produtos`)
    .then((res) => res.json())
    .then((produtos) => {
      todosProdutos = produtos
        .filter(p => p.estoque > 0)
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

      renderizarVitrine(todosProdutos);
    })
    .catch(() => {
      document.getElementById("vitrine").innerHTML =
        "<p class='vitrine-vazia'>Erro ao carregar produtos.</p>";
    });
}

function renderizarVitrine(produtos) {
  const vitrine = document.getElementById("vitrine");
  const contador = document.getElementById("contador-produtos");
  vitrine.innerHTML = "";

  if (produtos.length === 0) {
    vitrine.innerHTML = `<p class="vitrine-vazia">😕 Nenhum produto encontrado.</p>`;
    if (contador) contador.textContent = "";
    return;
  }

  if (contador) {
    contador.textContent = `${produtos.length} produto${produtos.length === 1 ? '' : 's'}`;
  }

  produtos.forEach((p) => {
    const emoji = getEmoji(p.nome);
    const estoqueBadge = getEstoqueBadge(p.estoque);

    vitrine.innerHTML += `
      <div class="produto-card">
        <div class="produto-emoji">${emoji}</div>
        <h3>${p.nome}</h3>
        <p class="produto-preco">R$ ${p.preco.toFixed(2)}</p>
        ${estoqueBadge}
        <button id="btn-add-${p.id}" onclick="adicionarNaSacola(${p.id}, '${p.nome}', ${p.preco}, ${p.estoque})">
          + Adicionar
        </button>
      </div>
    `;
  });
}

function filtrarProdutos() {
  const termo = document.getElementById("busca-produto").value.toLowerCase().trim();

  if (!termo) {
    renderizarVitrine(todosProdutos);
    return;
  }

  const semAcento = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filtrados = todosProdutos.filter(p =>
    semAcento(p.nome.toLowerCase()).includes(semAcento(termo))
  );

  renderizarVitrine(filtrados);
}

function adicionarNaSacola(id, nome, preco, estoqueDisponivel) {
  const itemExistente = carrinho.find(item => item.id_produto === id);

  if (itemExistente) {
    if (itemExistente.quantidade >= estoqueDisponivel) {
      alert(`Quantidade máxima disponível: ${estoqueDisponivel}`);
      return;
    }
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({ id_produto: id, nome: nome, preco: preco, quantidade: 1 });
  }

  const btn = document.getElementById(`btn-add-${id}`);
  if (btn) {
      btn.textContent = "✓ Adicionado!";
      btn.classList.add("adicionado");
      setTimeout(() => {
        btn.textContent = "+ Adicionar";
        btn.classList.remove("adicionado");
      }, 1000);
  }

  atualizarVisualizacaoSacola();
}

function atualizarVisualizacaoSacola() {
  const lista = document.getElementById("itens_sacola");
  const totalTxt = document.getElementById("valor_total_sacola");
  lista.innerHTML = "";
  totalGeral = 0;

  if (carrinho.length === 0) {
    lista.innerHTML = "<li class='sacola-vazia'>Nenhum item adicionado.</li>";
  } else {
    carrinho.forEach((item) => {
      const subtotal = item.preco * item.quantidade;
      totalGeral += subtotal;
      lista.innerHTML += `
        <li>
          <span class="item-info">
            <span class="item-qty">${item.quantidade}x</span>
            ${item.nome}
          </span>
          <span class="item-preco">R$ ${subtotal.toFixed(2)}</span>
          <button class="btn-remover-item" onclick="removerDaSacola(${item.id_produto})" title="Remover 1 unidade">❌</button>
        </li>`;
    });
  }
  totalTxt.innerText = totalGeral.toFixed(2);
}

function finalizarVenda() {
  if (carrinho.length === 0) return alert("Sua sacola está vazia!");

  const dadosPedido = {
    id_usuario: idUsuarioLogado,
    valor_total: totalGeral,
    itens: carrinho.map((item) => ({
      id_produto: item.id_produto,
      quantidade: item.quantidade
    })),
  };

  fetch(`${API}/pedidos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dadosPedido),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.mensagem) alert(data.mensagem);
      else if (data.erro) alert("Erro: " + data.erro);

      carrinho = [];
      atualizarVisualizacaoSacola();
      listarProdutos();
      listarPedidosUsuario();
    });
}

function removerDaSacola(id) {
  const index = carrinho.findIndex(item => item.id_produto === id);
  if (index !== -1) {
    if (carrinho[index].quantidade > 1) {
      carrinho[index].quantidade -= 1;
    } else {
      carrinho.splice(index, 1);
    }
    atualizarVisualizacaoSacola();
  }
}

// ================= PEDIDOS =================

let pedidosDoUsuario = [];
let mostrarTodosPedidos = false;

function listarPedidosUsuario() {
  const id = document.getElementById("busca_usuario_id")
    ? document.getElementById("busca_usuario_id").value
    : idUsuarioLogado;
  if (!id) return;

  fetch(`${API}/usuarios/${id}/pedidos`)
    .then((res) => res.json())
    .then((pedidos) => {
      pedidosDoUsuario = pedidos;
      mostrarTodosPedidos = false;
      desenharPedidosNaTela();
    });
}

function desenharPedidosNaTela() {
  const div = document.getElementById("lista_usuario");

  if (pedidosDoUsuario.length === 0) {
    div.innerHTML = "<p style='color: rgba(255,255,255,0.6); text-align: center; font-size: 14px; margin-top: 8px;'>Você ainda não fez nenhum pedido.</p>";
    return;
  }

  const limite = mostrarTodosPedidos ? pedidosDoUsuario.length : 3;
  const pedidosParaMostrar = pedidosDoUsuario.slice(0, limite);

  let html = pedidosParaMostrar.map((p) => {
    const statusClass = p.status.toLowerCase() === "pendente" ? "badge-pendente" : "badge-finalizado";
    return `
      <div class="pedido-card">
        <div class="pedido-header">
          <strong>📦 Pedido #${p.id}</strong>
          <span>${p.data}</span>
        </div>
        <div class="pedido-footer">
          <strong>R$ ${p.total.toFixed(2)}</strong>
          <span class="badge ${statusClass}">${p.status}</span>
        </div>
      </div>
    `;
  }).join("");

  if (pedidosDoUsuario.length > 3) {
    html += mostrarTodosPedidos
      ? `<button class="btn-ver-mais" onclick="alternarPedidos()">Ver menos ▲</button>`
      : `<button class="btn-ver-mais" onclick="alternarPedidos()">Ver mais ▼</button>`;
  }

  div.innerHTML = html;
}

function alternarPedidos() {
  mostrarTodosPedidos = !mostrarTodosPedidos;
  desenharPedidosNaTela();
}

verificarLogin();
controlarMenuAdmin();
carregarFotoPerfil();