const API = "http://localhost:5001";

let todosPedidos = [];
let filtroAtivo = "todos";

window.onload = function () {
  atualizarRelogio();
  carregarDados();
  controlarMenuAdmin();
};

function atualizarRelogio() {
  const el = document.getElementById("vp-datetime");
  if (!el) return;
  const now = new Date();
  el.textContent =
    "Atualizado em " +
    now.toLocaleDateString("pt-BR") +
    " às " +
    now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function iniciais(nome) {
  return nome ? nome.slice(0, 2).toUpperCase() : "?";
}

function badgeStatus(s) {
  const cls =
    s === "Finalizado" ? "finalizado" : s === "Cancelado" ? "cancelado" : "pendente";
  return `<span class="vp-badge ${cls}">${s}</span>`;
}

function renderTabela(pedidos) {
  const tbody = document.getElementById("vp-tbody");
  if (!pedidos.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="vp-empty">Nenhum pedido encontrado.</td></tr>`;
    return;
  }
  tbody.innerHTML = pedidos
    .map(
      (p) => `
      <tr>
        <td><span class="vp-id">#${p.id}</span></td>
        <td style="color:#888; font-size:12px;">${p.data}</td>
        <td>
          <div class="vp-cliente">
            <div class="vp-avatar">${iniciais(p.cliente)}</div>
            <span>${p.cliente}</span>
          </div>
        </td>
        <td><span class="vp-total">R$ ${p.total.toFixed(2)}</span></td>
        <td>${badgeStatus(p.status)}</td>
        <td>
          ${
            p.status !== "Finalizado"
              ? `<button class="vp-action-btn" onclick="finalizarPedido(${p.id})">Finalizar</button>`
              : `<button class="vp-action-btn done" disabled>Finalizado</button>`
          }
        </td>
      </tr>
    `
    )
    .join("");
}

function renderMetricas(pedidos) {
  const total = pedidos.reduce((s, p) => s + p.total, 0);
  const pendentes = pedidos.filter((p) => p.status === "Pendente").length;
  const finalizados = pedidos.filter((p) => p.status === "Finalizado").length;

  document.getElementById("m-total").textContent = "R$ " + total.toFixed(2);
  document.getElementById("m-pedidos").textContent = pedidos.length;
  document.getElementById("m-pendentes").textContent = pendentes;
  document.getElementById("m-finalizados").textContent = finalizados;

  const statusCores = {
    Pendente: "#d18233",
    Finalizado: "#0e5a40",
    Cancelado: "#cc3333",
  };
  const counts = {};
  pedidos.forEach((p) => { counts[p.status] = (counts[p.status] || 0) + 1; });
  const max = Math.max(...Object.values(counts), 1);

  document.getElementById("vp-status-list").innerHTML = Object.entries(counts)
    .map(
      ([s, n]) => `
      <div class="vp-status-row">
        <div class="vp-status-dot" style="background:${statusCores[s] || "#aaa"}"></div>
        <span class="vp-status-name">${s}</span>
        <span class="vp-status-count">${n}</span>
      </div>
      <div class="vp-bar-track">
        <div class="vp-bar-fill" style="width:${Math.round((n / max) * 100)}%; background:${statusCores[s] || "#aaa"}"></div>
      </div>
    `
    )
    .join("");

  const recentes = [...pedidos].sort((a, b) => b.id - a.id).slice(0, 4);
  document.getElementById("vp-recent").innerHTML = recentes
    .map(
      (p) => `
      <div class="vp-recent-item">
        <div class="vp-avatar" style="width:32px;height:32px;font-size:12px;">${iniciais(p.cliente)}</div>
        <div class="vp-recent-info">
          <div class="vp-recent-name">${p.cliente}</div>
          <div class="vp-recent-date">${p.data}</div>
        </div>
        <span class="vp-recent-val">R$ ${p.total.toFixed(2)}</span>
      </div>
    `
    )
    .join("");
}

function filtrar(status, btn) {
  filtroAtivo = status;
  document.querySelectorAll(".vp-filter-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  aplicarFiltros();
}

function aplicarFiltros() {
  const termo = (document.getElementById("vp-busca")?.value || "").toLowerCase().trim();
  const semAcento = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  let resultado = filtroAtivo === "todos"
    ? todosPedidos
    : todosPedidos.filter(p => p.status === filtroAtivo);

  if (termo) {
    if (termo.startsWith("#")) {
      const numeroBuscado = termo.replace("#", "").trim();
      resultado = resultado.filter(p => String(p.id).includes(numeroBuscado));
    } 
    else {
      resultado = resultado.filter(p => {
        const nome     = semAcento((p.cliente || "").toLowerCase());
        
        const cpf      = (p.cpf || "").replace(/\D/g, ""); 
        const termoNumerico = termo.replace(/\D/g, ""); 

        const idCliente = String(p.id_cliente || "");
        const idPedido  = String(p.id || "");
        const termoSem = semAcento(termo);

        return nome.includes(termoSem) || 
               (cpf.includes(termoNumerico) && termoNumerico !== "") || 
               idCliente.includes(termoSem) || 
               idPedido.includes(termoSem);
      });
    }
  }

  const contador = document.getElementById("vp-busca-contador");
  const limpar   = document.getElementById("vp-busca-limpar");
  if (contador) {
    contador.textContent = termo
      ? `${resultado.length} resultado${resultado.length === 1 ? "" : "s"}`
      : "";
  }
  if (limpar) limpar.style.display = termo ? "flex" : "none";

  renderTabela(resultado);
}

function buscarPedidos() {
  aplicarFiltros();
}

function limparBusca() {
  const input = document.getElementById("vp-busca");
  if (input) input.value = "";
  aplicarFiltros();
  input?.focus();
}

function carregarDados() {
  fetch(`${API}/admin/pedidos`)
    .then((r) => r.json())
    .then((pedidos) => {
      todosPedidos = pedidos;
      atualizarRelogio();
      renderMetricas(pedidos);
      aplicarFiltros();
    })
    .catch(() => {
      alert("Erro ao carregar relatório geral de vendas.");
    });
}

function finalizarPedido(id) {
  fetch(`${API}/pedidos/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "Finalizado" }),
  })
    .then((r) => r.json())
    .then((data) => {
      alert(data.mensagem || data.erro);
      carregarDados();
    })
    .catch(() => {
      alert("Erro ao atualizar status do pedido.");
    });
}

verificarLogin();
controlarMenuAdmin();
carregarFotoPerfil();