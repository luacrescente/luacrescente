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

const headers = {
  'user-agent': 'Mozilla/5.0 (compatible; Lua-Crescente-Coupons/1.0; +https://luacrescente.netlify.app)',
  'accept': 'application/json,text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
  'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8'
};

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
  }).slice(0,8);
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
      const r=await fetch(url,{headers,redirect:'follow'});
      if(!r.ok) continue;
      const p=await r.json(); const c=normalizeApi(p);
      if(c.length) return c;
    } catch (_) {}
  }
  return [];
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
    const api=await fetchApiCoupons();
    if(api.length) return json({source:'garmoth-api',region:'sa',updatedAt:new Date().toISOString(),coupons:api});
    const page=await fetchPage();
    const coupons=parseGarmothHtml(page.html,page.url);
    if(coupons.length) return json({source:'garmoth-page',region:'sa',updatedAt:new Date().toISOString(),coupons});
    throw new Error('Garmoth respondeu, mas nenhum cupom foi identificado.');
  } catch(error) {
    return json({source:'cache',region:'sa',updatedAt:new Date().toISOString(),coupons:KNOWN_CURRENT,warning:String(error.message||error)});
  }
};
