/* Seção "Eventos" da Home — busca os eventos em andamento (via Netlify
   Function que lê o site oficial da Pearl Abyss) e desenha uma linha do
   tempo tipo Gantt, igual ao calendário de eventos do site deles. */
(function(){
  'use strict';

  const el = document.getElementById('eventsTimeline');
  if(!el) return;

  const CACHE_KEY = 'luaCrescenteEventsCache';
  const CACHE_TTL_MS = 60 * 60 * 1000; // 1h — evita bater na function/no site da PA toda hora
  const DAY_MS = 86400000;
  const DAY_WIDTH = 46; // px por dia na linha do tempo

  const COLORS = ['#c9a24b','#4a7a72','#8a4a3d','#6b7fd7','#b3599a','#5a9e5a','#c97a3d'];

  function colorFor(id){
    let h = 0;
    for(let i=0;i<id.length;i++) h = (h*31 + id.charCodeAt(i)) >>> 0;
    return COLORS[h % COLORS.length];
  }

  function fmtDay(d){ return String(d.getDate()).padStart(2,'0'); }
  const WEEKDAYS = ['Do','Se','Te','Qu','Qu','Se','Sá'];
  const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  function startOfDay(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

  function render(events){
    if(!events || !events.length){
      el.innerHTML = '<div class="events-status">Nenhum evento em andamento encontrado no momento.</div>';
      return;
    }

    const now = new Date();
    const today0 = startOfDay(now);
    const windowStart = new Date(today0.getTime() - 3*DAY_MS);
    let windowEnd = new Date(today0.getTime() + 21*DAY_MS);
    events.forEach(e=>{ const end = startOfDay(new Date(e.end)); if(end > windowEnd) windowEnd = end; });
    windowEnd = new Date(Math.min(windowEnd.getTime(), today0.getTime() + 60*DAY_MS));

    const totalDays = Math.round((windowEnd - windowStart) / DAY_MS) + 1;
    const dayX = (d)=> Math.round((startOfDay(d) - windowStart) / DAY_MS) * DAY_WIDTH;

    // ---- régua de dias ----
    let ruler = '';
    for(let i=0;i<totalDays;i++){
      const d = new Date(windowStart.getTime() + i*DAY_MS);
      const isToday = d.getTime() === today0.getTime();
      ruler += `<div class="events-ruler-day${isToday?' is-today':''}" style="left:${i*DAY_WIDTH}px">
        <span class="events-ruler-wd">${WEEKDAYS[d.getDay()]}</span>
        <span class="events-ruler-n">${fmtDay(d)}</span>
      </div>`;
    }

    // ---- linha "agora" ----
    const nowX = Math.round((now - windowStart) / DAY_MS * DAY_WIDTH);
    const nowLabel = now.toTimeString().slice(0,5);

    // ---- barras ----
    let rows = '';
    events.forEach((e,i)=>{
      const s = new Date(e.start), en = new Date(e.end);
      const x1 = Math.max(0, dayX(s));
      const x2 = Math.min(totalDays*DAY_WIDTH, dayX(en) + DAY_WIDTH);
      const w = Math.max(DAY_WIDTH, x2 - x1);
      const msLeft = en - now;
      const daysLeft = Math.max(0, Math.ceil(msLeft / DAY_MS));
      const label = msLeft <= 0 ? 'Encerrado' : (daysLeft <= 1 ? 'termina hoje' : `${daysLeft}d restantes`);
      const color = colorFor(e.id || e.title);
      rows += `<a class="events-row" href="${esc(e.link)}" target="_blank" rel="noopener" style="top:${i*40}px">
        <span class="events-bar" style="left:${x1}px;width:${w}px;background:${color}22;border-color:${color};">
          <span class="events-bar-label">${esc(e.title)}</span>
          <span class="events-bar-days" style="color:${color}">${label}</span>
        </span>
      </a>`;
    });

    const height = events.length * 40 + 10;
    el.innerHTML = `
      <div class="events-scroll">
        <div class="events-canvas" style="width:${totalDays*DAY_WIDTH}px;height:${height+34}px">
          <div class="events-ruler">${ruler}</div>
          <div class="events-now-line" style="left:${nowX}px;height:${height+34}px"><span>${nowLabel}</span></div>
          <div class="events-rows" style="top:34px;height:${height}px">${rows}</div>
        </div>
      </div>`;

    // rola pra mostrar "hoje" com uma folga à esquerda
    const scroller = el.querySelector('.events-scroll');
    if(scroller) scroller.scrollLeft = Math.max(0, nowX - 90);
  }

  function esc(v){ return String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

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
