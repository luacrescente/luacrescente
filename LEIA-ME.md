# Integração Blogger → Sala de Aula

## O que mudou

**Arquivos novos** (copiar para dentro do repositório, nos mesmos caminhos):
- `assets/js/blog-loader.js` — busca os posts do Blogger via API.
- `assets/js/home-guides.js` — preenche os 3 cards de guias na Home.
- `assets/js/sala-de-aula.js` — monta a página Sala de Aula (menu, busca, grid, artigo).
- `assets/css/blog.css` — estilos da Sala de Aula.

**Arquivos modificados** (substituir os originais por estes, ou aplicar `blog-changes.patch`):
- `index.html`
- `sala-de-aula.html`

## Como aplicar

Opção A — substituir os arquivos manualmente pelos desta pasta.

Opção B — aplicar o patch, dentro do repositório:
```
git apply blog-changes.patch
```
(e depois copiar os 4 arquivos novos pros caminhos indicados acima)

## Configuração já embutida no código

Em `assets/js/blog-loader.js`:
- Blog ID: `6902992025951664279`
- API Key: `AIzaSyCLJy6hFe1Ti3LN0Hggl1vcIhf-dAS6j-g`

## Como funciona

- A Home busca todos os posts publicados no Blogger e mostra os 3 mais recentes nos cards da seção "Sala de Aula".
- A página `/sala-de-aula.html` lista todos os guias, com busca por palavra-chave/tag e menu lateral em cascata (uma categoria por *label* do Blogger).
- Clicar em um guia abre `/sala-de-aula.html?post=<ID>`, que renderiza o artigo completo com índice (gerado a partir dos títulos H1/H2/H3 do post) — sem sair do layout do site.
- Nenhuma escrita acontece pelo site: publicar/editar guias continua sendo feito 100% pelo painel do Blogger.
- Nenhum deploy é disparado ao publicar um guia novo — o site apenas consulta a API na hora que o visitante abre a página.

## Testado localmente

O layout foi validado com dados simulados (grid, menu em cascata, filtro por categoria, busca e leitura de artigo com índice). Falta apenas testar com os posts reais do Blogger já publicados.

## Ponto de atenção

Se ao testar em produção a busca à API falhar por causa de CORS (pouco provável, pois a API REST do Blogger é feita para uso via navegador), a solução é mover a chamada para uma Netlify Function (o projeto já tem uma em `netlify/functions/garmoth-coupons.js` que serve de exemplo) — nesse caso, é só avisar que eu ajusto.
