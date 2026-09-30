// Retorna o contador de membros online do servidor da guilda.
// Usa o mesmo DISCORD_BOT_TOKEN do garmoth-coupons.js.

const GUILD_ID = '1444891989333115064';

exports.handler = async function () {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return json({ online: 0, total: 0, error: 'DISCORD_BOT_TOKEN não configurado' });

  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}?with_counts=true`,
      { headers: { 'authorization': `Bot ${token}` } }
    );
    if (!res.ok) throw new Error(`Discord API ${res.status}`);
    const data = await res.json();

    return json({
      online: data.approximate_presence_count || 0,
      total: data.approximate_member_count || 0,
      name: data.name || 'Lua Crescente'
    });
  } catch (err) {
    return json({ online: 0, total: 0, error: String(err && err.message || err) });
  }
};

function json(body) {
  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=120, s-maxage=120, stale-while-revalidate=300',
      'access-control-allow-origin': '*'
    },
    body: JSON.stringify(body)
  };
}