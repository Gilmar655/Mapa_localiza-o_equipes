# Mapa de Localização de Equipes – Enel Brasil

Atualização com Programacao_15_04_outubro_GitHub.xlsx, preservando a estrutura do site.

## Base publicada

- 372 programações, de 15/09/2026 a 04/10/2026.
- 14 colunas originais da aba Programacao, sem excluir registros ou duplicidades.
- 11 contratadas e 157 registros com coordenadas válidas.
- Regiões conforme a fonte: LES 182; NOR 148; oes 20; ABC 12; Sul 8; Não encontrado 2.
- Tabela completa, busca em todas as colunas, filtros, gráficos e relógio de Brasília.

## Importar uma nova base

1. Clique em **Importar base Excel / CSV** e escolha um arquivo .xlsx ou .csv.
2. Todas as abas não vazias devem ter a coluna **Projeto** na primeira linha preenchida. Colunas extras são preservadas; cabeçalhos vazios ou repetidos recebem nomes distintos. Abas incompatíveis geram erro e mantêm a base anterior, sem descarte silencioso.
3. A importação substitui a consulta local por inteiro. Indicadores, datas, gráficos, tabela e filtros são recalculados. Use o filtro de origem para consultar cada aba.
4. A base importada é salva neste navegador, se houver espaço disponível. **Restaurar base publicada** recupera a versão do site. Uma nova versão publicada invalida automaticamente a importação antiga armazenada.
5. **Baixar CSV completo** exporta a base ativa; **Exportar filtrados** exporta somente a consulta. O download do arquivo original permanece disponível durante a sessão de importação. Após reabrir o site, a base importada continua disponível em CSV e dados.js.

CSV aceita ponto e vírgula, vírgula ou tabulação, campos entre aspas e quebras de linha dentro dos campos; lê UTF-8, UTF-16 com BOM e Windows-1252. Datas brasileiras são tratadas como dia/mês/ano. O leitor Excel usa valores armazenados nas células; não executa macros nem recalcula fórmulas. Para fórmulas, salve a planilha recalculada no Excel antes de importar. Limite de 30 MB por arquivo e 80 MB descompactados. Arquivos .xls antigos devem ser salvos como .xlsx.

## Atualizar para todos os usuários

A importação ocorre apenas no navegador, não grava no GitHub automaticamente e não pede credenciais. Para publicar:

1. Importe e confira a nova base.
2. Clique em **Baixar dados para publicação**.
3. Substitua dados.js na raiz deste repositório e confirme o commit.
4. Aguarde o GitHub Pages concluir a implantação.

O arquivo dados.js contém todas as abas importadas. A tabela, filtros, períodos e indicadores usam esse arquivo. O botão CSV exporta sempre a base ativa. Para disponibilizar também o novo Excel original para todos, atualize o arquivo e o link correspondente em index.html e app.js.

## Mapa

O Google My Maps incorporado foi preservado e tem base própria: importar Excel/CSV neste site não modifica suas camadas. Atualize o My Maps separadamente. O link **Abrir Maps** de cada registro usa as coordenadas da base ativa. Não são inventadas coordenadas para registros sem localização válida.

## Publicar o ZIP

Extraia todos os arquivos na raiz do repositório Gilmar655/Mapa_localiza-o_equipes, incluindo vendor e .nojekyll. O GitHub Pages deve publicar a branch main, pasta raiz. O ponto de entrada é index.html.

Também é possível abrir index.html diretamente após extrair a pasta completa. A consulta e a importação funcionam localmente; o My Maps e os links externos precisam de internet.

Biblioteca incluída: JSZip, com licença em vendor/JSZip-LICENSE.markdown.
