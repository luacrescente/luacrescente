// Lê os eventos "em andamento" direto do site oficial da Pearl Abyss (SA) —
// não existe API pública pra isso, então isso lê o HTML deles (que já vem
// pronto no servidor, sem precisar de JavaScript). Se a Pearl Abyss mudar o
// layout dessas páginas um dia, essa function para de achar os padrões
// abaixo e simplesmente devolve uma lista vazia — não quebra o resto do site.
const LIST_URL = 'https://www.sa.playblackdesert.com/pt-BR/News/Notice?boardType=3&progressType=1';
const DETAIL_URL = (id) => `https://www.sa.playblackdesert.com/pt-BR/News/Detail?groupContentNo=${id}&countryType=pt-BR`;
const EVENT_PAGE_URL = (id) => `https://www.sa.playblackdesert.com/pt-BR/News/Detail?groupContentNo=${id}&countryType=pt-BR`;

// Mesmo cabeçalho "de navegador real" já usado na function dos cupons —
// evita bloqueio básico de bot (403) por parte de proteções tipo Cloudflare.
const headers = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'pt-BR,pt;q=0.9',
  'referer': 'https://www.sa.playblackdesert.com/pt-BR/News/Notice?boardType=3'
};

const MAX_EVENTS = 18; // limite de páginas de evento lidas por chamada, pra não sobrecarregar o site da PA

const MONTHS = {
  janeiro:0, fevereiro:1, março:2, marco:2, abril:3, maio:4, junho:5,
  julho:6, agosto:7, setembro:8, outubro:9, novembro:10, dezembro:11
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
  eacute:'é', eacute2:'é', aacute:'á', atilde:'ã', acirc:'â', agrave:'à',
  ecirc:'ê', iacute:'í', oacute:'ó', otilde:'õ', ocirc:'ô', uacute:'ú',
  ccedil:'ç', uuml:'ü',
  Eacute:'É', Aacute:'Á', Atilde:'Ã', Acirc:'Â', Agrave:'À',
  Ecirc:'Ê', Iacute:'Í', Oacute:'Ó', Otilde:'Õ', Ocirc:'Ô', Uacute:'Ú',
  Ccedil:'Ç'
};

function decodeHtml(s='') {
  return s
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

// Casa "1 de outubro de 2026 (qui.) 00:00 (UTC-3) até 31 de outubro de 2026 (sáb.) 23:59 (UTC-3)"
const DATE_RANGE_RE = /(\d{1,2})\s+de\s+([a-zçãéô]+)\s+de\s+(\d{4})\s*\([^)]*\)\s*(\d{1,2}):(\d{2})\s*\(UTC-3\)\s*at[ée]\s*(\d{1,2})\s+de\s+([a-zçãéô]+)\s+de\s+(\d{4})\s*\([^)]*\)\s*(\d{1,2}):(\d{2})\s*\(UTC-3\)/i;

function toIso(day, monthName, year, hour, minute) {
  const month = MONTHS[String(monthName).toLowerCase()];
  if (month === undefined) return null;
  // Horário do evento já é UTC-3 (Brasília); guardamos como UTC+3h pra representar isso certo.
  const d = new Date(Date.UTC(Number(year), month, Number(day), Number(hour) + 3, Number(minute)));
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function extractIds(listHtml) {
  const ids = [];
  const seen = new Set();
  const re = /Detail\?groupContentNo=(\d+)/g;
  let m;
  while ((m = re.exec(listHtml)) && ids.length < MAX_EVENTS) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    ids.push(m[1]);
  }
  return ids;
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  if (!m) return null;
  let t = decodeHtml(m[1]).replace(/\s*\|\s*Black Desert SA\s*$/i,'').trim();
  t = t.replace(/^\[Evento\]\s*/i,'').trim();
  return t || null;
}

function extractDateRange(html) {
  // A faixa de data aparece tanto no corpo da página quanto na meta-description;
  // a meta é mais confiável (não corre risco de ser cortada por uma tag no meio).
  const metaMatch = html.match(/<meta[^>]+(?:name="description"|property="og:description")[^>]+content="([^"]*)"/i);
  const bodyText = stripTags(html);
  const metaText = metaMatch ? decodeHtml(metaMatch[1]) : '';
  const candidate = DATE_RANGE_RE.test(metaText) ? metaText : bodyText;
  const m = candidate.match(DATE_RANGE_RE);
  if (!m) return null;
  const start = toIso(m[1], m[2], m[3], m[4], m[5]);
  const end = toIso(m[6], m[7], m[8], m[9], m[10]);
  if (!start || !end) return null;
  return { start, end };
}

function extractImage(html) {
  const m = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]*)"/i);
  return m ? decodeHtml(m[1]) : null;
}

exports.handler = async function () {
  try {
    const listRes = await fetch(LIST_URL, { headers });
    if (!listRes.ok) return json({ events: [], error: 'lista indisponível ('+listRes.status+')' });
    const listHtml = await listRes.text();
    const ids = extractIds(listHtml);

    const events = [];
    await Promise.all(ids.map(async (id) => {
      try {
        const res = await fetch(DETAIL_URL(id), { headers });
        if (!res.ok) return;
        const html = await res.text();
        const range = extractDateRange(html);
        if (!range) return; // evento permanente/sem data fixa — não entra na linha do tempo
        const title = extractTitle(html) || 'Evento';
        events.push({
          id,
          title,
          link: EVENT_PAGE_URL(id),
          image: extractImage(html),
          start: range.start,
          end: range.end
        });
      } catch (_) { /* ignora esse evento pontualmente, sem quebrar os outros */ }
    }));

    events.sort((a, b) => new Date(a.start) - new Date(b.start));

    return json({ events, fetchedAt: new Date().toISOString() });
  } catch (err) {
    return json({ events: [], error: String(err && err.message || err) }, 200);
  }
};
