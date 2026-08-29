# Lua Crescente — regras do projeto

## Objetivo
Site estático da guilda Lua Crescente, hospedado no Netlify.

## Regra principal
Preservar o comportamento existente. Alterações devem ser pequenas, rastreáveis e testadas.

## Fluxo obrigatório de trabalho
1. Antes de editar, mapear os arquivos envolvidos e suas dependências.
2. Propor o menor conjunto de alterações necessário para cumprir o pedido.
3. Alterar somente esses arquivos, salvo autorização explícita para ampliar o escopo.
4. Executar as verificações aplicáveis e informar quais arquivos foram modificados.
5. Registrar uma versão recuperável no Git antes de publicar.

## Estrutura
- `index.html`: Home.
- `receitas.html`: página de Receitas.
- `sala-de-aula.html`: Sala de Aula.
- `assets/css/`: estilos.
- `assets/js/`: código de execução do site.
- `assets/data/`: dados e traduções; não misturar dados com lógica de interface.
- `assets/img/`: imagens do site.
- `netlify/functions/`: funções serverless do Netlify.

## Regras de edição
- Não reconstruir páginas inteiras para corrigir um problema localizado.
- Não substituir o projeto inteiro por um ZIP novo para implementar uma alteração.
- Não mover arquivos sem atualizar todas as referências e verificar os caminhos.
- Não remover receitas, traduções, imagens ou funcionalidades existentes sem autorização.
- O item do menu deve se chamar `Receitas`.
- O menu não deve usar sublinhado padrão de link; o estado ativo usa o indicador visual já definido pelo CSS.
- Não substituir imagens reais por placeholders arbitrários.
- Manter o rodapé legal global em todas as páginas.
- Não transformar o projeto em SPA sem autorização explícita.
- Não introduzir React, banco de dados, backend adicional, framework ou etapa de build sem necessidade aprovada.
- Evitar dependências/bundlers desnecessários: o site deve continuar estático e leve.

## Controle de versões
- Cada mudança deve ter uma finalidade clara e uma descrição curta no histórico do Git.
- Não publicar com arquivos modificados sem revisar as diferenças.
- Se uma alteração causar regressão, restaurar a última versão funcional em vez de reescrever componentes sem diagnóstico.

## Dados
- `assets/data/recipes/recipes-data.js` contém o catálogo principal de receitas.
- `assets/data/recipes/recipe-metadata.js` contém sub-receitas e fontes auxiliares.
- `assets/data/i18n/translations-es-LATAM.js` contém nomes de itens em espanhol LATAM.
- `assets/data/ui-translations.js` contém textos da interface.

## Protocolo de auditoria e correção de receitas

### Regra-mãe
Ao auditar uma categoria, percorrer todos os itens e todas as cascatas até as folhas. Confirmar nome PT-BR, receita, quantidade, resultado produzido, alternativas e fonte de obtenção de cada elemento. Só considerar a categoria concluída quando não houver `a confirmar`, receita quebrada, referência antiga ou folha sem fonte.

### Escopo e percurso
- Auditar cada ramo completo: item principal → receita → sub-receita → ingredientes finais → fonte de obtenção.
- Não alterar categorias fora do pedido, exceto componentes compartilhados indispensáveis para a cascata auditada.
- A categoria `Poções` deve permanecer exatamente como está, salvo pedido explícito.
- Se um ingrediente possui receita própria, abrir sua cascata; ele não pode ser tratado como folha apenas por aparecer como ingrediente.
- Conferir todas as rotas e todas as alternativas de um item. Alternativas devem ser exibidas como escolhas individuais, nunca fundidas em um falso item único.

### Evidências e nomes
- Todo item-folha precisa de nome confirmado e fonte de obtenção concreta, útil ao jogador. Receita e fonte são verificações diferentes.
- `a confirmar` é uma pendência: pesquisar, confirmar nome, receita, quantidade e fonte, corrigir os dados e somente então remover o marcador.
- Conferir nomes em PT-BR no BDO Codex e em documentação oficial em português quando disponível. Nunca importar nomes do espanhol para o catálogo PT-BR.
- Unificar grafias duplicadas: definir o nome PT-BR correto e atualizar todas as referências para a mesma forma.
- Em conflito entre fonte antiga e atualização oficial mais recente, a atualização oficial prevalece; registrar o conflito na entrega da auditoria.

### Dados, resolução e interface
- Para cada receita, conferir ingredientes, quantidades e resultado produzido; diferenciar claramente receita individual de produção em massa.
- Verificar referências cruzadas ao renomear ou corrigir um item: receitas, sub-receitas, metadata, índices, fontes, ícones, rotas, Imortalidade e demais JavaScript.
- Não concluir pela mera ausência literal de `a confirmar`: verificar também os fallbacks gerados pelo runtime e se a árvore realmente renderiza.
- Confirmar que variantes e grupos de receitas são encontrados e exibidos pelo runtime, sem cair no fallback.
- Após cada correção, verificar todos os dependentes do item corrigido e executar uma segunda auditoria da área alterada.

### Relatório de auditoria
- Apresentar cada achado como: 🔴 erro confirmado, 🟡 não confirmado / necessita evidência, ou 🟢 confirmado.
- Não declarar uma categoria "concluída" ou "100% correta" sem percorrer e validar a árvore inteira.

## Testes obrigatórios após alterações
1. Validar sintaxe de todos os `.js`.
2. Verificar referências locais de `src` e `href`.
3. Verificar as três páginas: Home, Receitas e Sala de Aula.
4. Verificar menu, idioma, busca de receitas e carregamento das receitas.
5. Verificar função de cupons quando houver alteração relacionada a cupons.
6. Nunca publicar uma alteração sem manter uma versão anterior recuperável no Git.
