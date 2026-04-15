DROP DATABASE IF EXISTS tem_ai;
CREATE DATABASE tem_ai;
USE tem_ai;

CREATE TABLE Usuario (
    ID_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    data_nascimento DATE,
    cpf VARCHAR(14),
    cep VARCHAR(8),
    logradouro VARCHAR(150),
    cidade VARCHAR(50),
    estado CHAR(2)
);

CREATE TABLE Produto (
    ID_produto INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100),
    preco DECIMAL(10,2),
    estoque_atual INT
);

CREATE TABLE Pedido (
    ID_pedido INT PRIMARY KEY AUTO_INCREMENT,
    data_hora DATETIME,
    status VARCHAR(30),
    valor_total DECIMAL(10,2),
    fk_Usuario_ID_usuario INT
);

CREATE TABLE pedido_produto (
    fk_Pedido_ID_pedido INT,
    fk_Produto_ID_produto INT,
    quantidade INT,
	PRIMARY KEY (fk_Pedido_ID_pedido, fk_Produto_ID_produto)
);

ALTER TABLE Pedido ADD CONSTRAINT FK_Pedido_2
    FOREIGN KEY (fk_Usuario_ID_usuario)
    REFERENCES Usuario (ID_usuario)
    ON DELETE CASCADE;

ALTER TABLE pedido_produto ADD CONSTRAINT FK_pedido_produto_1
    FOREIGN KEY (fk_Pedido_ID_pedido)
    REFERENCES Pedido (ID_pedido)
    ON DELETE RESTRICT;

ALTER TABLE pedido_produto ADD CONSTRAINT FK_pedido_produto_2
    FOREIGN KEY (fk_Produto_ID_produto)
    REFERENCES Produto (ID_produto)
    ON DELETE CASCADE;

