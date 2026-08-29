# Lua Crescente

Site estático da guilda Lua Crescente.

## Estrutura atual

```text
.
├── index.html
├── receitas.html
├── sala-de-aula.html
├── assets/
│   ├── css/
│   │   ├── site.css
│   │   └── coupons.css
│   ├── data/
│   │   ├── i18n/
│   │   │   └── translations-es-LATAM.js
│   │   ├── recipes/
│   │   │   ├── assets/data/recipes/categories/*.js
│   │   │   └── recipe-metadata.js
│   │   └── ui-translations.js
│   ├── img/
│   └── js/
│       └── site-runtime.js
├── netlify/
│   └── functions/
│       └── garmoth-coupons.js
├── AGENTS.md
├── netlify.toml
└── README.md
```

## Princípio de manutenção

O projeto usa HTML separado por página, CSS separado dos dados e JavaScript separado do catálogo de receitas. Não é necessário um build step para publicar no Netlify.

Antes de qualquer alteração, ler `AGENTS.md`.

## Publicação

O diretório raiz do projeto é o diretório publicado pelo Netlify. As funções ficam em `netlify/functions/`.
