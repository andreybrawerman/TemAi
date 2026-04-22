import requests
import re

def buscar_endereco_por_cep(cep):
    cep = re.sub(r'\D', '', cep or '')

    if len(cep) != 8:
        return None

    url = f"https://viacep.com.br/ws/{cep}/json/"

    try:
        response = requests.get(url, timeout=5)

        if response.status_code != 200:
            return None

        dados = response.json()

        if dados.get("erro") is True:
            return None

        if not dados.get("localidade") or not dados.get("uf"):
            return None

        return {
            "logradouro": dados.get("logradouro", ""),
            "cidade": dados.get("localidade", ""),
            "estado": dados.get("uf", "")
        }

    except Exception as e:
        print(f"Erro na API ViaCEP: {e}")
        return None