/* Seção "Eventos" da Home — v9
   - Layout em lista (igual ao print)
   - Duas abas: Temporários / Permanentes
   - Rolagem interna
*/
(function(){
  'use strict';

  const root = document.getElementById('eventsTimeline');
  if(!root) return;

  const CACHE_KEY = 'luaCrescenteEventsCache_v8';
  const DAY_MS = 86400000;

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

  let allEvents = [];
  let activeTab = 'temporary';

  function render(){
    if(!allEvents.length){
      root.innerHTML = '<div class="events-status">Nenhum evento em andamento encontrado no momento.</div>';
      return;
    }

    const tempEvents = allEvents.filter(e => !e.isPermanent);
    const permEvents = allEvents.filter(e => e.isPermanent);
    const list = activeTab === 'temporary' ? tempEvents : permEvents;
    const valid = list.filter(e => e && e.title && e.link);

    document.querySelectorAll('.events-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === activeTab);
    });

    if(!valid.length){
      root.innerHTML = '<div class="events-status">Nenhum evento nesta categoria no momento.</div>';
      return;
    }

    root.innerHTML = valid.map(e => {
      let timeText = '';
      if (!e.isPermanent) {
        const days = Math.max(0, Number(e.daysLeft) || 0);
        timeText = days === 0 ? 'Termina hoje' : `Termina em ${days} dia${days === 1 ? '' : 's'}`;
      } else {
        timeText = 'Evento Permanente';
      }

      // Tenta pegar a imagem da API (pode vir como e.image ou e.thumbnail)
      const imgUrl = e.image || e.thumbnail || '';
      const imgHtml = imgUrl ? `<div class="event-thumb-wrap"><img class="event-thumb" src="${esc(imgUrl)}" alt="" loading="lazy"></div>` : '';

      return `
        <a class="event-row" href="${esc(e.link)}" target="_blank" rel="noopener">
          ${imgHtml}
          <div class="event-info">
            <span class="event-title">${esc(e.title)}</span>
            <span class="event-time">${timeText}</span>
          </div>
          <span class="event-badge">Ativo</span>
        </a>
      `;
    }).join('');
  }

  function bindTabs(){
    document.querySelectorAll('.events-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = btn.dataset.tab;
        if(tab === activeTab) return;
        activeTab = tab;
        render();
      });
    });
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
    bindTabs(); // Ativa os cliques nos botões

    const cached = readCache();
    if(cached && cached.length){
      allEvents = cached;
      render();
      return;
    }
    try{
      const res = await fetch('/.netlify/functions/bdo-events?ts=' + Date.now(), {cache:'no-store'});
      if(!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if(data.error && (!data.events || !data.events.length)){
        root.innerHTML = '<div class="events-status">Não foi possível carregar os eventos agora. Tente novamente mais tarde.</div>';
        return;
      }
      allEvents = data.events || [];
      writeCache(allEvents);
      render();
    }catch(err){
      console.error('[Eventos]', err);
      root.innerHTML = '<div class="events-status">Não foi possível carregar os eventos agora.</div>';
    }
  }

  load();
})();