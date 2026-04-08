const API_URL = 'http://localhost:5000/produtos';

// 1. Função para carregar (Listar) os produtos na tabela (GET)
async function carregarProdutos() {
    try {
        const resposta = await fetch(API_URL);
        const produtos = await resposta.json();
        
        const tbody = document.getElementById('tabelaProdutos');
        tbody.innerHTML = ''; 

        produtos.forEach(produto => {
            const tr = document.createElement('tr');
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
        alert("Erro ao conectar com o servidor. O Flask está rodando?");
    }
}

// 2. Função para Salvar (Criar ou Atualizar) um produto
document.getElementById('formProduto').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const id = document.getElementById('produtoId').value;
    const nome = document.getElementById('nome').value;
    const preco = parseFloat(document.getElementById('preco').value);
    const estoque = parseInt(document.getElementById('estoque').value);

    const payload = { nome, preco, estoque };

    try {
        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;

        const resposta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (resposta.ok) {
            alert(id ? "Produto atualizado!" : "Produto cadastrado com sucesso!");
            cancelarEdicao(); 
            carregarProdutos(); 
        } else {
            alert("Erro ao salvar o produto.");
        }
    } catch (erro) {
        console.error("Erro ao salvar:", erro);
    }
});

// 3. Função para Deletar um produto (DELETE)
async function deletarProduto(id) {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
        try {
            const resposta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (resposta.ok) {
                carregarProdutos(); 
            }
        } catch (erro) {
            console.error("Erro ao deletar:", erro);
        }
    }
}

// 4. Funções auxiliares para o formulário de Edição
function prepararEdicao(id, nome, preco, estoque) {
    document.getElementById('produtoId').value = id;
    document.getElementById('nome').value = nome;
    document.getElementById('preco').value = preco;
    document.getElementById('estoque').value = estoque;
    
    document.getElementById('btnSalvar').innerText = "Atualizar Produto";
    document.getElementById('btnCancelar').style.display = "inline-block";
}

function cancelarEdicao() {
    document.getElementById('produtoId').value = "";
    document.getElementById('formProduto').reset();
    
    document.getElementById('btnSalvar').innerText = "Salvar Produto";
    document.getElementById('btnCancelar').style.display = "none";
}

window.onload = carregarProdutos;