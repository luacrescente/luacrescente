(function(){
  'use strict';

  // Agenda semanal dos bosses do servidor SA (UTC-3).
  // O timer e o modal usam esta mesma fonte de dados para permanecerem sincronizados.
  const SCHEDULE = {
    0: [ // Domingo
      ['02:00','Nouver'], ['02:00','San-Gun'], ['11:00','Kutum'], ['11:00','Bugasal'],
      ['14:00','Garmoth'], ['16:00','Karanda'], ['16:00','Uturi'], ['17:00','Vell'],
      ['17:30','Garmoth'], ['20:00','Kzarka'], ['20:00','San-Gun'], ['23:15','Garmoth'], ['23:30','Nouver'], ['23:30','Rei dos Porcos Dourados']
    ],
    1: [ // Segunda
      ['02:00','Kzarka'], ['02:00','Bugasal'], ['11:00','Nouver'], ['11:00','San-Gun'],
      ['14:00','Garmoth'], ['16:00','Kutum'], ['16:00','Rei dos Porcos Dourados'], ['20:00','Karanda'],
      ['20:00','Uturi'], ['23:15','Garmoth'], ['23:30','Offin'], ['23:30','Bugasal']
    ],
    2: [ // Terça
      ['02:00','Nouver'], ['02:00','Uturi'], ['11:00','Kutum'], ['11:00','Rei dos Porcos Dourados'],
      ['14:00','Garmoth'], ['16:00','Nouver'], ['16:00','San-Gun'], ['20:00','Kzarka'],
      ['20:00','Bugasal'], ['23:15','Garmoth'], ['23:30','Karanda'], ['23:30','Uturi']
    ],
    3: [ // Quarta
      ['02:00','Offin'], ['02:00','Rei dos Porcos Dourados'], ['11:00','Nouver'], ['11:00','Uturi'],
      ['14:00','Garmoth'], ['16:00','Karanda'], ['16:00','San-Gun'], ['19:00','Quint / Muraka'],
      ['20:00','Kutum'], ['20:00','Rei dos Porcos Dourados'], ['23:15','Garmoth'], ['23:30','Kzarka'], ['23:30','Bugasal']
    ],
    4: [ // Quinta
      ['11:00','Kzarka'], ['11:00','San-Gun'], ['14:00','Garmoth'], ['16:00','Nouver'], ['16:00','Bugasal'],
      ['20:00','Karanda'], ['20:00','Uturi'], ['23:15','Garmoth'], ['23:30','Kutum'], ['23:30','Rei dos Porcos Dourados']
    ],
    5: [ // Sexta
      ['02:00','Karanda'], ['02:00','San-Gun'], ['11:00','Offin'], ['11:00','Bugasal'],
      ['14:00','Garmoth'], ['16:00','Kzarka'], ['16:00','Uturi'], ['19:00','Vell'], ['20:00','Kutum'],
      ['20:00','Rei dos Porcos Dourados'], ['23:15','Garmoth'], ['23:30','Nouver'], ['23:30','San-Gun']
    ],
    6: [ // Sábado
      ['02:00','Kutum'], ['02:00','Bugasal'], ['11:00','Karanda'], ['11:00','Uturi'], ['14:00','Garmoth'],
      ['16:00','Kzarka'], ['16:00','Rei dos Porcos Dourados'], ['17:00','Sombra Negra'], ['19:00','Quint / Muraka']
    ]
  };

  const DAY_NAMES = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const BOSS_ICONS = {
    'Sombra Negra': '/assets/img/bosses/sombra-negra.png',
    'Bugasal': '/assets/img/bosses/bugasal.png',
    'Garmoth': '/assets/img/bosses/garmoth.png',
    'Karanda': '/assets/img/bosses/karanda.png',
    'Kutum': '/assets/img/bosses/kutum.png',
    'Kzarka': '/assets/img/bosses/kzarka.png',
    'Muraka': '/assets/img/bosses/muraka.png',
    'Nouver': '/assets/img/bosses/nouver.png',
    'Offin': '/assets/img/bosses/offin.png',
    'Rei dos Porcos Dourados': '/assets/img/bosses/rei-dos-porcos-dourados.png',
    'Quint': '/assets/img/bosses/quint.png',
    'San-Gun': '/assets/img/bosses/san-gun.png',
    'Uturi': '/assets/img/bosses/uturi.png',
    'Vell': '/assets/img/bosses/vell.png'
  };

  const pad = n => String(n).padStart(2,'0');

  function combine(date, hhmm){
    const parts = String(hhmm).split(':').map(Number);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), parts[0], parts[1], 0, 0).getTime();
  }

  function escapeHtml(value){
    return String(value).replace(/[&<>'"]/g, ch => ({
      '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
    }[ch]));
  }

  function splitBossNames(rawName){
    return String(rawName).split('/').map(name => name.trim()).filter(Boolean);
  }

  function groupDayEntries(dayEntries){
    const grouped = new Map();
    (dayEntries || []).forEach(([time, rawName]) => {
      if(!grouped.has(time)) grouped.set(time, []);
      grouped.get(time).push(...splitBossNames(rawName));
    });
    return Array.from(grouped.entries())
      .map(([time, names]) => ({time, names: Array.from(new Set(names))}))
      .sort((a,b) => a.time.localeCompare(b.time));
  }

  function buildOccurrences(nowMs){
    const now = new Date(nowMs);
    const occurrences = [];

    for(let offset = 0; offset <= 7; offset++){
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
      const day = date.getDay();

      groupDayEntries(SCHEDULE[day]).forEach(entry => {
        const ts = combine(date, entry.time);
        if(ts >= nowMs){
          occurrences.push({
            ts,
            names: entry.names.slice(),
            time: entry.time,
            day
          });
        }
      });
    }

    occurrences.sort((a,b) => a.ts - b.ts);
    return occurrences;
  }

  function createBar(){
    let bar = document.getElementById('bossTimerBar');
    if(bar) return bar;

    bar = document.createElement('div');
    bar.id = 'bossTimerBar';
    bar.className = 'boss-timer-bar';
    bar.innerHTML = `
      <div class="boss-timer-inner">
        <span class="boss-timer-dot" aria-hidden="true"></span>
        <span class="boss-timer-label">PRÓXIMO CHEFE</span>
        <span class="boss-timer-bosses" id="bossTimerBosses" aria-label="Próximos bosses"></span>
        <span class="boss-timer-sep">·</span>
        <strong class="boss-timer-count" id="bossTimerCount">--:--:--</strong>
        <span class="boss-timer-spawn" id="bossTimerSpawn">—</span>
        <button class="boss-timer-link" type="button" id="bossTimerAgenda">ver agenda</button>
      </div>`;

    const shell = document.getElementById('utilityTopBar');
    if(shell){
      bar.style.gridColumn = '2';
      bar.style.gridRow = '1';
      shell.appendChild(bar);
    }else{
      const nav = document.querySelector('.site-nav');
      if(nav && nav.parentNode){
        nav.parentNode.insertBefore(bar, nav);
      }else if(document.body){
        document.body.insertBefore(bar, document.body.firstChild);
      }
    }
    return bar;
  }

  function renderAgenda(){
    const grid = document.getElementById('bossAgendaGrid');
    if(!grid) return;

    grid.innerHTML = DAY_NAMES.map((day, dayIndex) => {
      const entries = groupDayEntries(SCHEDULE[dayIndex]);
      return `<section class="boss-agenda-day">
        <h3>${escapeHtml(day)}</h3>
        <div class="boss-agenda-list">
          ${entries.map(entry => {
            const names = entry.names.map(escapeHtml).join('<span class="boss-agenda-name-sep">·</span>');
            return `<div class="boss-agenda-row"><time>${escapeHtml(entry.time)}</time><span class="boss-agenda-names">${names}</span></div>`;
          }).join('')}
        </div>
      </section>`;
    }).join('');
  }

  function closeAgenda(){
    const modal = document.getElementById('bossAgendaModal');
    if(!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('boss-agenda-open');
  }

  function openAgenda(event){
    if(event){
      event.preventDefault();
      event.stopPropagation();
    }
    const modal = document.getElementById('bossAgendaModal');
    if(!modal) return;
    renderAgenda();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('boss-agenda-open');
  }

  function createAgendaModal(){
    let modal = document.getElementById('bossAgendaModal');
    if(modal) return modal;

    modal = document.createElement('div');
    modal.className = 'boss-agenda-modal';
    modal.id = 'bossAgendaModal';
    modal.setAttribute('aria-hidden','true');
    modal.innerHTML = `
      <div class="boss-agenda-backdrop" data-boss-agenda-close></div>
      <div class="boss-agenda-dialog" role="dialog" aria-modal="true" aria-labelledby="bossAgendaTitle">
        <button class="boss-agenda-close" type="button" aria-label="Fechar agenda" data-boss-agenda-close>×</button>
        <div class="boss-agenda-eyebrow">Lua Crescente · Bosses</div>
        <h2 id="bossAgendaTitle">Agenda dos Bosses</h2>
        <p class="boss-agenda-intro">Horários semanais dos bosses no servidor da América do Sul.</p>
        <div class="boss-agenda-grid" id="bossAgendaGrid"></div>
      </div>`;

    document.body.appendChild(modal);
    renderAgenda();

    modal.querySelector('.boss-agenda-backdrop')?.addEventListener('click', closeAgenda);
    modal.querySelector('.boss-agenda-close')?.addEventListener('click', closeAgenda);

    return modal;
  }

  function update(){
    const bar = createBar();
    if(!bar) return;

    const now = Date.now();
    const next = buildOccurrences(now)[0];
    const bossesEl = document.getElementById('bossTimerBosses');
    const countEl = document.getElementById('bossTimerCount');
    const spawnEl = document.getElementById('bossTimerSpawn');

    if(!bossesEl || !countEl || !spawnEl) return;

    if(!next){
      bossesEl.innerHTML = '<span class="boss-timer-no-boss">Sem agenda</span>';
      countEl.textContent = '--:--:--';
      spawnEl.textContent = '';
      return;
    }

    const diff = Math.max(0, next.ts - now);
    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    bossesEl.innerHTML = next.names.map(name => `
      <span class="boss-timer-boss" title="${escapeHtml(name)}">
        <img src="${BOSS_ICONS[name] || ''}" alt="${escapeHtml(name)}" class="boss-timer-icon" width="28" height="28" style="width:28px;height:28px;min-width:28px;min-height:28px;max-width:28px;max-height:28px;object-fit:contain;display:block" onerror="this.style.display='none'">
        <strong class="boss-timer-name">${escapeHtml(name)}</strong>
      </span>`).join('<span class="boss-timer-name-sep">+</span>');

    countEl.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

    const when = new Date(next.ts);
    const today = new Date(now);
    const sameDay = when.getFullYear() === today.getFullYear() &&
                    when.getMonth() === today.getMonth() &&
                    when.getDate() === today.getDate();
    spawnEl.textContent = sameDay ? `hoje às ${next.time}` : `${DAY_NAMES[next.day]} às ${next.time}`;

    bar.classList.toggle('is-soon', diff <= 10 * 60 * 1000);
    bar.classList.toggle('is-imminent', diff <= 2 * 60 * 1000);
  }

  function init(){
    if(!document.body) return;
    createBar();
    createAgendaModal();

    const agendaButton = document.getElementById('bossTimerAgenda');
    if(agendaButton) agendaButton.addEventListener('click', openAgenda, {once:true});

    document.addEventListener('keydown', event => {
      if(event.key === 'Escape') closeAgenda();
    });

    update();
    window.setInterval(update, 1000);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, {once:true});
  }else{
    init();
  }
})();
