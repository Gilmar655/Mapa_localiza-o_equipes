# Site de acompanhamento de equipes em campo – Enel Brasil

Site em HTML/CSS/JavaScript para publicação no GitHub Pages, mantendo a estrutura do site original e com as seguintes atualizações:

- Remoção das informações nominais dos técnicos.
- Substituição de **Região Leste** por **Leste / Norte**.
- Inclusão de logomarca **Enel Brasil** em tamanho grande no topo.
- Inclusão da foto real de equipe trabalhando em rede aérea.
- Base atualizada com **193 projetos**.
- Filtros por parceira, status, tipo, data e contrato.
- Exportação de registros filtrados em CSV.

## Estrutura

- `index.html` – página principal
- `assets/style.css` – estilos
- `assets/app.js` – filtros e renderização
- `assets/dados.js` – base JavaScript
- `assets/enel-brasil.svg` – logomarca usada no cabeçalho
- `assets/foto-equipe-rede-aerea.png` – foto real fornecida
- `dados/projetos.csv` – base em CSV
- `dados/projetos.json` – base em JSON
- `dados/Converter_tabela_final.xlsx` – planilha original

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie todos os arquivos desta pasta para a raiz do repositório.
3. Em **Settings > Pages**, selecione a branch principal e a pasta `/root`.
4. Aguarde a publicação do link.
