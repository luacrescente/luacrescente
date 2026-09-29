/* Seção "Eventos" da Home — v4
   - Lê os eventos da Netlify Function (que lê a lista da PA)
   - Timeline tipo Garmoth: barra por evento, largura = duração
   - Eventos com prazo em cima (menor daysLeft primeiro)
   - Permanentes embaixo, barra cinza + tag ∞
   - Clique → abre a página do evento na PA
   - Data de início: guardada em localStorage na primeira vez que vê o evento
*/
(function(){
  'use strict';

  const el = document.getElementById('eventsTimeline');
  if(!el) return;

  const CACHE_KEY = 'luaCrescenteEventsCache_v4';
  const START_KEY = 'luaCrescenteEventStart_v4';
  const DAY_MS = 86400000;
  const DAY_WIDTH = 40;
  const ROW_HEIGHT = 38;
  const BAR_HEIGHT = 26;
  const PERMANENT_WINDOW_DAYS = 90;

  function cacheTTL(){
    const now = new Date();
    const br = new Date(now.getTime() - 3 * 3600 * 1000);
    const day = br.getUTCDay();
    const hour = br.getUTCHours();
    if(day === 4 && hour >= 8 && hour < 10) return 5 * 60 * 1000;
    return 24 * 60 * 60 * 1000;
  }

  function esc(v){
    return String(v ?? '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }
  function startOfDay(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function fmtDay(d){ return String(d.getDate()).padStart(2,'0'); }
  const WEEKDAYS = ['Do','Se','Te','Qu','Qu','Se','Sá'];
  const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  // ---- localStorage: quando cada evento foi visto pela 1ª vez ----
  function readStarts(){
    try{
      const raw = localStorage.getItem(START_KEY);
      return raw ? JSON.parse(raw) : {};
    }catch{ return {}; }
  }
  function writeStarts(map){
    try{ localStorage.setItem(START_KEY, JSON.stringify(map)); }catch{}
  }
  function rememberStart(id, iso){
    const map = readStarts();
    if(!map[id]){ map[id] = iso; writeStarts(map); }
    return map[id];
  }

  // Cores neutras — uma paleta simples, sem "categorizar"
  const PALETTE = ['#8a6a3d','#7a3d4a','#a04a2e','#3f6d89','#5a4f8a','#3f7a5a','#7a5a3d','#5a6a7a'];

  function colorForIndex(i){
    return PALETTE[i % PALETTE.length];
  }

  function render(events){
    if(!Array.isArray(events) || !events.length){
      el.innerHTML = '<div class="events-status">Nenhum evento em andamento encontrado no momento.</div>';
      return;
    }

    const now = new Date();
    const today0 = startOfDay(now);
    const starts = readStarts();

    // Prepara cada evento com data de início e fim
    const prepared = events.map((e, idx) => {
      const idKey = String(e.id);
      let startISO;
      if(starts[idKey]){
        startISO = starts[idKey];
      } else {
        startISO = today0.toISOString();
        starts[idKey] = startISO;
      }
      const startDate = startOfDay(new Date(startISO));

      let endDate;
      if(e.isPermanent){
        endDate = new Date(today0.getTime() + PERMANENT_WINDOW_DAYS * DAY_MS);
      } else {
        const dLeft = Math.max(0, Number(e.daysLeft) || 0);
        endDate = new Date(today0.getTime() + dLeft * DAY_MS);
      }

      return {
        ...e,
        _start: startDate,
        _end: endDate,
        _idx: idx
      };
    });

    writeStarts(starts);

    // Janela visível
    let minStart = today0.getTime();
    let maxEnd = today0.getTime() + 14 * DAY_MS;
    prepared.forEach(p => {
      if(p._start.getTime() < minStart) minStart = p._start.getTime();
      if(p._end.getTime() > maxEnd) maxEnd = p._end.getTime();
    });
    // Garante pelo menos 3 dias antes de hoje
    const windowStart = new Date(Math.min(minStart, today0.getTime() - 3 * DAY_MS));
    const windowEnd = new Date(maxEnd + 2 * DAY_MS);

    const totalDays = Math.round((windowEnd - windowStart) / DAY_MS) + 1;
    const dayX = (d) => Math.round((startOfDay(d) - windowStart) / DAY_MS) * DAY_WIDTH;

    // Régua de dias
    let ruler = '';
    for(let i = 0; i < totalDays; i++){
      const d = new Date(windowStart.getTime() + i * DAY_MS);
      const isToday = d.getTime() === today0.getTime();
      const isFirst = d.getDate() === 1;
      ruler += `<div class="events-ruler-day${isToday?' is-today':''}${isFirst?' is-first-of-month':''}" style="left:${i*DAY_WIDTH}px">
        ${isFirst ? `<span class="events-ruler-m">${MONTHS_SHORT[d.getMonth()]}</span>` : ''}
        <span class="events-ruler-wd">${WEEKDAYS[d.getDay()]}</span>
        <span class="events-ruler-n">${fmtDay(d)}</span>
      </div>`;
    }

    // Linha "agora"
    const nowX = Math.round((now - windowStart) / DAY_MS * DAY_WIDTH);
    const nowLabel = now.toTimeString().slice(0,5);

    // Barras
    let rows = '';
    prepared.forEach((p, i) => {
      const x1raw = dayX(p._start);
      const x2raw = dayX(p._end) + DAY_WIDTH;
      const startedBefore = x1raw < 0;
      const x1 = Math.max(0, x1raw);
      const x2 = Math.min(totalDays * DAY_WIDTH, x2raw);
      const w = Math.max(DAY_WIDTH, x2 - x1);

      const color = p.isPermanent ? '#4a4f5a' : colorForIndex(p._idx);

      let label;
      if(p.isPermanent){
        label = 'Permanente';
      } else {
        const msLeft = p._end - now;
        const daysLeft = Math.max(0, Math.ceil(msLeft / DAY_MS));
        if(msLeft <= 0) label = 'Encerrado';
        else if(daysLeft <= 1) label = 'termina hoje';
        else label = `${daysLeft}d restantes`;
      }

      rows += `<a class="events-row" href="${esc(p.link)}" target="_blank" rel="noopener"
                  style="top:${i*ROW_HEIGHT}px" title="${esc(p.title)} — ${esc(label)}">
        <span class="events-bar${startedBefore?' started-before':''}${p.isPermanent?' is-permanent':''}"
              style="left:${x1}px;width:${w}px;background:${color};">
          ${startedBefore ? '<span class="events-bar-arrow">‹</span>' : ''}
          <span class="events-bar-label">${esc(p.title)}</span>
          <span class="events-bar-days">${p.isPermanent ? '∞' : esc(label)}</span>
        </span>
      </a>`;
    });

    const rowsHeight = prepared.length * ROW_HEIGHT;
    const canvasHeight = 34 + rowsHeight + 8;

    el.innerHTML = `
      <div class="events-scroll">
        <div class="events-canvas" style="width:${totalDays*DAY_WIDTH}px;height:${canvasHeight}px">
          <div class="events-ruler" style="height:34px">${ruler}</div>
          <div class="events-now-line" style="left:${nowX}px;height:${canvasHeight}px"><span>${nowLabel}</span></div>
          <div class="events-rows" style="top:34px;height:${rowsHeight}px">${rows}</div>
        </div>
      </div>`;

    const scroller = el.querySelector('.events-scroll');
    if(scroller){
      const target = Math.max(0, nowX - (scroller.clientWidth / 2));
      scroller.scrollLeft = target;
    }
  }

  function readCache(){
    try{
      const raw = localStorage.getItem(CACHE_KEY);
      if(!raw) return null;
      const data = JSON.parse(raw);
      if(!data || !data.ts || Date.now() - data.ts > cacheTTL()) return null;
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
      const res = await fetch('/.netlify/functions/bdo-events?ts=' + Date.now(), {cache:'no-store'});
      if(!res.ok) throw new Error('HTTP ' + res.status);
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