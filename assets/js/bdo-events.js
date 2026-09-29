/* Seção "Eventos" da Home — busca os eventos em andamento (via Netlify
   Function que lê o site oficial da Pearl Abyss) e desenha uma linha do
   tempo tipo Gantt, igual ao calendário de eventos do site deles.

   v3 — correções:
   - Títulos não são mais cortados quando o evento começa antes da janela
     visível (agora marcam "vem de antes" com seta + fundo mais claro).
   - Altura da linha agora bate 100% com o CSS (antes era 40px no JS e
     36px no CSS, gerando espaço morto).
   - Cores agora são por CATEGORIA de evento (Login, Drop, Hot Time...),
     não mais hash aleatório do ID. Fica tipo Garmoth.
   - Eventos com título vazio/vazio são descartados na renderização.
   - Régua de datas ganhou marcador de mês quando vira o mês.
   - Barra horizontal estilizada (fina, escura) em vez de branca do SO.
*/
(function(){
  'use strict';

  const el = document.getElementById('eventsTimeline');
  if(!el) return;

  const CACHE_KEY = 'luaCrescenteEventsCache_v3';
  const CACHE_TTL_MS = 60 * 60 * 1000; // 1h
  const DAY_MS = 86400000;
  const DAY_WIDTH = 46;      // px por dia
  const ROW_HEIGHT = 40;     // altura de CADA linha — bate com o CSS (.events-row)
  const BAR_HEIGHT = 30;     // altura da barra dentro da linha

  // Cores por categoria — igual Garmoth. A ordem importa (primeiro que casar vence).
  const CATEGORY_COLORS = [
    { re: /\blogin\b|diári/i,                     color: '#8a6b2e', label: 'Login' },       // dourado escuro
    { re: /twitch|drop/i,                         color: '#8a3d4a', label: 'Drop' },        // vermelho vinho
    { re: /hot\s*time|hora por dia/i,             color: '#b04a2e', label: 'Hot Time' },    // laranja queimado
    { re: /pesca|marisco|peixe/i,                 color: '#3f7d99', label: 'Pesca' },       // azul
    { re: /academia|olvia/i,                      color: '#7a4fb0', label: 'Academia' },    // roxo
    { re: /banquete|heidel/i,                     color: '#2f8f5b', label: 'Banquete' },    // verde
    { re: /novato|retornando|boas.vindas/i,       color: '#4a7a72', label: 'Novatos' },     // teal
    { re: /caça|caçador|toupeira/i,               color: '#7a5a3d', label: 'Caça' },        // marrom
    { re: /fazendeiro|fazenda|colheita/i,         color: '#5a7a3d', label: 'Fazenda' },     // verde oliva
    { re: /presente|fortuna|sorte/i,              color: '#a86b2e', label: 'Presente' },    // âmbar
    { re: /oferta|pacote|loja/i,                  color: '#8a5a3d', label: 'Loja' },        // marrom claro
    { re: /repleto|vantagem|benefício/i,          color: '#5a6b8a', label: 'Vantagens' },   // azul acinzentado
    { re: /login|recompensa/i,                    color: '#8a6b2e', label: 'Recompensa' }   // fallback login
  ];
  const FALLBACK_COLOR = '#5a5f6a';

  function categoryFor(title){
    for(const c of CATEGORY_COLORS){
      if(c.re.test(title)) return c;
    }
    return { color: FALLBACK_COLOR, label: 'Evento' };
  }

  function fmtDay(d){ return String(d.getDate()).padStart(2,'0'); }
  const WEEKDAYS = ['Do','Se','Te','Qu','Qu','Se','Sá'];
  const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  function startOfDay(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

  function esc(v){
    return String(v ?? '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function render(events){
    if(!Array.isArray(events) || !events.length){
      el.innerHTML = '<div class="events-status">Nenhum evento em andamento encontrado no momento.</div>';
      return;
    }

    // Filtra eventos inválidos antes de qualquer coisa (título vazio, data inválida)
    const valid = events.filter(e => {
      if(!e || !e.title || !String(e.title).trim()) return false;
      const s = new Date(e.start), en = new Date(e.end);
      return !isNaN(s.getTime()) && !isNaN(en.getTime()) && en > s;
    });

    if(!valid.length){
      el.innerHTML = '<div class="events-status">Nenhum evento em andamento encontrado no momento.</div>';
      return;
    }

    const now = new Date();
    const today0 = startOfDay(now);
    const windowStart = new Date(today0.getTime() - 3*DAY_MS);

    // Janela vai até o último fim de evento, com folga de 2 dias, teto de 60 dias
    let maxEnd = today0.getTime() + 21*DAY_MS;
    valid.forEach(e => {
      const end = startOfDay(new Date(e.end)).getTime();
      if(end > maxEnd) maxEnd = end;
    });
    let windowEnd = new Date(Math.min(maxEnd, today0.getTime() + 60*DAY_MS));
    windowEnd = new Date(windowEnd.getTime() + 2*DAY_MS);

    const totalDays = Math.round((windowEnd - windowStart) / DAY_MS) + 1;
    const dayX = (d) => Math.round((startOfDay(d) - windowStart) / DAY_MS) * DAY_WIDTH;

    // ---- Régua de dias (com marcador de mês) ----
    let ruler = '';
    for(let i=0;i<totalDays;i++){
      const d = new Date(windowStart.getTime() + i*DAY_MS);
      const isToday = d.getTime() === today0.getTime();
      const isFirstOfMonth = d.getDate() === 1;
      const monthLabel = isFirstOfMonth
        ? `<span class="events-ruler-m">${MONTHS_SHORT[d.getMonth()]}</span>`
        : '';
      ruler += `<div class="events-ruler-day${isToday?' is-today':''}${isFirstOfMonth?' is-first-of-month':''}" style="left:${i*DAY_WIDTH}px">
        ${monthLabel}
        <span class="events-ruler-wd">${WEEKDAYS[d.getDay()]}</span>
        <span class="events-ruler-n">${fmtDay(d)}</span>
      </div>`;
    }

    // ---- Linha "agora" ----
    const nowX = Math.round((now - windowStart) / DAY_MS * DAY_WIDTH);
    const nowLabel = now.toTimeString().slice(0,5);

    // ---- Barras ----
    let rows = '';
    valid.forEach((e, i) => {
      const s = new Date(e.start), en = new Date(e.end);
      const startX = dayX(s);
      const endX = dayX(en) + DAY_WIDTH;

      // Se o evento começou ANTES da janela visível, "clampa" em 0
      // mas marca visualmente com uma seta "‹" indicando que continua pra trás.
      const startedBefore = startX < 0;
      const x1 = Math.max(0, startX);
      const x2 = Math.min(totalDays*DAY_WIDTH, endX);
      const w = Math.max(DAY_WIDTH, x2 - x1);

      const msLeft = en - now;
      const daysLeft = Math.max(0, Math.ceil(msLeft / DAY_MS));
      let label;
      if(msLeft <= 0) label = 'Encerrado';
      else if(daysLeft <= 1) label = 'termina hoje';
      else label = `${daysLeft}d restantes`;

      const cat = categoryFor(e.title);
      const startedClass = startedBefore ? ' events-bar-started-before' : '';

      rows += `<a class="events-row" href="${esc(e.link)}" target="_blank" rel="noopener" style="top:${i*ROW_HEIGHT}px">
        <span class="events-bar${startedClass}" style="left:${x1}px;width:${w}px;background:${cat.color};" title="${esc(e.title)} — ${label}">
          ${startedBefore ? '<span class="events-bar-arrow" aria-hidden="true">‹</span>' : ''}
          <span class="events-bar-label">${esc(e.title)}</span>
          <span class="events-bar-days">${label}</span>
        </span>
      </a>`;
    });

    const rowsHeight = valid.length * ROW_HEIGHT;
    const canvasHeight = 34 + rowsHeight + 8;

    el.innerHTML = `
      <div class="events-scroll">
        <div class="events-canvas" style="width:${totalDays*DAY_WIDTH}px;height:${canvasHeight}px">
          <div class="events-ruler" style="height:34px">${ruler}</div>
          <div class="events-now-line" style="left:${nowX}px;height:${canvasHeight}px"><span>${nowLabel}</span></div>
          <div class="events-rows" style="top:34px;height:${rowsHeight}px">${rows}</div>
        </div>
      </div>`;

    // Rola pra mostrar "hoje" com folga à esquerda
    const scroller = el.querySelector('.events-scroll');
    if(scroller){
      // Centraliza "hoje" na viewport, se possível
      const target = Math.max(0, nowX - (scroller.clientWidth / 2));
      scroller.scrollLeft = target;
    }
  }

  function readCache(){
    try{
      const raw = localStorage.getItem(CACHE_KEY);
      if(!raw) return null;
      const data = JSON.parse(raw);
      if(!data || !data.ts || Date.now() - data.ts > CACHE_TTL_MS) return null;
      return data.events;
    }catch{ return null; }
  }
  function writeCache(events){
    try{ localStorage.setItem(CACHE_KEY, JSON.stringify({ts:Date.now(), events})); }catch{}
  }

  async function load(){
    const cached = readCache();
    if(cached){ render(cached); return; }
    try{
      const res = await fetch('/.netlify/functions/bdo-events?ts='+Date.now(), {cache:'no-store'});
      if(!res.ok) throw new Error('HTTP '+res.status);
      const data = await res.json();
      if(data.error && (!data.events || !data.events.length)){
        el.innerHTML = '<div class="events-status">Não foi possível carregar os eventos agora. Tente novamente mais tarde.</div>';
        return;
      }
      writeCache(data.events || []);
      render(data.events || []);
    }catch(err){
      console.error('[Eventos]', err);
      el.innerHTML = '<div class="events-status">Não foi possível carregar os eventos agora.</div>';
    }
  }

  load();
})();