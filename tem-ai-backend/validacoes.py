from datetime import date

def validar_usuario(nome, data_nasc, senha, confirma_senha):
    erros = []
    
    if len(nome) < 5:
        erros.append("Nome deve ter pelo menos 5 caracteres.")
    
    if senha != confirma_senha:
        erros.append("As senhas não coincidem.")
        
    hoje = date.today()
    idade = hoje.year - data_nasc.year - ((hoje.month, hoje.day) < (data_nasc.month, data_nasc.day))
    
    if data_nasc > hoje:
        erros.append("Data de nascimento no futuro.")
    if idade < 18:
        erros.append("Usuário deve ser maior de idade.")
        
    return erros