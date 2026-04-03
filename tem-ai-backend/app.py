from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector 
from datetime import datetime
from api_handler import buscar_endereco_por_cep
from validacoes import validar_usuario

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
            nome, email, senha, data_nasc_str, cpf, cep,
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

if __name__ == '__main__':
    app.run(debug=True)
