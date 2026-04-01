import requests

def buscar_endereco_por_cep(cep):
    cep = cep.replace("-", "").strip()
    url = f"https://viacep.com.br/ws/{cep}/json/"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            dados = response.json()
            if "erro" not in dados:
                return {
                    "logradouro": dados.get("logradouro"),
                    "cidade": dados.get("localidade"),
                    "estado": dados.get("uf")
                }
    except Exception as e:
        print(f"Erro na API: {e}")
    return None