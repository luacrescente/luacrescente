// Lê os eventos "em andamento" direto do site oficial da Pearl Abyss (SA).
//
// v4 — MUDANÇA DE ARQUITETURA:
// A lista de eventos da PA (página 1 e 2) JÁ TRAZ tudo que precisamos:
//   - título (dentro de <strong class="title"><em>...</em></strong>)
//   - link completo (href do <a>)
//   - thumbnail (src do <img>)
//   - "Xd restantes" OU "Permanente" (dentro de <span class="count">)
//
// Então NÃO entramos em cada página de evento individualmente.
// Isso deixa o parser:
//   1. MUITO mais rápido (2 requests em vez de 30+)
//   2. MUITO mais robusto (não depende do formato de data da PA)
//   3. 100% dos eventos entram (inclusive permanentes)
//
// A "data de início" real não existe na lista — então o frontend
// usa localStorage pra guardar quando cada evento foi visto pela 1ª vez.
//
// Cache: 24h normal; 5 min entre quinta 8h-10h (horário de Brasília),
// porque a PA atualiza os eventos toda quinta às 8h.

const BASE = 'https://www.sa.playblackdesert.com';
const LIST_URL = (page) =>
  `${BASE}/pt-BR/News/Notice?boardType=3&progressType=1&searchType=&searchText=&Page=${page}`;

const headers = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'pt-BR,pt;q=0.9',
  'referer': `${BASE}/pt-BR/News/Notice?boardType=3`
};

const MAX_PAGES = 5;   // teto de segurança; na prática são 2
const MAX_EVENTS = 100;

// Cache dinâmico: quinta 8h-10h (Brasília) → 5 min; resto → 24h
function cacheSeconds() {
  const now = new Date();
  // Brasília = UTC-3
  const br = new Date(now.getTime() - 3 * 3600 * 1000);
  const day = br.getUTCDay();    // 0=dom, 4=qui
  const hour = br.getUTCHours();
  if (day === 4 && hour >= 8 && hour < 10) return 300;   // 5 min
  return 86400;                                          // 24h
}

function json(body, statusCode = 200) {
  const cc = cacheSeconds();
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${cc}, s-maxage=${cc}, stale-while-revalidate=600`,
      'access-control-allow-origin': '*'
    },
    body: JSON.stringify(body)
  };
}

const HTML_ENTITIES = {
  eacute:'é', aacute:'á', atilde:'ã', acirc:'â', agrave:'à',
  ecirc:'ê', iacute:'í', oacute:'ó', otilde:'õ', ocirc:'ô', uacute:'ú',
  ccedil:'ç', uuml:'ü',
  Eacute:'É', Aacute:'Á', Atilde:'Ã', Acirc:'Â', Agrave:'À',
  Ecirc:'Ê', Iacute:'Í', Oacute:'Ó', Otilde:'Õ', Ocirc:'Ô', Uacute:'Ú',
  Ccedil:'Ç'
};

function decodeHtml(s = '') {
  return String(s)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, '/')
    .replace(/&(eacute|aacute|atilde|acirc|agrave|ecirc|iacute|oacute|otilde|ocirc|uacute|ccedil|uuml|Eacute|Aacute|Atilde|Acirc|Agrave|Ecirc|Iacute|Oacute|Otilde|Ocirc|Uacute|Ccedil);/g,
      (_, n) => HTML_ENTITIES[n] || '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function stripTags(html = '') {
  return decodeHtml(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Extrai os <li> de dentro de <div class="event_list"><ul>...</ul></div>
function extractEventBlocks(html) {
  // Pega o bloco inteiro do event_list
  const listMatch = html.match(/<div\s+class="event_list">\s*<ul>([\s\S]*?)<\/ul>\s*<\/div>/i);
  if (!listMatch) return [];
  const listHtml = listMatch[1];

  // Divide em <li>...</li>
  const blocks = [];
  const re = /<li>([\s\S]*?)<\/li>/gi;
  let m;
  while ((m = re.exec(listHtml))) {
    blocks.push(m[1]);
  }
  return blocks;
}

// Extrai um objeto de cada <li>
function parseEventBlock(block) {
  // Link + id (groupContentNo)
  const linkMatch = block.match(/href="(https?:\/\/[^"]*?groupContentNo=(\d+)[^"]*)"/i);
  if (!linkMatch) return null;
  const link = decodeHtml(linkMatch[1]);
  const id = linkMatch[2];

  // Título (dentro de <strong class="title"><em>...</em></strong>)
  const titleMatch = block.match(/<strong\s+class="title">\s*<em>([\s\S]*?)<\/em>\s*<\/strong>/i);
  if (!titleMatch) return null;
  const title = stripTags(titleMatch[1]);
  if (!title) return null;

  // Thumbnail (src do <img>)
  const imgMatch = block.match(/<img\s+src="([^"]+)"/i);
  const thumbnail = imgMatch ? decodeHtml(imgMatch[1]) : null;

  // "Xd restantes" ou "Permanente"
  const countMatch = block.match(/<span\s+class="count">([\s\S]*?)<\/span>/i);
  let isPermanent = false;
  let daysLeft = null;
  if (countMatch) {
    const countText = stripTags(countMatch[1]);
    if (/permanente/i.test(countText)) {
      isPermanent = true;
    } else {
      const dm = countText.match(/(\d+)\s*dias?\s*restantes?/i);
      if (dm) daysLeft = Number(dm[1]);
    }
  }

  // Se não achou nem dias nem permanente, ignora
  if (!isPermanent && daysLeft === null) return null;

  return { id, title, link, thumbnail, isPermanent, daysLeft };
}

exports.handler = async function () {
  try {
    const allEvents = [];
    const seenIds = new Set();
    let pagesRead = 0;

    for (let page = 1; page <= MAX_PAGES && allEvents.length < MAX_EVENTS; page++) {
      let res;
      try {
        res = await fetch(LIST_URL(page), { headers });
      } catch (_) {
        break; // falha de rede — segue com o que já tem
      }

      if (!res.ok) {
        if (page === 1) return json({ events: [], error: 'lista indisponível (' + res.status + ')' });
        break;
      }

      const html = await res.text();
      const blocks = extractEventBlocks(html);
      if (!blocks.length) break; // sem blocos = fim das páginas

      let newInThisPage = 0;
      for (const block of blocks) {
        const ev = parseEventBlock(block);
        if (!ev) continue;
        if (seenIds.has(ev.id)) continue;
        seenIds.add(ev.id);
        allEvents.push(ev);
        newInThisPage++;
      }
      pagesRead++;

      // Se essa página não trouxe nenhum evento novo, acabou.
      if (newInThisPage === 0) break;
    }

    // Ordenação final: com prazo primeiro (menor daysLeft no topo),
    // depois permanentes em ordem alfabética.
    allEvents.sort((a, b) => {
      if (a.isPermanent !== b.isPermanent) return a.isPermanent ? 1 : -1;
      if (!a.isPermanent) return (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999);
      return a.title.localeCompare(b.title, 'pt-BR');
    });

    return json({
      events: allEvents,
      fetchedAt: new Date().toISOString(),
      pagesRead,
      total: allEvents.length
    });
  } catch (err) {
    return json({ events: [], error: String((err && err.message) || err) }, 200);
  }
};