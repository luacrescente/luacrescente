// Lê os eventos "em andamento" direto do site oficial da Pearl Abyss (SA).
// Não existe API pública — então isso lê o HTML (que já vem pronto no
// servidor, sem precisar de JavaScript).
//
// v3 — parser de datas MUITO mais tolerante. A versão anterior só aceitava
// um formato exato e por isso descartava silenciosamente vários eventos.
// Agora:
//   1. Tenta JSON-LD (schema.org/Event) — mais confiável quando existe
//   2. Tenta <meta property="og:description">
//   3. Tenta <meta name="description">
//   4. Tenta o corpo da página com regex tolerante (múltiplos separadores)
//
// Também filtra o "ruído" do HTML (menus, rodapé) antes de procurar datas.

const BASE = 'https://www.sa.playblackdesert.com';
const LIST_URL = (page) => `${BASE}/pt-BR/News/Notice?boardType=3&progressType=1&Page=${page}`;
const DETAIL_URL = (id) => `${BASE}/pt-BR/News/Notice/Detail?groupContentNo=${id}`;

const headers = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'pt-BR,pt;q=0.9',
  'referer': `${BASE}/pt-BR/News/Notice?boardType=3`
};

const MAX_EVENTS = 80;
const MAX_PAGES = 5;

const MONTHS = {
  janeiro:0, fevereiro:1, março:2, marco:2, abril:3, maio:4, junho:5,
  julho:6, agosto:7, setembro:8, outubro:9, novembro:10, dezembro:11,
  jan:0, fev:1, mar:2, abr:3, mai:4, jun:5, jul:6, ago:7, set:8, out:9, nov:10, dez:11
};

function json(body, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600',
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

function decodeHtml(s='') {
  return String(s)
    .replace(/&nbsp;/gi,' ')
    .replace(/&amp;/gi,'&')
    .replace(/&quot;/gi,'"')
    .replace(/&#39;/gi,"'")
    .replace(/&#x27;/gi,"'")
    .replace(/&#x2F;/gi,'/')
    .replace(/&(eacute|aacute|atilde|acirc|agrave|ecirc|iacute|oacute|otilde|ocirc|uacute|ccedil|uuml|Eacute|Aacute|Atilde|Acirc|Agrave|Ecirc|Iacute|Oacute|Otilde|Ocirc|Uacute|Ccedil);/g,(_,n)=>HTML_ENTITIES[n]||'')
    .replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCharCode(parseInt(n,16)));
}

function stripTags(html='') {
  return decodeHtml(html)
    .replace(/<script[\s\S]*?<\/script>/gi,' ')
    .replace(/<style[\s\S]*?<\/style>/gi,' ')
    .replace(/<[^>]+>/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}

function extractIds(listHtml) {
  const ids = [];
  const seen = new Set();
  const re = /groupContentNo=(\d+)/g;
  let m;
  while ((m = re.exec(listHtml))) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    ids.push(m[1]);
  }
  return ids;
}

function extractTitle(html) {
  // 1) og:title (mais limpo)
  const og = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"/i);
  if (og) {
    const t = decodeHtml(og[1]).replace(/\s*\|\s*Black Desert SA\s*$/i,'').replace(/^\[Evento\]\s*/i,'').trim();
    if (t) return t;
  }
  // 2) <title>
  const m = html.match(/<title>([^<]*)<\/title>/i);
  if (!m) return null;
  let t = decodeHtml(m[1]).replace(/\s*\|\s*Black Desert SA\s*$/i,'').trim();
  t = t.replace(/^\[Evento\]\s*/i,'').trim();
  return t || null;
}

function extractImage(html) {
  const m = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]*)"/i);
  return m ? decodeHtml(m[1]) : null;
}

// --- Parser de datas ---

function buildDate(day, monthName, year, hour = 0, minute = 0) {
  const month = MONTHS[String(monthName).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')];
  const m2 = month !== undefined ? month : MONTHS[String(monthName).toLowerCase()];
  if (m2 === undefined) return null;
  // Datas dos eventos vêm em UTC-3 (Brasília). Armazenamos como ISO UTC.
  const d = new Date(Date.UTC(Number(year), m2, Number(day), Number(hour) + 3, Number(minute)));
  return isNaN(d.getTime()) ? null : d.toISOString();
}

// Aceita várias formas de separador: "até", "ate", "~", "–", "—", "-", "a"
const SEP = '(?:at[ée]|~|–|—|\\s-\\s|\\sa\\s)';
// Data completa: "1 de outubro de 2026 (qui.) 00:00 (UTC-3)" — parte do dia/semana/hora é opcional
const FULL_DATE = '(\\d{1,2})\\s+de\\s+([a-zA-ZçÇãÃéÉôÔáÁíÍóÓúÚ]+)(?:\\s+de\\s+(\\d{4}))?(?:\\s*\\([^)]*\\))?(?:\\s*(\\d{1,2}):(\\d{2}))?(?:\\s*\\((?:UTC|GMT)[^)]*\\))?';
// Formato curto: "01/10/2026 00:00" ou "01/10 00:00"
const SHORT_DATE = '(\\d{1,2})\\/(\\d{1,2})(?:\\/(\\d{2,4}))?(?:\\s+(\\d{1,2}):(\\d{2}))?';

function tryFullRange(text) {
  const re = new RegExp(FULL_DATE + '\\s*' + SEP + '\\s*' + FULL_DATE, 'i');
  const m = text.match(re);
  if (!m) return null;
  const [, d1, mo1, y1, h1, mi1, d2, mo2, y2, h2, mi2] = m;
  const year1 = y1 || new Date().getFullYear();
  const year2 = y2 || year1;
  const start = buildDate(d1, mo1, year1, h1 || 0, mi1 || 0);
  const end = buildDate(d2, mo2, year2, h2 || 23, mi2 || 59);
  if (!start || !end) return null;
  if (new Date(end) <= new Date(start)) return null;
  return { start, end };
}

function tryShortRange(text) {
  const re = new RegExp(SHORT_DATE + '\\s*' + SEP + '\\s*' + SHORT_DATE, 'i');
  const m = text.match(re);
  if (!m) return null;
  const [, d1, mo1, y1, h1, mi1, d2, mo2, y2, h2, mi2] = m;
  const now = new Date();
  const year1 = y1 ? (y1.length === 2 ? '20'+y1 : y1) : String(now.getFullYear());
  const year2 = y2 ? (y2.length === 2 ? '20'+y2 : y2) : year1;
  const start = buildDate(d1, Object.keys(MONTHS)[Number(mo1)-1] || '', year1, h1 || 0, mi1 || 0);
  const end = buildDate(d2, Object.keys(MONTHS)[Number(mo2)-1] || '', year2, h2 || 23, mi2 || 59);
  if (!start || !end) return null;
  if (new Date(end) <= new Date(start)) return null;
  return { start, end };
}

function tryJsonLd(html) {
  const scripts = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const s of scripts) {
    try {
      const inner = s.replace(/<script[^>]*>/i,'').replace(/<\/script>/i,'');
      const data = JSON.parse(inner);
      const candidates = Array.isArray(data) ? data : [data];
      for (const c of candidates) {
        if (c && (c['@type'] === 'Event' || c.startDate)) {
          const start = c.startDate ? new Date(c.startDate).toISOString() : null;
          const end = c.endDate ? new Date(c.endDate).toISOString() : null;
          if (start && end && new Date(end) > new Date(start)) return { start, end };
        }
      }
    } catch(_) {}
  }
  return null;
}

function extractDateRange(html) {
  // 1) JSON-LD
  const ld = tryJsonLd(html);
  if (ld) return ld;

  // 2) Meta tags (og:description, description)
  const metas = [
    html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]*)"/i),
    html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)
  ].filter(Boolean).map(m => decodeHtml(m[1]));

  for (const meta of metas) {
    const full = tryFullRange(meta);
    if (full) return full;
    const short = tryShortRange(meta);
    if (short) return short;
  }

  // 3) Corpo da página (sem scripts/styles/menus óbvios)
  const body = stripTags(html);
  // Remove trechos comuns de menu/footer pra não confundir o parser
  const cleaned = body
    .replace(/\b(?:Início|Novidades|Eventos|Atualizações|Notas|Guia|Comunidade|Suporte)\b/g,' ')
    .replace(/\s+/g,' ');

  const full = tryFullRange(cleaned);
  if (full) return full;
  const short = tryShortRange(cleaned);
  if (short) return short;

  return null;
}

exports.handler = async function () {
  try {
    const allIds = [];
    const seenIds = new Set();

    for (let page = 1; page <= MAX_PAGES && allIds.length < MAX_EVENTS; page++) {
      let listRes;
      try {
        listRes = await fetch(LIST_URL(page), { headers });
      } catch(_) { break; }

      if (!listRes.ok) {
        if (page === 1) return json({ events: [], error: 'lista indisponível ('+listRes.status+')' });
        break;
      }

      const listHtml = await listRes.text();
      const pageIds = extractIds(listHtml).filter(id => !seenIds.has(id));
      if (!pageIds.length) break;
      pageIds.forEach(id => { seenIds.add(id); allIds.push(id); });
    }

    const ids = allIds.slice(0, MAX_EVENTS);
    const events = [];

    // Concorrência limitada (5 por vez) pra não estourar o site da PA
    const CONCURRENCY = 5;
    for (let i = 0; i < ids.length; i += CONCURRENCY) {
      const slice = ids.slice(i, i + CONCURRENCY);
      await Promise.all(slice.map(async (id) => {
        try {
          const res = await fetch(DETAIL_URL(id), { headers });
          if (!res.ok) return;
          const html = await res.text();
          const range = extractDateRange(html);
          if (!range) return;
          const title = extractTitle(html);
          if (!title) return;
          events.push({
            id,
            title,
            link: DETAIL_URL(id),
            image: extractImage(html),
            start: range.start,
            end: range.end
          });
        } catch(_) {}
      }));
    }

    events.sort((a, b) => new Date(a.start) - new Date(b.start));
    return json({
      events,
      fetchedAt: new Date().toISOString(),
      total: events.length,
      idsFound: ids.length
    });
  } catch (err) {
    return json({ events: [], error: String(err && err.message || err) }, 200);
  }
};