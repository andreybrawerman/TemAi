import re
from datetime import date

def validar_cpf(cpf):
    
    # Valida um CPF 
    
    cpf = re.sub(r'\D', '', cpf)

    if len(cpf) != 11:
        return False

    if cpf == cpf[0] * 11:
        return False

    # Validação do 1º dígito verificador
    soma = 0
    for i in range(9):
        soma += int(cpf[i]) * (10 - i)

    digito1 = (soma * 10) % 11
    if digito1 == 10:
        digito1 = 0

    if digito1 != int(cpf[9]):
        return False

    # Validação do 2º dígito verificador
    soma = 0
    for i in range(10):
        soma += int(cpf[i]) * (11 - i)

    digito2 = (soma * 10) % 11
    if digito2 == 10:
        digito2 = 0

    if digito2 != int(cpf[10]):
        return False

    return True

def validar_email(email):
    padrao = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(padrao, email) is not None

def validar_usuario(nome, data_nasc, senha, confirma_senha, cpf, email):
    erros = []

    # Nome
    if not nome or len(nome.strip()) < 5:
        erros.append("Nome deve ter pelo menos 5 caracteres.")

    # E-mail
    if not validar_email(email):
        erros.append("E-mail inválido.")

    # CPF
    if not validar_cpf(cpf):
        erros.append("CPF inválido.")

    # Senha
    if senha != confirma_senha:
        erros.append("As senhas não coincidem.")

    if not re.match(r'^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$', senha):
        erros.append(
            "A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas e números."
        )

    # Data de nascimento e idade
    hoje = date.today()

    if data_nasc > hoje:
        erros.append("Data de nascimento no futuro.")
    else:
        idade = hoje.year - data_nasc.year - (
            (hoje.month, hoje.day) < (data_nasc.month, data_nasc.day)
        )

        if idade < 18:
            erros.append("Usuário deve ser maior de idade.")

    return erros