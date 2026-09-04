const GARMOTH_URLS = [
  'https://garmoth.com/coupons?server=sa',
  'https://garmoth.com/coupons/?server=sa',
  'https://dev.garmoth.com/coupons?server=sa'
];
const API_URLS = [
  'https://api.garmoth.com/api/coupons?region=sa',
  'https://api.garmoth.com/api/coupons?server=sa',
  'https://api.garmoth.com/api/coupons'
];

// Fonte principal: o bot oficial do Garmoth já posta cada cupom novo no canal
// #cupom do Discord da guilda assim que é lançado. Ler dali é muito mais
// confiável do que tentar acessar garmoth.com direto (que bloqueia com 403).
// O ID do canal pode ser sobrescrito por variável de ambiente se precisar.
const DISCORD_COUPON_CHANNEL_ID = process.env.DISCORD_COUPON_CHANNEL_ID || '1444891990452994199';

// Headers que imitam um navegador real. O antigo user-agent "compatible; ...Coupons/1.0"
// se identificava explicitamente como bot, o que faz proteções tipo Cloudflare barrarem
// a requisição com 403 antes mesmo de tentar servir o conteúdo.
const headers = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  'referer': 'https://garmoth.com/',
  'upgrade-insecure-requests': '1',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'same-origin',
  'sec-fetch-dest': 'document'
};
const apiHeaders = {
  ...headers,
  'accept': 'application/json,text/plain,*/*',
  'sec-fetch-mode': 'cors',
  'sec-fetch-dest': 'empty',
  'sec-fetch-site': 'same-site',
  'referer': 'https://garmoth.com/coupons?server=sa'
};

// Plano B: se o Garmoth continuar bloqueando (403/JS challenge), busca a mesma página
// através de um leitor de páginas de terceiros. Ele usa outro IP/infra e costuma passar
// por bloqueios básicos de bot, além de já renderizar conteúdo carregado via JavaScript.
const READER_URLS = [
  'https://r.jina.ai/https://garmoth.com/coupons?server=sa'
];

function json(body, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
      'access-control-allow-origin': '*'
    },
    body: JSON.stringify(body)
  };
}

function decodeHtml(s='') {
  return s
    .replace(/&nbsp;/gi,' ')
    .replace(/&amp;/gi,'&')
    .replace(/&quot;/gi,'"')
    .replace(/&#39;/gi,"'")
    .replace(/&#x27;/gi,"'")
    .replace(/&#x2F;/gi,'/')
    .replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n)));
}
function cleanHtml(value='') {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi,' ')
    .replace(/<style[\s\S]*?<\/style>/gi,' ')
    .replace(/<[^>]+>/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}
function attr(tag,name) {
  const re = new RegExp('(?:'+name+')\\s*=\\s*[\"\']([^\"\']*)[\"\']','i');
  const m = tag.match(re);
  return m ? decodeHtml(m[1]) : '';
}
function absoluteUrl(src, base) {
  if (!src) return '';
  try { return new URL(src, base).href; } catch (_) { return src; }
}
function normalizeCode(code='') {
  return decodeHtml(String(code)).trim().replace(/\s+/g,'');
}
function looksLikeCoupon(code='') {
  const c=normalizeCode(code);
  if (!c || c.length<8 || c.length>40) return false;
  return /^(?:[A-Z0-9]{4}-){2,8}[A-Z0-9]{2,8}$/i.test(c) || /^[A-Z0-9]{10,32}$/i.test(c);
}
function uniqueCoupons(list) {
  const seen=new Set();
  return list.filter(c=>{
    const k=normalizeCode(c.code).toUpperCase();
    if(!looksLikeCoupon(k)||seen.has(k)) return false;
    seen.add(k); return true;
  }).slice(0,10);
}
function extractRewardEntries(block, base) {
  const entries=[];
  for(const m of block.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
    const li=m[0];
    const text=cleanHtml(m[1]);
    if(!/^\d+x\s/i.test(text)) continue;
    const mm=text.match(/^(\d+)x\s*(.*)$/i);
    const qty=mm?mm[1]:'';
    const name=mm?mm[2].trim():text;
    let image='';
    const img=li.match(/<img\b[^>]*>/i);
    if(img) {
      const tag=img[0];
      const src=attr(tag,'src')||attr(tag,'data-src')||attr(tag,'data-lazy-src')||attr(tag,'data-original')||attr(tag,'data-image');
      if(src) image=absoluteUrl(src,base);
      if(!image) {
        const srcset=attr(tag,'srcset');
        if(srcset) image=absoluteUrl(srcset.split(',')[0].trim().split(/\s+/)[0],base);
      }
    }
    if(!image) {
      const bg=li.match(/background-image\s*:\s*url\(([^)]+)\)/i);
      if(bg) image=absoluteUrl(bg[1].replace(/["']/g,''),base);
    }
    if(!image) image=iconForRewardName(name);
    // Garmoth/item markup can expose the BDO item id without an <img> URL.
    if(!image) {
      const idm=li.match(/(?:data-main-key|data-mainkey|data-item-id|data-itemid|main_key|mainKey)\s*=\s*["']?(\d{2,7})/i);
      if(idm) image=`https://s1.pearlcdn.com/NAEU/TradeMarket/Common/img/BDO/item/${idm[1]}.png`;
    }
    entries.push({name,qty,image});
  }
  return entries.slice(0,10);
}
function extractItems(block) {
  return extractRewardEntries(block,'').map(x=>`${x.qty?x.qty+'x ':''}${x.name}`);
}
function extractImages(block, base) {
  const out=[];
  const seen=new Set();
  const add=(u)=>{
    if(!u) return;
    const v=absoluteUrl(String(u).replace(/&amp;/g,'&').replace(/&quot;/g,'\"').replace(/^['\"]|['\"]$/g,''),base);
    if(!/^https?:\/\//i.test(v)) return;
    if(!/(pearlcdn|garmoth|item|icon|tooltip|assets\.)/i.test(v)) return;
    if(seen.has(v)) return;
    seen.add(v); out.push(v);
  };
  for(const m of block.matchAll(/<img\b[^>]*>/gi)){
    const tag=m[0];
    for(const a of ['src','data-src','data-lazy-src','data-original','data-image','data-icon','data-thumbnail']) add(attr(tag,a));
    const ss=attr(tag,'srcset');
    if(ss) add(ss.split(',').pop().trim().split(/\s+/)[0]);
  }
  for(const m of block.matchAll(/background-image\s*:\s*url\(([^)]+)\)/gi)) add(m[1]);
  for(const m of block.matchAll(/(?:data-icon|data-image|data-item-image|data-thumbnail)\s*=\s*["']([^"']+)["']/gi)) add(m[1]);
  return out;
}

const REWARD_ICON_IDS = {
  'High-quality Food Box': 757423,
  'Perfume of Tenacity': 1413,
  'Perfume of Envy': 1411,
  '[Party] Harmony Draught - Human': 1401,
  '[Party] Harmony Draught - Demihuman': 1403,
  '[Party] Harmony Draught - Kamasylvia': 1405,
  '[Party] Harmony Draught - Edania': 1407
};
function iconForRewardName(name){
  const id=REWARD_ICON_IDS[String(name||'').trim()];
  return id ? `https://s1.pearlcdn.com/NAEU/TradeMarket/Common/img/BDO/item/${id}.png` : '';
}
function expiryFrom(text) {
  const m=text.match(/Expires\s+in\s+[^.]{1,80}/i);
  if(m) return m[0].trim();
  const m2=text.match(/Expir(?:es|ed)\s+[^.]{1,80}/i);
  return m2 ? m2[0].trim() : 'Cupom ativo';
}

function parseGarmothHtml(html, baseUrl) {
  if(!html || !/<input\b/i.test(html)) return [];
  const availableMatch=html.match(/<h2[^>]*>\s*Available\s*<\/h2>/i);
  const unavailableMatch=html.match(/<h2[^>]*>\s*Unavailable\s*<\/h2>/i);
  const start=availableMatch ? availableMatch.index+availableMatch[0].length : 0;
  const end=unavailableMatch && unavailableMatch.index>start ? unavailableMatch.index : html.length;
  const active=html.slice(start,end);
  const found=[];

  // Garmoth has changed the coupon card markup more than once. First try input attributes.
  for(const m of active.matchAll(/<input\b[^>]*>/gi)) {
    const tag=m[0];
    const candidates=[attr(tag,'value'),attr(tag,'id'),attr(tag,'data-code'),attr(tag,'data-coupon'),attr(tag,'name')];
    const code=candidates.map(normalizeCode).find(looksLikeCoupon);
    if(!code) continue;
    const pos=m.index;
    const block=active.slice(Math.max(0,pos-2500),Math.min(active.length,pos+12000));
    const rewards=extractRewardEntries(block,baseUrl);
    const broadImages=extractImages(block,baseUrl);
    const normalizedRewards=rewards.map((x,i)=>({...x,image:x.image||broadImages[i]||iconForRewardName(x.name)}));
    found.push({code,expiry:expiryFrom(cleanHtml(block)),items:normalizedRewards.length?normalizedRewards:extractItems(block),images:normalizedRewards.map(x=>x.image).filter(Boolean),source:'Garmoth'});
  }

  // If the input value is hidden from the HTML parser, recover coupon-looking tokens from raw HTML.
  if(!found.length) {
    const tokenRe=/(?<![A-Z0-9])(?:[A-Z0-9]{4}-){2,8}[A-Z0-9]{2,8}(?![A-Z0-9])/gi;
    for(const m of active.matchAll(tokenRe)) {
      const code=normalizeCode(m[0]);
      const block=active.slice(Math.max(0,m.index-2500),Math.min(active.length,m.index+12000));
      const rewards=extractRewardEntries(block,baseUrl);
    const broadImages=extractImages(block,baseUrl);
    const normalizedRewards=rewards.map((x,i)=>({...x,image:x.image||broadImages[i]||iconForRewardName(x.name)}));
    found.push({code,expiry:expiryFrom(cleanHtml(block)),items:normalizedRewards.length?normalizedRewards:extractItems(block),images:normalizedRewards.map(x=>x.image).filter(Boolean),source:'Garmoth'});
    }
  }
  return uniqueCoupons(found);
}

function normalizeReward(raw) {
  if(typeof raw==='string') return {name:raw,qty:'',image:''};
  const name=raw?.name||raw?.title||raw?.item_name||raw?.label||raw?.item?.name||'Recompensa';
  const qty=String(raw?.qty??raw?.quantity??raw?.count??raw?.amount??raw?.item_count??'');
  let image=raw?.image||raw?.icon||raw?.icon_url||raw?.image_url||raw?.item_image||raw?.thumbnail||raw?.item?.image||raw?.item?.icon||'';
  const id=raw?.main_key??raw?.mainKey??raw?.item_id??raw?.itemId??raw?.item?.main_key??raw?.item?.mainKey;
  if(!image && id) image=`https://s1.pearlcdn.com/NAEU/TradeMarket/Common/img/BDO/item/${id}.png`;
  if(!image) image=iconForRewardName(name);
  return {name:String(name),qty,image:String(image||'')};
}
function normalizeApi(payload) {
  const raw=Array.isArray(payload)?payload:(payload?.data||payload?.coupons||payload?.items||[]);
  if(!Array.isArray(raw)) return [];
  return uniqueCoupons(raw.map(c=>{
    const rewards=Array.isArray(c.items)?c.items:(Array.isArray(c.rewards)?c.rewards:[]);
    const normalizedRewards=rewards.map(normalizeReward);
    const images=normalizedRewards.map(x=>x.image).filter(Boolean);
    return {
      code:c.code||c.coupon||c.coupon_code||c.id||'',
      expiry:c.expiry||c.expires_at||c.expiration||c.expiration_date||c.expires||'Cupom ativo',
      items:normalizedRewards,
      images,
      source:'Garmoth API'
    };
  }));
}
async function fetchApiCoupons() {
  for(const url of API_URLS) {
    try {
      const r=await fetch(url,{headers:apiHeaders,redirect:'follow'});
      if(!r.ok) continue;
      const p=await r.json(); const c=normalizeApi(p);
      if(c.length) return c;
    } catch (_) {}
  }
  return [];
}

// Parser para o texto "limpo" devolvido pelo leitor de páginas (sem tags HTML).
// O código do cupom normalmente aparece como texto visível na página (não só
// como valor de <input>), então procuramos tokens que parecem cupom e olhamos
// o texto ao redor pra achar validade e recompensas ("5x Nome do Item").
function parseReaderText(text) {
  if(!text) return [];
  const found=[];
  const tokenRe=/\b(?:[A-Z0-9]{4}-){2,8}[A-Z0-9]{2,8}\b|\b[A-Z0-9]{10,32}\b/g;
  for(const m of text.matchAll(tokenRe)) {
    const code=normalizeCode(m[0]);
    if(!looksLikeCoupon(code)) continue;
    const start=Math.max(0,m.index-600);
    const end=Math.min(text.length,m.index+2000);
    const block=text.slice(start,end);
    const items=[];
    for(const lm of block.matchAll(/(\d+)\s*[xX]\s+([^\n]{2,80})/g)) {
      items.push(`${lm[1]}x ${lm[2].trim()}`);
    }
    found.push({code,expiry:expiryFrom(block),items,images:[],source:'Garmoth (reader)'});
  }
  return uniqueCoupons(found);
}
async function fetchReaderCoupons() {
  for(const url of READER_URLS) {
    try {
      const r=await fetch(url,{headers:{'accept':'text/plain,text/markdown,text/html;q=0.9,*/*;q=0.8'},redirect:'follow'});
      if(!r.ok) continue;
      const text=await r.text();
      const coupons=parseReaderText(text);
      if(coupons.length) return coupons;
    } catch (_) {}
  }
  return [];
}

// Extrai um cupom de um embed de mensagem do Discord (formato que o bot do
// Garmoth usa: título, descrição, campos "Expires"/"Items" e uma thumbnail
// com o ícone do item). Só aceita embeds que mencionem o Garmoth, pra não
// confundir com outras mensagens do canal.
// O Discord posta a validade como um timestamp dinâmico do próprio Discord,
// tipo "<t:1790899140:R>", que o cliente Discord troca por "em 14 dias" na
// hora de exibir. Como recebemos o texto cru pela API, fazemos essa conta
// nós mesmos aqui.
function formatDiscordTimestamps(raw) {
  if(!raw) return raw;
  return raw.replace(/<t:(-?\d+):[a-zA-Z]>/g,(_,secs)=>{
    const ms=Number(secs)*1000;
    if(!Number.isFinite(ms)) return '';
    const diff=ms-Date.now();
    if(diff<=0) return 'expirado';
    const hours=diff/3600000;
    if(hours<20) return `em ${Math.max(1,Math.round(hours))} hora${Math.round(hours)===1?'':'s'}`;
    const days=Math.round(diff/86400000);
    if(days<60) return `em ${days} dia${days===1?'':'s'}`;
    const months=Math.round(days/30);
    return `em ${months} ${months===1?'mês':'meses'}`;
  });
}

function parseDiscordEmbedCoupon(embed, postedAt) {
  if(!embed) return null;
  const fields = Array.isArray(embed.fields) ? embed.fields : [];
  const haystack = [embed.title, embed.description, embed.footer && embed.footer.text, embed.author && embed.author.name]
    .concat(fields.map(f=>`${f.name} ${f.value}`))
    .filter(Boolean).join('\n');
  if(!/garmoth/i.test(haystack)) return null;

  const tokenRe=/\b(?:[A-Z0-9]{4}-){2,8}[A-Z0-9]{2,8}\b|\b[A-Z0-9]{10,32}\b/g;
  const codeCandidates=[...haystack.matchAll(tokenRe)].map(m=>normalizeCode(m[0]));
  const code=codeCandidates.find(looksLikeCoupon);
  if(!code) return null;

  const expiryField=fields.find(f=>/expir|⏳/i.test(f.name||''));
  const itemsField=fields.find(f=>/item|🎁|recompensa/i.test(f.name||''));
  let expiry=expiryField ? String(expiryField.value||'').trim() : 'Cupom ativo';
  expiry=formatDiscordTimestamps(expiry);
  expiry=decodeHtml(expiry).replace(/\n+/g,' ').trim();
  if(expiry && !/expir/i.test(expiry)) expiry=`Expira ${expiry}`;

  const itemLines=itemsField ? String(itemsField.value||'').split(/\n+/).map(s=>decodeHtml(s.trim())).filter(Boolean) : [];
  // O Discord usa "thumbnail" pro avatar do bot (o dragãozinho, no canto
  // superior direito) e "image" pro ícone do item em si (abaixo dos campos).
  // Tínhamos isso invertido, por isso aparecia o mascote no lugar do item.
  const thumb=(embed.image && embed.image.url) || (embed.thumbnail && embed.thumbnail.url) || '';
  const items=itemLines.map((line,i)=>{
    const m=line.match(/^(\d+)\s*[xX]\s*(.*)$/);
    const qty=m?m[1]:'';
    const name=m?m[2].trim():line;
    return {name,qty,image:i===0?thumb:''};
  });

  // O rodapé original diz "Provided by Garmoth.com" — como o site não é mais
  // afiliado a eles, usamos nossa própria atribuição aqui.
  return {code,expiry,items,images:thumb?[thumb]:[],postedAt:postedAt||'',provider:'Lua Crescente',source:'Garmoth (Discord)'};
}

async function fetchDiscordCoupons() {
  const token=process.env.DISCORD_BOT_TOKEN;
  if(!token) throw new Error('DISCORD_BOT_TOKEN não configurado');
  const r=await fetch(`https://discord.com/api/v10/channels/${DISCORD_COUPON_CHANNEL_ID}/messages?limit=30`,{
    headers:{'authorization':`Bot ${token}`}
  });
  if(!r.ok) throw new Error(`Discord API ${r.status}`);
  const messages=await r.json();
  if(!Array.isArray(messages)) throw new Error('Discord API retornou formato inesperado');
  const found=[];
  // Mensagens vêm da mais nova pra mais antiga; mantemos essa ordem.
  for(const msg of messages) {
    const embeds=Array.isArray(msg.embeds) ? msg.embeds : [];
    const postedAt=msg.timestamp ? String(msg.timestamp).slice(0,10) : '';
    for(const embed of embeds) {
      const parsed=parseDiscordEmbedCoupon(embed,postedAt);
      if(parsed) found.push(parsed);
    }
  }
  return uniqueCoupons(found);
}

async function fetchPage() {
  let last='';
  for(const url of GARMOTH_URLS) {
    try {
      const r=await fetch(url,{headers,redirect:'follow'});
      if(r.ok) {
        const html=await r.text();
        if(/<input\b/i.test(html) && /(?:Available|Expires in)/i.test(html)) return {html,url};
      }
      last=`Garmoth ${r.status}`;
    } catch(e) { last=String(e.message||e); }
  }
  throw new Error(last||'Falha ao consultar Garmoth');
}

// Current known coupons are only a safety net for a temporary upstream outage.
// They are replaced automatically whenever Garmoth responds again.
const KNOWN_CURRENT = [
  {code:'EDANIADAY4CHEERS',expiry:'Expira em 18 dias',items:['5x High-quality Food Box','5x Perfume of Tenacity','5x Perfume of Envy','8x [Party] Harmony Draught - Human','8x [Party] Harmony Draught - Demihuman','8x [Party] Harmony Draught - Kamasylvia','8x [Party] Harmony Draught - Edania'],images:[]},
  {code:'EDANIADAY3LETSGO',expiry:'Expira em 18 dias',items:['5x High-quality Food Box','5x Perfume of Tenacity','5x Perfume of Envy','8x [Party] Harmony Draught - Human','8x [Party] Harmony Draught - Demihuman','8x [Party] Harmony Draught - Kamasylvia','8x [Party] Harmony Draught - Edania'],images:[]},
  {code:'EDANIADAY2WITHUS',expiry:'Expira em 18 dias',items:['5x High-quality Food Box','5x Perfume of Tenacity','5x Perfume of Envy','8x [Party] Harmony Draught - Human','8x [Party] Harmony Draught - Demihuman','8x [Party] Harmony Draught - Kamasylvia','8x [Party] Harmony Draught - Edania'],images:[]},
  {code:'EDANIADAY1FORYOU',expiry:'Expira em 18 dias',items:['5x High-quality Food Box','5x Perfume of Tenacity','5x Perfume of Envy','8x [Party] Harmony Draught - Human','8x [Party] Harmony Draught - Demihuman','8x [Party] Harmony Draught - Kamasylvia','8x [Party] Harmony Draught - Edania'],images:[]},
  {code:'BEYONDTHEJOURNEY',expiry:'Expira em 3 meses',items:['50000x Cron Stone','5x Choose Your Rare Hammer Box','1x Advice of Valks (+450)','1x Advice of Valks (+350)','1x Advice of Valks (+300)','1x Advice of Valks (+250)','1x Weapon Exchange Coupon Box'],images:[]},
  {code:'TYALLADVENTURERS',expiry:'Expira em 3 meses',items:['10x [Event] Thankful Premium Outfit Box'],images:[]}
].map(c=>({...c,source:'cache'}));

exports.handler=async function(event){
  // Serve item icons through the Netlify function when the original CDN blocks/doesn't resolve.
  // This also avoids exposing provider-specific image paths to the browser.
  const iconId = event?.queryStringParameters?.icon;
  const iconName = event?.queryStringParameters?.name || '';
  if(iconId && /^\d{2,8}$/.test(String(iconId))){
    const candidates = [
      `https://s1.pearlcdn.com/NAEU/TradeMarket/Common/img/BDO/item/${encodeURIComponent(iconId)}.png`,
      `https://s1.pearlcdn.com/SA/TradeMarket/Common/img/BDO/item/${encodeURIComponent(iconId)}.png`,
      `https://s1.pearlcdn.com/ASIA/TradeMarket/Common/img/BDO/item/${encodeURIComponent(iconId)}.png`
    ];
    for(const u of candidates){
      try{
        const ir=await fetch(u,{headers:{'User-Agent':'Mozilla/5.0','Accept':'image/avif,image/webp,image/png,image/*,*/*'}});
        if(ir.ok){
          const buf=Buffer.from(await ir.arrayBuffer());
          return {statusCode:200,headers:{'content-type':ir.headers.get('content-type')||'image/png','cache-control':'public,max-age=604800'},body:buf.toString('base64'),isBase64Encoded:true};
        }
      }catch(_){ }
    }
    // Last resort: ask Garmoth's tooltip endpoint for the item's image.
    try{
      const r=await fetch(`https://api.garmoth.com/api/item/tooltip?main_key=${encodeURIComponent(iconId)}`,{headers:{...headers,accept:'application/json,text/plain,*/*'}});
      if(r.ok){
        const p=await r.json();
        const image=p?.image||p?.icon||p?.data?.image||p?.data?.icon||p?.data?.item?.image||p?.data?.item?.icon||'';
        if(image){
          const u=absoluteUrl(image,'https://api.garmoth.com/');
          const ir=await fetch(u,{headers:{...headers,accept:'image/avif,image/webp,image/png,image/*,*/*'}});
          if(ir.ok){
            const buf=Buffer.from(await ir.arrayBuffer());
            return {statusCode:200,headers:{'content-type':ir.headers.get('content-type')||'image/png','cache-control':'public,max-age=604800'},body:buf.toString('base64'),isBase64Encoded:true};
          }
        }
      }
    }catch(_){ }
    return {statusCode:404,body:''};
  }
  try {
    // Fonte principal: canal do Discord onde o bot do Garmoth posta cada
    // cupom assim que é lançado. Muito mais confiável que acessar garmoth.com
    // direto, que vem bloqueando com 403.
    try {
      const discordCoupons=await fetchDiscordCoupons();
      if(discordCoupons.length) return json({source:'discord',region:'sa',updatedAt:new Date().toISOString(),coupons:discordCoupons});
    } catch(_) { /* segue pras tentativas de acessar o Garmoth direto */ }

    const api=await fetchApiCoupons();
    if(api.length) return json({source:'garmoth-api',region:'sa',updatedAt:new Date().toISOString(),coupons:api});
    try {
      const page=await fetchPage();
      const coupons=parseGarmothHtml(page.html,page.url);
      if(coupons.length) return json({source:'garmoth-page',region:'sa',updatedAt:new Date().toISOString(),coupons});
    } catch(_) { /* segue pro plano B (leitor de páginas) antes de desistir */ }
    const readerCoupons=await fetchReaderCoupons();
    if(readerCoupons.length) return json({source:'garmoth-reader',region:'sa',updatedAt:new Date().toISOString(),coupons:readerCoupons});
    throw new Error('Garmoth respondeu, mas nenhum cupom foi identificado (Discord, API, página e leitor falharam).');
  } catch(error) {
    return json({source:'cache',region:'sa',updatedAt:new Date().toISOString(),coupons:KNOWN_CURRENT,warning:String(error.message||error)});
  }
};
