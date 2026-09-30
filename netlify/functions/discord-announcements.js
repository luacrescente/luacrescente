// Lê os últimos 5 avisos do canal de avisos da guilda.

const CHANNEL_ID = '1444891990687748188';
const MAX = 5;

exports.handler = async function () {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return json({ announcements: [], error: 'DISCORD_BOT_TOKEN não configurado' });

  try {
    const res = await fetch(
      `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages?limit=${MAX}`,
      { headers: { 'authorization': `Bot ${token}` } }
    );
    if (!res.ok) throw new Error(`Discord API ${res.status}`);
    const messages = await res.json();
    if (!Array.isArray(messages)) throw new Error('formato inesperado');

    const posts = messages
      .filter(m => m.type === 0 || m.type === 19) // mensagem normal ou reply
      .map(msg => {
        const embed = Array.isArray(msg.embeds) && msg.embeds[0] ? msg.embeds[0] : null;
        const attachmentImg = Array.isArray(msg.attachments)
          ? msg.attachments.find(a => /\.(png|jpe?g|gif|webp)$/i.test(a.filename || a.url))
          : null;
        const image = (embed && embed.image && embed.image.url)
          || (embed && embed.thumbnail && embed.thumbnail.url)
          || (attachmentImg && attachmentImg.url)
          || null;
        const rawContent = msg.content || '';
        const title = (embed && embed.title) || firstLine(rawContent) || 'Aviso da guilda';
        const body = (embed && embed.description) || stripDiscordMd(rawContent);

        return {
          id: msg.id,
          title: stripDiscordMd(title),
          body,
          image,
          timestamp: msg.timestamp,
          author: msg.author && (msg.author.global_name || msg.author.username) || 'Guilda'
        };
      });

    return json({ announcements: posts, fetchedAt: new Date().toISOString() });
  } catch (err) {
    return json({ announcements: [], error: String(err && err.message || err) });
  }
};

function firstLine(s) {
  return String(s || '').split('\n').map(l => l.trim()).filter(Boolean)[0] || '';
}

function stripDiscordMd(s) {
  return String(s || '')
    .replace(/<@!?\d+>/g, '@membro')
    .replace(/<@&\d+>/g, '@cargo')
    .replace(/<#\d+>/g, '#canal')
    .replace(/<a?:([a-z0-9_]+):\d+>/gi, ':$1:')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .trim();
}

function json(body) {
  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=180, s-maxage=180, stale-while-revalidate=600',
      'access-control-allow-origin': '*'
    },
    body: JSON.stringify(body)
  };
}