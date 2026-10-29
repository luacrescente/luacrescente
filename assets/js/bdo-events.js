/* Seção "Eventos" da Home — v10
   - Layout em lista (igual ao print)
   - Duas abas: Temporários / Permanentes
   - Rolagem interna
   - Fallback (Mock) caso a API da Pearl Abyss falhe ou volte vazia
*/
(function(){
  'use strict';

  const root = document.getElementById('eventsTimeline');
  if(!root) return;

  const CACHE_KEY = 'luaCrescenteEventsCache_v10';
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
      
      // Se a API voltar vazia ou com erro, força a ida para o catch
      if(!data.events || data.events.length === 0){
        throw new Error('API retornou sem eventos');
      }

      allEvents = data.events;
      writeCache(allEvents);
      render();
    }catch(err){
      console.warn('[Eventos] Falha na API real, usando dados de exemplo:', err);
      
      // ==========================================
      // PLANO B: EVENTOS MOCKADOS (FALSOS)
      // ==========================================
      allEvents = [
        // Temporários
        { title: 'Recompensas Especiais de Login do Banquete', link: 'https://www.naeu.playblackdesert.com', isPermanent: false, daysLeft: 2 },
        { title: 'Bônus de EXP para Membros da Guilda', link: 'https://www.naeu.playblackdesert.com', isPermanent: false, daysLeft: 5 },
        { title: 'Evento de Halloween da Lua Crescente', link: 'https://www.naeu.playblackdesert.com', isPermanent: false, daysLeft: 1 },
        // Permanentes
        { title: 'Recompensas Diárias de Login', link: 'https://www.naeu.playblackdesert.com', isPermanent: true },
        { title: 'Desconto em Ferramentas da Guilda', link: 'https://www.naeu.playblackdesert.com', isPermanent: true }
      ];
      
      // Não salvamos o mock no cache para que ele tente a API real no próximo F5
      render();
    }
  }

  load();
})();