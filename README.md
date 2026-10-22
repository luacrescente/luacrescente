# Lua Crescente

Site estático da guilda Lua Crescente.

## Estrutura atual

```text
.
├── index.html
├── receitas.html
├── sala-de-aula.html
├── combos.html
├── 404.html
├── assets/
│   ├── css/
│   │   ├── site.css
│   │   ├── coupons.css
│   │   ├── events.css
│   │   └── blog.css
│   ├── data/
│   │   ├── i18n/
│   │   │   └── translations-es-LATAM.js
│   │   ├── recipes/
│   │   │   ├── categories/*.json
│   │   │   └── recipe-metadata.js
│   │   └── ui-translations.js
│   ├── img/
│   └── js/
│       ├── site-runtime.js
│       ├── recipe-loader.js
│       ├── combos.js
│       ├── world-cycle.js
│       ├── boss-timer.js
│       ├── guild-boss-timer.js
│       ├── bdo-events.js
│       ├── blog-loader.js
│       ├── home-guides.js
│       └── sala-de-aula.js
├── netlify/
│   └── functions/
│       ├── garmoth-coupons.js
│       ├── bdo-events.js
│       ├── discord-announcements.js
│       ├── discord-guild.js
│       └── youtube-videos.js
├── AGENTS.md
├── netlify.toml
└── README.md