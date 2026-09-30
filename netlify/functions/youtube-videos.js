// Lê os últimos vídeos dos 2 canais via RSS público do YouTube.
// Sem chave de API, sem cota, sem cadastro.

const CHANNELS = {
  lore: 'UCfvzJu34LUMreEYcPzXVwgA',
  tutorial: 'UCCwIV4xwSPLrNEe1yBK_0SA'
};

exports.handler = async function () {
  try {
    const [lore, tut] = await Promise.all([
      fetchChannel(CHANNELS.lore),
      fetchChannel(CHANNELS.tutorial)
    ]);

    const combined = [
      ...lore.slice(0, 2).map(v => ({ ...v, source: 'lore' })),
      ...tut.slice(0, 3).map(v => ({ ...v, source: 'tutorial' }))
    ];

    combined.sort((a, b) => new Date(b.published) - new Date(a.published));

    return json({ videos: combined, fetchedAt: new Date().toISOString() });
  } catch (err) {
    return json({ videos: [], error: String(err && err.message || err) });
  }
};

async function fetchChannel(channelId) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const res = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'accept': 'application/xml, text/xml, */*'
    }
  });
  if (!res.ok) throw new Error(`RSS ${channelId}: HTTP ${res.status}`);
  const xml = await res.text();
  return parseRss(xml);
}

function parseRss(xml) {
  const entries = [];
  const re = /<entry>([\s\S]*?)<\/entry>/g;
  let m;
  while ((m = re.exec(xml))) {
    const block = m[1];
    const id = (block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || [])[1];
    const title = (block.match(/<title>([^<]+)<\/title>/) || [])[1];
    const published = (block.match(/<published>([^<]+)<\/published>/) || [])[1];
    const thumb = (block.match(/<media:thumbnail url="([^"]+)"/) || [])[1];
    const views = (block.match(/<media:statistics views="(\d+)"/) || [])[1];
    if (id && title) {
      entries.push({
        id,
        title: decodeXml(title),
        published,
        thumbnail: thumb || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        views: views ? Number(views) : null,
        url: `https://www.youtube.com/watch?v=${id}`
      });
    }
  }
  return entries;
}

function decodeXml(s) {
  return String(s)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function json(body) {
  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600',
      'access-control-allow-origin': '*'
    },
    body: JSON.stringify(body)
  };
}