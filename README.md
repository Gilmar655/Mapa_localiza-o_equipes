# Mapa de Localização de Equipes – Enel Brasil

Atualização de 24/09/2026 com a planilha Programacao_Set_Out_com_links_MyMaps.xlsx.

## Base conferida

- 460 programações de 24/09/2026 a 31/10/2026.
- Aba Localização Equipes: 15 colunas originais, preservadas integralmente.
- 404 registros com coordenadas válidas e 56 sem localização válida (48 com “Não encontrado” e 8 em branco).
- 10 contratadas completas. Nenhuma linha idêntica duplicada na fonte.
- Regiões: LES 222; NOR 185; ABC 24; OES 15; SUL 11; Não encontrado 3.
- Status: 218 liberadas para execução, 194 liberadas para documentação, 38 pendentes de aprovação e 10 rascunhos.
- Filtros de data, status, parceira, família de projetos, região, intervenção e aba; busca em todas as colunas.
- Gráficos e tabela acompanham os filtros. Relógio no horário de Brasília.

## Publicar no GitHub

1. Extraia o ZIP no computador.
2. No repositório Gilmar655/Mapa_localiza-o_equipes, envie o conteúdo extraído para a raiz, substituindo os arquivos de mesmo nome. Inclua a pasta vendor e .nojekyll. Não envie apenas o ZIP.
3. Confirme em Commit changes.
4. Em Settings → Pages, use Deploy from a branch, branch main, pasta / (root).
5. Aguarde a implantação e abra https://gilmar655.github.io/Mapa_localiza-o_equipes/. Se necessário, atualize com Ctrl+F5.

O pacote está pronto para publicação; sua entrega não altera automaticamente o site público.

## Importação Excel / CSV

O botão Importar base Excel / CSV substitui a base de consulta neste navegador. Todas as abas não vazias devem ter a coluna Projeto na primeira linha preenchida. Colunas adicionais são preservadas. Abas incompatíveis geram erro e mantêm a base anterior.

Filtros, indicadores, gráficos e tabela são recalculados. A importação fica salva neste navegador quando há espaço. Restaurar base publicada recupera a versão do site; uma nova versão de dados.js invalida a importação antiga.

Baixar CSV completo exporta toda a base ativa; Exportar filtrados exporta apenas o resultado dos filtros. Baixar arquivo da base fornece o Excel original publicado ou o arquivo recém-importado na sessão. Baixar dados para publicação gera dados.js: substitua esse arquivo no GitHub para atualizar a consulta para todos. Para trocar o download do Excel original, publique o novo Excel e ajuste seu nome em index.html e app.js.

CSV aceita ponto e vírgula, vírgula ou tabulação, campos entre aspas e quebras de linha. Excel aceita .xlsx (até 30 MB, 80 MB descompactados); o leitor não recalcula fórmulas, portanto salve-as recalculadas antes da importação.

## My Maps

Mapa incorporado e botão atualizados para:
https://www.google.com/maps/d/edit?mid=1kZbG01ey8w4VeP8FTa2MykKFCgyKw8A&usp=sharing

O My Maps tem camadas próprias: os filtros e a importação do site atualizam a tabela e os gráficos, mas não alteram o mapa externo. O botão Abrir Maps na tabela usa as coordenadas de cada registro. Não foram atribuídas coordenadas aos 56 registros sem localização válida.

Não foi possível confirmar a visualização pública do My Maps durante a atualização. Caso o mapa incorporado peça acesso, o proprietário deve habilitar a visualização para quem tem o link nas opções de compartilhamento do Google My Maps. O mapa externo precisa de internet.

## Arquivos

index.html, style.css, app.js, importacao.js e dados.js compõem o site. A pasta vendor contém JSZip e sua licença. A planilha original, CSV e JSON atualizados acompanham o pacote. Preserve os arquivos visuais e .nojekyll.
