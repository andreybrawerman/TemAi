const API = "http://localhost:5001";

window.onload = function () {
  listarPedidosAdmin();
  controlarMenuAdmin();
};

function listarPedidosAdmin() {
  fetch(`${API}/admin/pedidos`)
    .then((res) => res.json())
    .then((pedidos) => {
      const tabela = document.getElementById("tabela_adm");

      if (!pedidos.length) {
        tabela.innerHTML = `
          <tr>
            <td colspan="6">Nenhum pedido encontrado.</td>
          </tr>
        `;
        return;
      }

      tabela.innerHTML = pedidos
        .map(
          (p) => `
            <tr>
              <td>#${p.id}</td>
              <td>${p.data}</td>
              <td>${p.cliente}</td>
              <td>R$ ${p.total.toFixed(2)}</td>
              <td>${p.status}</td>
              <td>
                <button onclick="finalizarPedido(${p.id})">
                  FINALIZAR
                </button>
              </td>
            </tr>
          `
        )
        .join("");
    })
    .catch(() => {
      alert("Erro ao carregar relatório geral de vendas.");
    });
}

function finalizarPedido(id) {
  fetch(`${API}/pedidos/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: "Finalizado",
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      alert(data.mensagem || data.erro);
      listarPedidosAdmin();
    })
    .catch(() => {
      alert("Erro ao atualizar status do pedido.");
    });
}

verificarLogin();
controlarMenuAdmin();
carregarFotoPerfil();