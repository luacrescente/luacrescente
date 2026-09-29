/* Página "Combos de Artefato" — Combate e Lifeskill.
   Dados: /assets/data/combos/combos-combate.json e combos-lifeskill.json
   (valores do Garmoth em PT-BR: só o combo / com pedras / com pedras amplificadas). */
(function(){
  'use strict';

  const listEl = document.getElementById('comboList');
  if(!listEl) return;

  const filtersEl = document.getElementById('comboFilters');
  const searchEl = document.getElementById('comboSearch');
  const emptyEl = document.getElementById('comboEmpty');
  const tabs = document.querySelectorAll('.combo-tab');
  const params = new URLSearchParams(location.search);
  const CACHE = {};
  const FILES = { combate:'/assets/data/combos/combos-combate.json?v=3', lifeskill:'/assets/data/combos/combos-lifeskill.json?v=3' };
  const SUPPORTS_SHARE = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const state = {
    mode: params.get('mode') === 'lifeskill' ? 'lifeskill' : 'combate',
    category: 'Todos',
    search: (params.get('search') || '').trim(),
    data: []
  };

  const esc = (v)=>String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = (v)=>String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

  function stoneLine(s){
    const qty = s.qty > 1 ? `<strong>${s.qty}×</strong> ` : '';
    const amp = s.amplified ? '<span class="combo-stone-alt">ou Amplificada</span>' : '';
    return `<li class="${s.free?'is-free':''}">${qty}${esc(s.name)} ${amp}</li>`;
  }

  function statList(arr){
    if(!arr || !arr.length) return '<div class="combo-empty-col">—</div>';
    return '<ul class="combo-stats">' + arr.map(x=>{
      const m = String(x).match(/^(.*?)\s([+-][\d.,]+.*)$/);
      if(!m) return `<li>${esc(x)}</li>`;
      const neg = m[2].startsWith('-');
      return `<li><span>${esc(m[1])}</span><b class="${neg?'neg':'pos'}">${esc(m[2])}</b></li>`;
    }).join('') + '</ul>';
  }

  function cardHTML(it, idx){
    const showEN = it.name_en && it.name_en !== it.name;
    const hasAmp = !!(it.tiers && it.tiers.amplified);
    const flag = it.unnamed ? '<span class="tag combo-flag" title="Nome ainda não confirmado">sem nome</span>'
               : it.name_guess ? '<span class="tag combo-flag" title="Nome provável, ainda não confirmado">nome a confirmar</span>' : '';
    const summary = (it.tiers.normal || []).slice(0,2).join(' · ');
    const I = window.LC_ICONS || {};
    const shareIcon = SUPPORTS_SHARE ? I.share : I.link;
    const shareTitle = SUPPORTS_SHARE ? 'Compartilhar este combo' : 'Copiar link deste combo';
    const imgTitle = SUPPORTS_SHARE ? 'Compartilhar imagem deste combo' : 'Copiar imagem deste combo';
    return `<div class="root-item combo-item" data-idx="${idx}" data-combo="${esc(it.name)}">
      <div class="root-head">
        <span class="chevron"></span>
        <span class="root-name">${esc(it.name)}${showEN ? ` <em class="combo-en">${esc(it.name_en)}</em>` : ''}</span>
        ${flag}
        <span class="tag">${esc(it.category)}</span>
        <button type="button" class="export-list-btn combo-image" aria-label="${imgTitle}" title="${imgTitle}">${I.image}</button>
        <button type="button" class="copy-link-btn combo-share" aria-label="${shareTitle}" title="${shareTitle}">${shareIcon}</button>
      </div>
      <div class="combo-summary">${esc(summary)}</div>
      <div class="body">
        <div class="combo-block-title">Pedras da Luz necessárias</div>
        <ul class="combo-stones">${it.lightstones.map(stoneLine).join('')}</ul>
        <div class="combo-tiers${hasAmp?'':' two'}">
          <div class="combo-tier"><div class="combo-tier-title">Só o efeito do combo</div>${statList(it.tiers.combo)}</div>
          <div class="combo-tier"><div class="combo-tier-title">Com Pedras da Luz</div>${statList(it.tiers.normal)}</div>
          ${hasAmp ? `<div class="combo-tier"><div class="combo-tier-title">Com Pedras Amplificadas</div>${statList(it.tiers.amplified)}</div>` : ''}
        </div>
      </div>
    </div>`;
  }

  function haystack(it){
    return norm([it.name, it.name_en, it.category,
      ...it.lightstones.map(s=>s.name),
      ...(it.tiers.combo||[]), ...(it.tiers.normal||[]), ...(it.tiers.amplified||[])].join(' | '));
  }

  function buildFilters(){
    const cats = ['Todos', ...Array.from(new Set(state.data.map(d=>d.category)))];
    filtersEl.innerHTML = cats.map(c=>{
      const n = c==='Todos' ? state.data.length : state.data.filter(d=>d.category===c).length;
      return `<button type="button" class="combo-chip${c===state.category?' active':''}" data-cat="${esc(c)}">${esc(c)} <span>${n}</span></button>`;
    }).join('');
  }

  function render(){
    const q = norm(state.search);
    const items = state.data.map((it,i)=>({it,i})).filter(({it})=>
      (state.category==='Todos' || it.category===state.category) && (!q || haystack(it).includes(q)));
    listEl.innerHTML = items.map(({it,i})=>cardHTML(it,i)).join('');
    emptyEl.style.display = items.length ? 'none' : 'block';
  }

  async function load(mode){
    if(!CACHE[mode]){
      const res = await fetch(FILES[mode]);
      if(!res.ok) throw new Error('Falha ao carregar combos: '+res.status);
      CACHE[mode] = await res.json();
    }
    return CACHE[mode];
  }

  async function setMode(mode, keepSearch){
    state.mode = mode;
    state.category = 'Todos';
    if(!keepSearch){ state.search=''; searchEl.value=''; }
    tabs.forEach(t=>{ const on = t.dataset.mode===mode; t.classList.toggle('active',on); t.setAttribute('aria-selected',String(on)); });
    try{
      state.data = await load(mode);
    }catch(err){
      console.error('[Combos]',err);
      listEl.innerHTML = '';
      emptyEl.style.display='block'; emptyEl.textContent='Não foi possível carregar os combos.';
      return;
    }
    emptyEl.textContent = 'Nenhum combo encontrado.';
    buildFilters();
    render();
  }

  function openFromUrl(){
    const name = params.get('combo');
    if(!name) return;
    const el = Array.from(listEl.querySelectorAll('.combo-item')).find(n=>n.dataset.combo===name);
    if(el){ el.classList.add('open'); el.scrollIntoView({block:'start'}); }
  }

  function comboLink(name){
    const qs = new URLSearchParams({mode: state.mode, combo: name});
    return location.origin + '/combos.html?' + qs.toString();
  }

  // ---- imagem do combo (canvas puro, igual às receitas) ----
  function slugify(n){ return String(n).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase() || 'combo'; }

  function drawComboImage(it){
    const W = 680, padX = 28;
    const sections = [
      ['Só o efeito do combo', it.tiers.combo],
      ['Com Pedras da Luz', it.tiers.normal],
      ['Com Pedras Amplificadas', it.tiers.amplified]
    ].filter(x=>x[1] && x[1].length);
    const stones = it.lightstones;
    let H = padX + 30 + 26 + 22 + stones.length*26 + 10;
    sections.forEach(sec=>{ H += 20 + 22 + sec[1].length*22 + 6; });
    H += 46;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    const cv = document.createElement('canvas');
    cv.width = Math.ceil(W*scale); cv.height = Math.ceil(H*scale);
    const c = cv.getContext('2d'); c.scale(scale, scale);
    c.fillStyle = '#15171d'; c.fillRect(0,0,W,H);
    c.strokeStyle = '#c9a24b'; c.lineWidth = 2; c.strokeRect(1,1,W-2,H-2);
    let y = padX;
    c.fillStyle = '#c9a24b'; c.font = 'bold 24px Georgia, serif';
    c.fillText(it.name, padX, y+24); y += 34;
    c.fillStyle = '#9b968a'; c.font = '13px Arial';
    c.fillText(`${it.group} · ${it.category}`, padX, y+12); y += 30;
    c.fillStyle = '#8a7139'; c.font = 'bold 11px Arial';
    c.fillText('PEDRAS DA LUZ (4 ESPAÇOS)', padX, y+11); y += 22;
    c.font = '15px Arial';
    stones.forEach(st=>{
      c.fillStyle = '#c9a24b'; c.fillText('•', padX, y+15);
      c.fillStyle = st.free ? '#9b968a' : '#e8e3d5';
      c.fillText(`${st.qty>1?st.qty+'x  ':''}${st.name}`, padX+16, y+15); y += 26;
    });
    y += 10;
    sections.forEach(([title, list])=>{
      c.strokeStyle = '#272b35'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(padX,y); c.lineTo(W-padX,y); c.stroke(); y += 20;
      c.fillStyle = '#c9a24b'; c.font = 'bold 12px Arial';
      c.fillText(title.toUpperCase(), padX, y+12); y += 22;
      c.font = '14px Arial';
      list.forEach(line=>{
        const m = String(line).match(/^(.*?)\s([+-][\d.,]+.*)$/);
        c.fillStyle = '#b9b4a6';
        c.fillText(m?m[1]:line, padX+8, y+14);
        if(m){
          c.fillStyle = m[2].startsWith('-') ? '#e0847a' : '#7fd39a';
          c.textAlign = 'right'; c.fillText(m[2], W-padX, y+14); c.textAlign = 'left';
        }
        y += 22;
      });
      y += 6;
    });
    c.fillStyle = '#8a7139'; c.font = '13px Arial';
    c.fillText('🌙 Lua Crescente — Santuário da Guilda', padX, H-padX+2);
    return cv;
  }

  function shareComboImage(it, btn){
    if(!it) return;
    const I = window.LC_ICONS || {};
    const feedback = (icon)=>{ const old = btn.innerHTML; btn.innerHTML = icon; setTimeout(()=>{ btn.innerHTML = old; },1300); };
    drawComboImage(it).toBlob(async (blob)=>{
      if(!blob){ window.prompt('Não foi possível gerar a imagem. Copie o link:', comboLink(it.name)); return; }
      const filename = `artefato-${slugify(it.name)}.png`;
      if(SUPPORTS_SHARE && navigator.canShare){
        try{
          const file = new File([blob], filename, {type:'image/png'});
          if(navigator.canShare({files:[file]})){ await navigator.share({files:[file], title: it.name}); feedback(I.check); return; }
        }catch(err){ if(err && err.name==='AbortError') return; }
      }
      if(navigator.clipboard && window.ClipboardItem){
        try{ await navigator.clipboard.write([new window.ClipboardItem({'image/png': blob})]); feedback(I.check); return; }catch(err){}
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(url), 4000);
      feedback(I.download);
    }, 'image/png');
  }

  // ---- eventos ----
  tabs.forEach(t=>t.addEventListener('click',()=>{ if(t.dataset.mode!==state.mode) setMode(t.dataset.mode); }));

  filtersEl.addEventListener('click',(e)=>{
    const b = e.target.closest('.combo-chip'); if(!b) return;
    state.category = b.dataset.cat; buildFilters(); render();
  });

  searchEl.addEventListener('input',()=>{ state.search = searchEl.value; render(); });
  document.getElementById('comboExpandAll')?.addEventListener('click',()=>listEl.querySelectorAll('.combo-item').forEach(n=>n.classList.add('open')));
  document.getElementById('comboCollapseAll')?.addEventListener('click',()=>listEl.querySelectorAll('.combo-item').forEach(n=>n.classList.remove('open')));

  listEl.addEventListener('click',(e)=>{
    const share = e.target.closest('.combo-share');
    const item = e.target.closest('.combo-item');
    if(!item) return;
    const imgBtn = e.target.closest('.combo-image');
    if(imgBtn){
      e.preventDefault(); e.stopPropagation();
      shareComboImage(state.data[Number(item.dataset.idx)], imgBtn);
      return;
    }
    if(share){
      e.preventDefault(); e.stopPropagation();
      const name = item.dataset.combo;
      const link = comboLink(name);
      const done = ()=>{ const old = share.innerHTML; share.innerHTML=(window.LC_ICONS||{}).check||'OK'; setTimeout(()=>{ share.innerHTML = old; },1300); };
      const copy = ()=>{
        if(navigator.clipboard?.writeText) navigator.clipboard.writeText(link).then(done).catch(()=>window.prompt('Copie o link abaixo:',link));
        else window.prompt('Copie o link abaixo:',link);
      };
      if(SUPPORTS_SHARE){
        navigator.share({title:`${name} — Lua Crescente`,url:link}).then(done).catch(err=>{ if(err && err.name==='AbortError') return; copy(); });
      } else copy();
      return;
    }
    if(e.target.closest('.body')) return;
    item.classList.toggle('open');
  });

  // ---- início ----
  searchEl.value = state.search;
  setMode(state.mode, true).then(openFromUrl);
})();
