from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector 
from datetime import datetime
from api_handler import buscar_endereco_por_cep
from validacoes import validar_usuario
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# Conexão com o servidor MySQL
def conectar():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="12345678",
        database="tem_ai"
    )

@app.route('/usuarios', methods=['POST'])
def cadastrar_usuario():
    data = request.json
    try:
        # Puxando dados do JSON (Front-end)
        nome = data['nome']
        email = data['email']
        senha = data['senha']
        confirma_senha = data['confirma_senha']
        data_nasc_str = data['data_nascimento']
        cep = data['cep']
        cpf = data['cpf']

        data_nasc = datetime.strptime(data_nasc_str, "%Y-%m-%d").date()

        # Validações de regra de negócio
        erros = validar_usuario(nome, data_nasc, senha, confirma_senha, cpf)
        if erros:
            return jsonify({"erros": erros}), 400
        #HASH
        senha_hash = generate_password_hash(senha)

        # API ViaCEP
        endereco = buscar_endereco_por_cep(cep)
        if not endereco:
            return jsonify({"erro": "CEP inválido"}), 400

        conn = conectar()
        cursor = conn.cursor()

        sql = """
        INSERT INTO Usuario 
        (nome, email, senha, data_nascimento, cpf, cep, logradouro, cidade, estado) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        cursor.execute(sql, (
            nome, email, senha_hash, data_nasc_str, cpf, cep,
            endereco['logradouro'], endereco['cidade'], endereco['estado']
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"mensagem": "Usuário cadastrado com sucesso!"})

    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@app.route('/usuarios', methods=['GET'])
def listar_usuarios():
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute("SELECT nome, email FROM Usuario")
    usuarios = cursor.fetchall()
    
    lista = [{"nome": u[0], "email": u[1]} for u in usuarios]
    
    cursor.close()
    conn.close()
    return jsonify(lista)

#Produtos
@app.route('/produtos', methods=['POST'])
def criar_produto():
    data = request.json

    nome = data['nome']
    preco = data['preco']
    estoque = data['estoque']

    conn = conectar()
    cursor = conn.cursor()

    sql = "INSERT INTO Produto (nome, preco, estoque_atual) VALUES (%s, %s, %s)"
    cursor.execute(sql, (nome, preco, estoque))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"mensagem":"Produto criado com sucesso"})

@app.route('/produtos', methods=['GET'])
def listar_produtos():
    conn = conectar()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM Produto")
    produtos = cursor.fetchall()

    lista = []
    for p in produtos:
        lista.append({
            "id": p[0],
            "nome": p[1],
            "preco": float(p[2]),
            "estoque": p[3]
        })

    cursor.close()
    conn.close()

    return jsonify(lista)

@app.route('/produtos/<int:id>', methods=['PUT'])
def atualizar_produto(id):
    data = request.json

    nome = data['nome']
    preco = data['preco']
    estoque = data['estoque']

    conn = conectar()
    cursor = conn.cursor()

    sql = "UPDATE Produto SET nome=%s, preco=%s, estoque_atual=%s WHERE ID_produto=%s"
    cursor.execute(sql, (nome, preco, estoque, id))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"mensagem": "Produto atualizado"})

@app.route('/produtos/<int:id>', methods=['DELETE'])
def deletar_produto(id):
    conn = conectar()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM Produto WHERE ID_produto=%s", (id,))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"mensagem": "Produto deletado"})

@app.route('/pedidos', methods=['POST'])
def finalizar_venda():
    data = request.json
    try:
        id_usuario = data['id_usuario']
        itens = data['itens'] 
        valor_total = data['valor_total']
        conn = conectar()
        cursor = conn.cursor()
        
        sql_pedido = "INSERT INTO Pedido (data_hora, status, valor_total, fk_Usuario_ID_usuario) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql_pedido, (datetime.now(), "Pendente", valor_total, id_usuario))
        id_pedido = cursor.lastrowid
        
        sql_itens = "INSERT INTO pedido_produto (fk_Pedido_ID_pedido, fk_Produto_ID_produto, quantidade) VALUES (%s, %s, %s)"
        for item in itens:
            cursor.execute(sql_itens, (id_pedido, item['id_produto'], item['quantidade']))
            cursor.execute("UPDATE Produto SET estoque_atual = estoque_atual - %s WHERE ID_produto = %s", 
                           (item['quantidade'], item['id_produto']))

        conn.commit()
        return jsonify({"mensagem": "Venda finalizada!", "id_pedido": id_pedido}), 201
    except Exception as e:
        if 'conn' in locals(): conn.rollback()
        return jsonify({"erro": str(e)}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

@app.route('/admin/pedidos', methods=['GET'])
def historico_geral():
    conn = conectar()
    cursor = conn.cursor()
    sql = """
    SELECT p.ID_pedido, p.data_hora, p.status, p.valor_total, u.nome 
    FROM Pedido p
    JOIN Usuario u ON p.fk_Usuario_ID_usuario = u.ID_usuario
    ORDER BY p.data_hora DESC
    """
    cursor.execute(sql)
    pedidos = cursor.fetchall()
    lista = [{"id": p[0], "data": p[1].strftime("%d/%m/%Y %H:%M"), "status": p[2], "total": float(p[3]), "cliente": p[4]} for p in pedidos]
    cursor.close()
    conn.close()
    return jsonify(lista)

@app.route('/usuarios/<int:id_usuario>/pedidos', methods=['GET'])
def historico_usuario(id_usuario):
    conn = conectar()
    cursor = conn.cursor()
    sql = "SELECT ID_pedido, data_hora, status, valor_total FROM Pedido WHERE fk_Usuario_ID_usuario = %s"
    cursor.execute(sql, (id_usuario,))
    pedidos = cursor.fetchall()
    lista = [{"id": p[0], "data": p[1].strftime("%d/%m/%Y %H:%M"), "status": p[2], "total": float(p[3])} for p in pedidos]
    cursor.close()
    conn.close()
    return jsonify(lista)

@app.route('/pedidos/<int:id_pedido>/itens', methods=['GET'])
def listar_itens_pedido(id_pedido):
    conn = conectar()
    cursor = conn.cursor()
    sql = """
    SELECT pr.nome, pp.quantidade, pr.preco
    FROM pedido_produto pp
    JOIN Produto pr ON pp.fk_Produto_ID_produto = pr.ID_produto
    WHERE pp.fk_Pedido_ID_pedido = %s
    """
    cursor.execute(sql, (id_pedido,))
    itens = cursor.fetchall()
    lista = [{"produto": i[0], "quantidade": i[1], "subtotal": float(i[2] * i[1])} for i in itens]
    cursor.close()
    conn.close()
    return jsonify(lista)

@app.route('/pedidos/<int:id_pedido>/status', methods=['PUT'])
def atualizar_status_pedido(id_pedido):
    data = request.json
    novo_status = data['status']

    try:
        conn = conectar()
        cursor = conn.cursor()

        sql = "UPDATE Pedido SET status = %s WHERE ID_pedido = %s"
        cursor.execute(sql, (novo_status, id_pedido))

        conn.commit()

        return jsonify({"mensagem": "Status do pedido atualizado!"})

    except Exception as e:
        return jsonify({"erro": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)


