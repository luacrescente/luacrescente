(function(){
  'use strict';

  // Boss da guilda: todo sábado, das 19:00 às 19:30 (horário de Brasília / SA, UTC-3).
  const OFFSET_MS = -3 * 60 * 60 * 1000;
  const START_HOUR = 19;
  const START_MINUTE = 0;
  const END_HOUR = 19;
  const END_MINUTE = 30;
  const DAY_SATURDAY = 6;

  function getSaoPauloClock(nowMs){
    const shifted = new Date(nowMs + OFFSET_MS);
    return {
      year: shifted.getUTCFullYear(),
      month: shifted.getUTCMonth(),
      date: shifted.getUTCDate(),
      day: shifted.getUTCDay(),
      hour: shifted.getUTCHours(),
      minute: shifted.getUTCMinutes(),
      second: shifted.getUTCSeconds()
    };
  }

  function pseudoSaTimestamp(parts, hour, minute){
    return Date.UTC(parts.year, parts.month, parts.date, hour, minute, 0, 0) - OFFSET_MS;
  }

  function getState(nowMs){
    const now = getSaoPauloClock(nowMs);
    let startOffsetDays = (DAY_SATURDAY - now.day + 7) % 7;

    const todayStart = pseudoSaTimestamp(now, START_HOUR, START_MINUTE);
    const todayEnd = pseudoSaTimestamp(now, END_HOUR, END_MINUTE);
    const withinGuildBoss = now.day === DAY_SATURDAY && nowMs >= todayStart && nowMs < todayEnd;

    if(withinGuildBoss){
      return { mode:'active', remainingMs: Math.max(0, todayEnd - nowMs) };
    }

    if(startOffsetDays === 0 && nowMs >= todayStart){
      startOffsetDays = 7;
    }

    const candidateDate = {
      year: now.year,
      month: now.month,
      date: now.date + startOffsetDays
    };
    const target = pseudoSaTimestamp(candidateDate, START_HOUR, START_MINUTE);
    return { mode:'waiting', remainingMs: Math.max(0, target - nowMs) };
  }

  function formatRemaining(ms){
    const totalMinutes = Math.max(0, Math.floor(ms / 60000));
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;

    // Até 23h59: horas e minutos. A partir de 24h: dias e horas.
    if(days >= 1) return `${days}d ${hours}h`;
    return `${hours}h ${String(minutes).padStart(2,'0')}m`;
  }

  function update(){
    const count = document.getElementById('guildBossTimerCount');
    const label = document.getElementById('guildBossTimerLabel');
    const bar = document.getElementById('guildBossTimerBar');
    if(!count || !label || !bar) return;

    const state = getState(Date.now());
    count.textContent = formatRemaining(state.remainingMs);
    label.textContent = 'Boss Guilda';

    if(state.mode === 'active'){
      bar.classList.add('is-active');
      bar.title = 'Boss da guilda em andamento · termina às 19:30';
      bar.setAttribute('aria-label', `Boss Guilda em andamento, termina em ${formatRemaining(state.remainingMs)}`);
    }else{
      bar.classList.remove('is-active');
      bar.title = 'Próximo Boss da Guilda: sábado às 19:00';
      bar.setAttribute('aria-label', `Próximo Boss Guilda em ${formatRemaining(state.remainingMs)}`);
    }
  }

  function init(){
    if(!document.body) return;
    update();
    window.setInterval(update, 1000);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, {once:true});
  }else{
    init();
  }
})();
