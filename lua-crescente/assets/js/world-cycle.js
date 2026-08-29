(function(){
  'use strict';

  // BDO cycle used by the SA timer. A full in-game day is 4 real hours;
  // the night window lasts 40 real minutes and starts at :40 on a 4-hour cycle.
  const TZ = 'America/Sao_Paulo';
  const NIGHT_SECONDS = 40 * 60;
  const CYCLE_SECONDS = 4 * 60 * 60;
  const NIGHT_START_OFFSET = 40 * 60;

  function getSaoPauloTime(nowMs){
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TZ,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).formatToParts(new Date(nowMs));

    const values = Object.fromEntries(
      parts.filter(p => p.type !== 'literal').map(p => [p.type, Number(p.value)])
    );

    return {
      hour: values.hour === 24 ? 0 : values.hour,
      minute: values.minute,
      second: values.second
    };
  }

  function formatRemaining(totalSeconds){
    const wholeMinutes = Math.max(0, Math.floor(totalSeconds / 60));
    const hours = Math.floor(wholeMinutes / 60);
    const minutes = wholeMinutes % 60;
    if(hours > 0) return `${hours}h ${String(minutes).padStart(2,'0')}m`;
    return `${minutes}m`;
  }

  function createBar(){
    let shell = document.getElementById('utilityTopBar');
    let bar = document.getElementById('worldCycleBar');
    if(bar && shell) return bar;

    if(!shell){
      shell = document.createElement('div');
      shell.id = 'utilityTopBar';
      shell.className = 'utility-top-bar';
      shell.setAttribute('role', 'region');
      shell.setAttribute('aria-label', 'Informações do mundo e próximos bosses');

      const nav = document.querySelector('.site-nav');
      if(nav && nav.parentNode){
        nav.parentNode.insertBefore(shell, nav);
      }else if(document.body){
        document.body.insertBefore(shell, document.body.firstChild);
      }
    }

    if(!bar){
      bar = document.createElement('div');
      bar.id = 'worldCycleBar';
      bar.className = 'world-cycle-bar';
      bar.setAttribute('aria-live', 'polite');
      bar.innerHTML = `
        <div class="world-cycle-inner">
          <span class="world-cycle-icon" id="worldCycleIcon" aria-hidden="true">☾</span>
          <span class="world-cycle-label" id="worldCycleLabel">Noite em:</span>
          <strong class="world-cycle-count" id="worldCycleCount">--h --m</strong>
        </div>`;
      shell.appendChild(bar);
    }

    return bar;
  }

  function update(){
    const bar = createBar();
    const icon = document.getElementById('worldCycleIcon');
    const label = document.getElementById('worldCycleLabel');
    const count = document.getElementById('worldCycleCount');
    if(!bar || !icon || !label || !count) return;

    const now = getSaoPauloTime(Date.now());
    const elapsed = now.hour * 3600 + now.minute * 60 + now.second;
    const phase = (elapsed - NIGHT_START_OFFSET + CYCLE_SECONDS) % CYCLE_SECONDS;
    const inNight = phase < NIGHT_SECONDS;
    const remaining = inNight ? NIGHT_SECONDS - phase : CYCLE_SECONDS - phase;

    icon.textContent = inNight ? '☀' : '☾';
    label.textContent = inNight ? 'Dia em:' : 'Noite em:';
    count.textContent = formatRemaining(remaining);
    bar.classList.toggle('is-night', inNight);
    bar.classList.toggle('is-day', !inNight);
  }

  function init(){
    if(!document.body) return;
    createBar();
    update();
    window.setInterval(update, 1000);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, {once:true});
  }else{
    init();
  }
})();
