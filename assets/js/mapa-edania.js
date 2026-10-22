// Lua Crescente — Mapa de Progresso (multi-mapa) v4
// - Lê index.json e permite trocar entre os 3 mapas sem recarregar
// - Progresso salvo em localStorage, separado por mapa
// - Nomes/áreas: preferência inglês, com limpeza de resíduo coreano
(function(){
  'use strict';

  var INDEX_URL = '/assets/data/mapa-edania/index.json';
  var DATA_ROOT = '/assets/data/mapa-edania/';
  var TILES_ROOT = '/assets/img/tiles/';

  // ---------- i18n ----------
  var LANG = localStorage.getItem('lc-mapa-lang') || 'pt';
  var M = null;
  var TILES = {};
  var IMG = {};
  var VID = {};
  var I18N = {};
  var LAYERS_EN = {};
  var LAYERS_PT = {
    relic:'Relíquias', trace:'Vestígios', klore:'Conhecimento',
    node:'Nós', npc:'NPCs', quest:'Missões de Moeda',
  };
  var I18N_EX = {
    pt:{
      results:'Resultados', clearSearch:'Limpar', layersTitle:'Camadas do mapa',
      needPre:'Requer', needTag:'(Req. {n})', needQuest:'Missão principal',
      video:'Vídeo do guia', questProgress:'Missões', questShort:'Missões',
      mainQ:'Recompensas de missão principal', mainQShort:'Missão principal',
      fit:'Ver tudo', save:'Salvar', load:'Carregar',
      resetAll:'Resetar conclusão', doneAll:'Concluir tudo',
      confirmReset:'Apagar as {n} conclusões salvas? Não dá pra desfazer.',
      confirmDone:'Marcar TODOS os pontos como concluídos?',
      progress:'Progresso', coinLabel:'Moeda de Ouro', coinN:'+{n} Moeda de Ouro',
      done:'Feito', undone:'Desfazer', none:'Nada encontrado',
    },
    ko:{}, en:{},
  };

  function T(k){
    return (I18N[LANG] && I18N[LANG][k])
        || (I18N_EX[LANG] && I18N_EX[LANG][k])
        || (I18N.pt && I18N.pt[k])
        || k;
  }
  // Remove qualquer caractere coreano (Hangul) de um texto.
  // Devolve string vazia se não sobrar nada útil.
  function limparCoreano(s){
    if(!s) return '';
    return String(s)
      .replace(/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function NM(p){
    if(p.ne) return p.ne;                        // inglês sempre preferido
    return limparCoreano(p.n);                   // se não tem inglês, limpa
  }
  function AR(p){
    if(p.ae) return p.ae;
    return limparCoreano(p.a || '');
  }
  function LBL(id){
    if(LANG === 'en' && LAYERS_EN[id]) return LAYERS_EN[id];
    if(LANG === 'pt' && LAYERS_PT[id]) return LAYERS_PT[id];
    var raw = (M && M.meta.layers[id] && M.meta.layers[id].label) || id;
    return limparCoreano(raw) || id;
  }
  function KND(k){
    var map = { '유산':'Relíquia', '흔적':'Vestígio', '지식':'Conhecimento', '퀘스트':'Missão' };
    return map[k] || k;
  }

  // ---------- Carregador de script ----------
  function carregarScript(url){
    return fetch(url, { cache: 'no-store' })
      .then(function(r){
        if(!r.ok) throw new Error('HTTP ' + r.status + ' em ' + url);
        return r.text();
      })
      .then(function(code){
        var s = document.createElement('script');
        s.textContent = code;
        document.head.appendChild(s);
        document.head.removeChild(s);
      });
  }

  // ---------- AbortController ----------
  var AC = null;

  // ---------- Troca de mapa ----------
  function loadMap(mapa){
    var selectEl = document.getElementById('mapa-edania-select');
    if(selectEl) selectEl.disabled = true;

    var base = DATA_ROOT + mapa.slug + '/';

    window.MARKERS = undefined;
    window.TILES = undefined;
    window.IMAGES = undefined;
    window.VIDEOS = undefined;

    return Promise.all([
      carregarScript(base + 'tiles.js'),
      carregarScript(base + 'markers.js'),
      carregarScript(base + 'images.js'),
      carregarScript(base + 'videos.js'),
    ]).then(function(){
      M = window.MARKERS;
      TILES = window.TILES || {};
      IMG = window.IMAGES || {};
      VID = window.VIDEOS || {};
      I18N = (M.meta && M.meta.i18n) || { ko:{}, en:{}, pt:{} };
      LAYERS_EN = (M.meta && M.meta.layers_en) || {};

      var titleEl = document.getElementById('mapa-edania-title');
      if(titleEl) titleEl.textContent = mapa.title || (M.meta && M.meta.title) || 'Mapa';
      document.title = (mapa.title || 'Mapa') + ' · Lua Crescente';

      initMapa(mapa);
      if(selectEl) selectEl.disabled = false;
    }).catch(function(err){
      console.error('[Mapa] Erro ao carregar', mapa.slug, err);
      if(selectEl) selectEl.disabled = false;
      var titleEl = document.getElementById('mapa-edania-title');
      if(titleEl) titleEl.textContent = 'Erro ao carregar';
    });
  }

  // ---------- Init do mapa atual ----------
  function initMapa(mapa){
    if(AC) AC.abort();
    AC = new AbortController();
    var sig = { signal: AC.signal };

    var cv = document.getElementById('mapa-edania-canvas');
    var wrap = document.getElementById('mapa-edania-stage');
    if(!cv || !wrap){ console.error('[Mapa] canvas/stage não encontrados'); return; }
    var ctx = cv.getContext('2d');

    var slug = mapa.slug;

    // ---------- Coordenadas ----------
    var W = M.meta.world;
    var SECTOR = W.sector, TILE = W.tile;
    var WORLD_X0 = W.sx0 * SECTOR;
    var WORLD_Z1 = (W.sz1 + 1) * SECTOR;
    var toU = function(wx){ return (wx - WORLD_X0) / SECTOR; };
    var toV = function(wz){ return (WORLD_Z1 - wz) / SECTOR; };

    var OCEAN = '#183435';
    var DPR = 1, VW = 0, VH = 0;
    var CHEST = ['relic','trace'];
    var on = {};
    Object.keys(M.points).forEach(function(id){
      on[id] = (M.meta.off || ['klore']).indexOf(id) === -1;
    });

    // ---------- Progresso ----------
    var STORE = 'lc-mapa-edania-done:' + slug;
    var DONE = new Set();
    try{
      var raw = localStorage.getItem(STORE);
      if(raw) DONE = new Set(JSON.parse(raw));
    }catch(e){}
    function saveDone(){
      try{ localStorage.setItem(STORE, JSON.stringify(Array.from(DONE))); }catch(e){}
    }
    function keyOf(p){ return p.kind + '-' + p.num; }
    function qKey(p,i){ return keyOf(p) + '#' + i; }
    function qDone(p,i){ return DONE.has(qKey(p,i)); }
    function qCount(p){ return (p.quests||[]).filter(function(_,i){ return qDone(p,i); }).length; }
    function questAll(p){ return !!(p.quests && p.quests.length) && qCount(p) === p.quests.length; }
    function isDone(p){
      if(!p.kind) return false;
      if(p.quests) return questAll(p);
      return DONE.has(keyOf(p));
    }

    // ---------- Main quests ----------
    var MAINQ = M.meta.mainQuests || [];
    var mqKey = function(i){ return 'main-' + MAINQ[i].n; };
    var mqDone = function(i){ return DONE.has(mqKey(i)); };
    var mqCount = function(){ return MAINQ.filter(function(_,i){ return mqDone(i); }).length; };
    var MQ_OPEN_KEY = 'lc-mapa-edania-mainq-open:' + slug;

    // ---------- Imagens / vídeos ----------
    function imagesFor(p){ return IMG[keyOf(p)] || IMG['name-' + (p.n||'')] || []; }
    function videoFor(p){ return VID[keyOf(p)] || ''; }
    var IMGV = '1';
    function imgURL(src){
      if(!src) return '';
      if(/^https?:\/\//i.test(src)) return src;
      return DATA_ROOT + slug + '/' + src.replace(/^\.?\//,'') + '?v=' + IMGV;
    }

    // ---------- Bounding box ----------
    var PAD = 2.5;
    var BOX = (function(){
      var x0=1e9, x1=-1e9, z0=1e9, z1=-1e9;
      Object.keys(M.points).forEach(function(id){
        M.points[id].forEach(function(p){
          if(p.x < x0) x0 = p.x;
          if(p.x > x1) x1 = p.x;
          if(p.z < z0) z0 = p.z;
          if(p.z > z1) z1 = p.z;
        });
      });
      return { u0: toU(x0)-PAD, u1: toU(x1)+PAD, v0: toV(z1)-PAD, v1: toV(z0)+PAD };
    })();
    var BOXW = BOX.u1 - BOX.u0, BOXH = BOX.v1 - BOX.v0;

    var view = { u:(BOX.u0+BOX.u1)/2, v:(BOX.v0+BOX.v1)/2, k:8 };
    var sel = null;

    // ---------- Tiles ----------
    var cache = new Map();
    var have = {};
    Object.keys(TILES).forEach(function(l){ have[l] = new Set(TILES[l]); });

    function tileImg(lvl, tx, ty){
      var key = lvl + '/' + tx + '_' + ty;
      var im = cache.get(key);
      if(im !== undefined) return im;
      if(have[lvl] && !have[lvl].has(tx+'_'+ty)){ cache.set(key, null); return null; }
      im = new Image();
      im.onload = function(){ draw(); };
      im.onerror = function(){ cache.set(key, null); };
      im.src = TILES_ROOT + slug + '/L' + lvl + '/' + tx + '_' + ty + '.webp';
      cache.set(key, im);
      return im;
    }

    var LEVELS = W.levels.slice().sort(function(a,b){ return a-b; });
    function pickLevel(){
      for(var i = 0; i < LEVELS.length; i++) if(LEVELS[i] >= view.k) return LEVELS[i];
      return LEVELS[LEVELS.length-1];
    }

    var sx = function(u){ return (u - view.u) * view.k + VW/2; };
    var sy = function(v){ return (v - view.v) * view.k + VH/2; };
    var ux = function(px){ return (px - VW/2) / view.k + view.u; };
    var vy = function(py){ return (py - VH/2) / view.k + view.v; };
    var kFit = function(){ return Math.min(VW/BOXW, VH/BOXH); };

    function clamp(){
      if(!isFinite(view.k) || view.k <= 0) view.k = kFit() || 8;
      if(!isFinite(view.u)) view.u = (BOX.u0 + BOX.u1) / 2;
      if(!isFinite(view.v)) view.v = (BOX.v0 + BOX.v1) / 2;
      view.k = Math.max(kFit(), Math.min(256, view.k));
      var hu = VW/(2*view.k), hv = VH/(2*view.k);
      view.u = hu*2 >= BOXW ? (BOX.u0+BOX.u1)/2 : Math.max(BOX.u0+hu, Math.min(BOX.u1-hu, view.u));
      view.v = hv*2 >= BOXH ? (BOX.v0+BOX.v1)/2 : Math.max(BOX.v0+hv, Math.min(BOX.v1-hv, view.v));
    }

    function resize(){
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      var hadSize = VW > 0 && VH > 0;
      VW = wrap.clientWidth;
      VH = wrap.clientHeight;
      cv.width = VW * DPR;
      cv.height = VH * DPR;
      cv.style.width = VW + 'px';
      cv.style.height = VH + 'px';
      if(!hadSize && VW > 0 && VH > 0){
        view.k = kFit();
        view.u = (BOX.u0 + BOX.u1) / 2;
        view.v = (BOX.v0 + BOX.v1) / 2;
      }
      clamp(); draw();
    }

    // ---------- Refs ----------
    var tipEl = document.getElementById('mapa-edania-tip');
    var selEl = document.getElementById('mapa-edania-sel');
    var lbEl = document.getElementById('mapa-edania-lb');
    var lbImg = document.getElementById('mapa-edania-lb-img');

    var NEWDOT = { relic: '#ffffff', trace: '#ff57e0' };
    var NEWTXT = { relic: '#ffffff', trace: '#ffc4f2' };
    function dotCol(p, id){
      if(p.new && NEWDOT[id]) return NEWDOT[id];
      if(id === 'quest' && questAll(p)) return M.meta.layers.node.color;
      return M.meta.layers[id].color;
    }

    if(M.points.klore) M.points.klore.forEach(function(p){
      if(!p.kind){ p.kind = '지식'; p.num = Math.round(p.x) + '_' + Math.round(p.z); }
    });
    if(M.points.quest) M.points.quest.forEach(function(p){
      if(!p.kind){ p.kind = '퀘스트'; p.num = Math.round(p.x) + '_' + Math.round(p.z); }
    });

    var DONEABLE = ['relic','trace','klore'].flatMap(function(id){ return M.points[id] || []; });

    var radius = function(id){
      if(CHEST.indexOf(id) !== -1) return Math.max(2.8, Math.min(6.5, view.k * .22));
      if(id === 'quest') return Math.max(3.2, Math.min(7.0, view.k * .24));
      return Math.max(2.2, Math.min(5.0, view.k * .17));
    };

    // ---------- Draw ----------
    function draw(){
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, VW, VH);
      ctx.fillStyle = OCEAN;
      ctx.fillRect(0, 0, VW, VH);

      var lvl = pickLevel();
      var span = TILE / lvl, px = span * view.k;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      for(var ty = Math.floor(vy(0)/span); ty < Math.ceil(vy(VH)/span); ty++){
        for(var tx = Math.floor(ux(0)/span); tx < Math.ceil(ux(VW)/span); tx++){
          if(tx < 0 || ty < 0) continue;
          var im = tileImg(lvl, tx, ty);
          if(!im || !im.complete || !im.naturalWidth) continue;
          ctx.drawImage(im, sx(tx*span), sy(ty*span), px + 1, px + 1);
        }
      }

      ['npc','node','quest','klore','trace','relic'].forEach(function(id){
        if(!on[id] || !M.points[id]) return;
        var r = radius(id);
        ctx.lineWidth = Math.max(1, r * .35);
        var lista = id === 'node' ? nodeList() : M.points[id];
        lista.forEach(function(p){
          var X = sx(toU(p.x)), Y = sy(toV(p.z));
          if(X < -20 || Y < -20 || X > VW+20 || Y > VH+20) return;
          ctx.globalAlpha = (isDone(p) && id !== 'quest') ? 0.15 : 1;
          ctx.fillStyle = dotCol(p, id);
          ctx.strokeStyle = 'rgba(11,15,20,.8)';
          ctx.beginPath(); ctx.arc(X, Y, r, 0, 7); ctx.fill(); ctx.stroke();
          ctx.globalAlpha = 1;
          if(sel && sel.p === p){
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(X, Y, r * 2.1, 0, 7); ctx.stroke();
            ctx.lineWidth = Math.max(1, r * .35);
          }
        });
      });

      var NEED_TAG_ZOOM = 40;
      var labels = [];
      var dy = radius('relic') + 10;
      ['relic','trace'].forEach(function(id){
        if(!on[id] || !M.points[id]) return;
        var col = id === 'relic' ? '#ffe9a3' : '#ffb3b3';
        M.points[id].forEach(function(p){
          var needTag = p.needE || p.needL ? NEEDTAG(p) : '';
          if(needTag && view.k < NEED_TAG_ZOOM) return;
          labels.push({
            p: p,
            t: p.rom ? (KND(p.kind) + ' ' + p.rom) : NM(p),
            t2: needTag,
            col: (p.new && NEWTXT[id]) ? NEWTXT[id] : col,
            dy: dy
          });
        });
      });
      if(view.k >= 16){
        ctx.font = '700 12px system-ui, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(11,15,20,.9)';
        var put = [];
        labels.forEach(function(L){
          var X = sx(toU(L.p.x)), Y = sy(toV(L.p.z)) + L.dy;
          if(X < 0 || Y < 0 || X > VW || Y > VH) return;
          var w = ctx.measureText(L.t).width + 8;
          var choca = put.some(function(q){
            return Math.abs(q[0]-X) < (q[2]+w)/2 && Math.abs(q[1]-Y) < 13;
          });
          if(choca) return;
          put.push([X, Y, w]);
          ctx.globalAlpha = isDone(L.p) ? 0.15 : 1;
          ctx.fillStyle = L.col;
          ctx.strokeText(L.t, X, Y); ctx.fillText(L.t, X, Y);
          if(L.t2){
            var Y2 = Y + 12;
            ctx.font = '700 10px system-ui, sans-serif';
            ctx.lineWidth = 3;
            ctx.strokeText(L.t2, X, Y2); ctx.fillText(L.t2, X, Y2);
            ctx.font = '700 12px system-ui, sans-serif';
            ctx.lineWidth = 3.5;
          }
          ctx.globalAlpha = 1;
        });
      }

      if(on.node && M.points.node){
        ctx.font = '600 11px system-ui, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(11,15,20,.8)'; ctx.fillStyle = '#dbe7c9';
        nodeList().forEach(function(p){
          var X = sx(toU(p.x)), Y = sy(toV(p.z));
          if(X < 0 || Y < 0 || X > VW || Y > VH) return;
          var t = NM(p).split('—').pop().trim();
          if(!t) return;
          ctx.strokeText(t, X, Y - 7); ctx.fillText(t, X, Y - 7);
        });
      }

      placeSel();
    }

    function NEEDTAG(p){
      var need = p.needE || p.needL || '';
      if(!need) return '';
      var rom = need.match(/[IVXLC]+$/);
      return T('needTag').replace('{n}', rom ? rom[0] : T('needQuest'));
    }
    function nodeList(){
      var base = (M.points.node || []).slice();
      if(!on.quest && on.node){ base = base.concat(M.points.quest || []); }
      return base;
    }

    function placeSel(){
      if(!sel){ if(selEl) selEl.style.display = 'none'; return; }
      var X = sx(toU(sel.p.x)), Y = sy(toV(sel.p.z));
      if(!selEl) return;
      selEl.style.display = 'block';
      if(window.innerWidth <= 900) return;
      selEl.style.left = Math.max(8, Math.min(X + 16, VW - selEl.offsetWidth - 8)) + 'px';
      selEl.style.top = Math.max(8, Math.min(Y + 14, VH - selEl.offsetHeight - 8)) + 'px';
    }

    // ---------- Seleção ----------
    function select(p, id){
      sel = { p: p, id: id };
      document.getElementById('mapa-edania-sel-t').textContent = NM(p);
      var base;
      if(CHEST.indexOf(id) !== -1){ base = AR(p); }
      else if(p.quests){ base = LBL(id) + (AR(p) ? ' · ' + AR(p) : ''); }
      else { base = LBL(id) + (AR(p) ? ' · ' + AR(p) : ''); }
      document.getElementById('mapa-edania-sel-s').innerHTML = '<div>' + base + '</div>';

      var ql = document.getElementById('mapa-edania-sel-quests');
      ql.innerHTML = '';
      if(p.quests && p.quests.length){
        var gotCoin = p.quests.reduce(function(t,q,i){ return t + (qDone(p,i) ? (q.c||0) : 0); }, 0);
        var sum = document.createElement('div');
        sum.className = 'q-sum';
        sum.innerHTML = '<span>' + T('questProgress') + '</span><span><b>' + qCount(p) + '</b>/' + p.quests.length + ' · <b>' + gotCoin + '</b>/' + (p.coin||0) + '</span>';
        ql.appendChild(sum);
        p.quests.forEach(function(q, i){
          var row = document.createElement('label');
          row.className = 'q-row' + (qDone(p,i) ? ' on' : '');
          var nomeQ = q.ne ? q.ne : limparCoreano(q.n);
          row.innerHTML = '<input type="checkbox"' + (qDone(p,i) ? ' checked' : '') + '>'
            + '<span class="q-n">' + nomeQ + '</span>'
            + '<span class="q-c">+' + (q.c||0) + '</span>';
          row.querySelector('input').onchange = function(e){
            if(e.target.checked) DONE.add(qKey(p,i));
            else DONE.delete(qKey(p,i));
            saveDone(); progress(); select(p, id); draw();
          };
          ql.appendChild(row);
        });
      }

      var b = document.getElementById('mapa-edania-sel-done');
      b.style.display = p.kind ? '' : 'none';
      b.textContent = isDone(p) ? T('undone') : T('done');
      b.classList.toggle('on', !isDone(p));

      var gal = document.getElementById('mapa-edania-sel-imgs');
      gal.innerHTML = '';
      var imgs = imagesFor(p);
      var vid = videoFor(p);
      imgs.forEach(function(src, i){
        var im = document.createElement('img');
        im.src = imgURL(src); im.loading = 'lazy'; im.alt = p.n;
        im.onclick = function(){ openLb(imgs, i, p.n); };
        gal.appendChild(im);
      });
      if(vid){
        var bx = document.createElement('div');
        bx.className = 'vid-thumb';
        var th = document.createElement('img');
        th.src = 'https://i.ytimg.com/vi/' + vid + '/mqdefault.jpg';
        th.onerror = function(){ th.remove(); bx.style.background = '#3a1414'; };
        bx.appendChild(th);
        bx.onclick = function(){ openLb([{v:vid}], 0, p.n); };
        gal.appendChild(bx);
      }
      draw();
    }

    document.getElementById('mapa-edania-sel-done').onclick = function(){
      if(!sel || !sel.p.kind) return;
      var p0 = sel.p;
      if(p0.quests && p0.quests.length){
        var all = questAll(p0);
        p0.quests.forEach(function(_,i){
          if(all) DONE.delete(qKey(p0,i));
          else DONE.add(qKey(p0,i));
        });
        saveDone(); progress(); select(p0, sel.id); draw();
        return;
      }
      var k = keyOf(p0);
      if(DONE.has(k)) DONE.delete(k);
      else DONE.add(k);
      saveDone(); progress(); select(p0, sel.id); draw();
      toast(DONE.has(k) ? ('✓ ' + NM(p0)) : ('↺ ' + NM(p0)));
    };

    // ---------- Interação ----------
    var drag = null;
    cv.addEventListener('pointerdown', function(e){
      drag = { u:view.u, v:view.v, clientX:e.clientX, clientY:e.clientY };
      try{ cv.setPointerCapture(e.pointerId); }catch(_){}
      cv.classList.add('drag');
    }, sig);
    cv.addEventListener('pointerup', function(e){
      if(drag && Math.hypot(e.clientX - drag.clientX, e.clientY - drag.clientY) < 5){
        var near = nearest(e);
        if(near) select(near.p, near.id);
        else { sel = null; draw(); }
      }
      drag = null;
      cv.classList.remove('drag');
    }, sig);
    cv.addEventListener('pointermove', function(e){
      if(drag && !pinch){
        view.u = drag.u - (e.clientX - drag.clientX) / view.k;
        view.v = drag.v - (e.clientY - drag.clientY) / view.k;
        clamp(); draw();
        if(tipEl) tipEl.style.display = 'none';
        cv.style.cursor = '';
        return;
      }
      hover(e);
    }, sig);
    cv.addEventListener('wheel', function(e){
      e.preventDefault();
      var r = cv.getBoundingClientRect();
      var mx = e.clientX - r.left, my = e.clientY - r.top;
      var u0 = ux(mx), v0 = vy(my);
      view.k = Math.max(kFit(), Math.min(256, view.k * Math.pow(1.0016, -e.deltaY)));
      view.u = u0 - (mx - VW/2) / view.k;
      view.v = v0 - (my - VH/2) / view.k;
      clamp(); draw();
    }, Object.assign({}, sig, { passive:false }));

    var pinch = null;
    var tp = new Map();
    function zoomAt(px, py, f){
      var u0 = ux(px), v0 = vy(py);
      view.k = Math.max(kFit(), Math.min(256, view.k * f));
      view.u = u0 - (px - VW/2) / view.k;
      view.v = v0 - (py - VH/2) / view.k;
      clamp(); draw(); placeSel();
    }
    cv.addEventListener('touchstart', function(e){
      var r = cv.getBoundingClientRect();
      Array.from(e.changedTouches).forEach(function(t){
        tp.set(t.identifier, { x: t.clientX - r.left, y: t.clientY - r.top });
      });
      if(tp.size === 2){
        var arr = Array.from(tp.values());
        pinch = { d: Math.hypot(arr[0].x-arr[1].x, arr[0].y-arr[1].y), k: view.k };
      }
    }, Object.assign({}, sig, { passive:true }));
    cv.addEventListener('touchmove', function(e){
      var r = cv.getBoundingClientRect();
      Array.from(e.changedTouches).forEach(function(t){
        tp.set(t.identifier, { x: t.clientX - r.left, y: t.clientY - r.top });
      });
      if(pinch && tp.size === 2){
        var arr = Array.from(tp.values());
        var d = Math.hypot(arr[0].x-arr[1].x, arr[0].y-arr[1].y);
        zoomAt((arr[0].x+arr[1].x)/2, (arr[0].y+arr[1].y)/2, (pinch.k * d / pinch.d) / view.k);
      }
    }, Object.assign({}, sig, { passive:true }));
    cv.addEventListener('touchend', function(e){
      Array.from(e.changedTouches).forEach(function(t){ tp.delete(t.identifier); });
      if(tp.size < 2) pinch = null;
    }, Object.assign({}, sig, { passive:true }));
    cv.addEventListener('touchcancel', function(e){
      Array.from(e.changedTouches).forEach(function(t){ tp.delete(t.identifier); });
      if(tp.size < 2) pinch = null;
    }, Object.assign({}, sig, { passive:true }));

    function nearest(e, R){
      R = R || 20;
      var rect = cv.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;
      var best = null, bd = R * R;
      Object.keys(M.points).forEach(function(id){
        if(!on[id] && !(id === 'quest' && on.node)) return;
        M.points[id].forEach(function(p){
          var dx = sx(toU(p.x)) - mx, dy = sy(toV(p.z)) - my;
          var d = dx*dx + dy*dy;
          if(d < bd){ bd = d; best = { p:p, id:id }; }
        });
      });
      return best;
    }

    function hover(e){
      var best = nearest(e);
      if(!best || !tipEl){ if(tipEl) tipEl.style.display = 'none'; cv.style.cursor = ''; return; }
      var p = best.p, id = best.id;
      var sub = CHEST.indexOf(id) !== -1 ? AR(p)
              : (p.quests ? LBL(id) + (AR(p) ? ' · ' + AR(p) : '')
              : LBL(id) + (AR(p) ? ' · ' + AR(p) : ''));
      tipEl.innerHTML = '<div><b>' + NM(p) + '</b>' + (isDone(p) ? ' <span class="k">' + T('done') + '</span>' : '') + '</div>'
        + (sub ? '<div class="k">' + sub + '</div>' : '');
      tipEl.style.display = 'block'; cv.style.cursor = 'pointer';
      var rect = cv.getBoundingClientRect();
      var mx = e.clientX - rect.left, my = e.clientY - rect.top;
      var w = tipEl.offsetWidth, hh = tipEl.offsetHeight;
      tipEl.style.left = Math.min(mx + 14, VW - w - 8) + 'px';
      tipEl.style.top = Math.min(my + 16, VH - hh - 8) + 'px';
    }

    // ---------- Layers UI ----------
    var box = document.getElementById('mapa-edania-layers');
    box.innerHTML = '';
    ['relic','trace','quest','klore','node','npc'].forEach(function(id){
      if(!M.points[id]) return;
      var L = M.meta.layers[id];
      var el = document.createElement('label');
      el.className = 'mapa-edania-layer' + (on[id] ? '' : ' off');
      el.dataset.layer = id;
      el.innerHTML = '<input type="checkbox"' + (on[id] ? ' checked' : '') + '>'
        + '<span class="dot" style="background:' + L.color + '"></span>'
        + '<span class="nm">' + LBL(id) + '</span>'
        + '<span class="offb">' + (LANG === 'en' ? 'OFF' : 'Fechada') + '</span>'
        + '<span class="ct">' + layerCount(id) + '</span>';
      el.querySelector('input').onchange = function(e){
        on[id] = e.target.checked;
        el.classList.toggle('off', !on[id]);
        search(); draw();
      };
      box.appendChild(el);
    });

    function layerCount(id){
      if(id === 'quest'){
        return (M.points.quest || []).reduce(function(t,p){ return t + (p.quests || []).length; }, 0);
      }
      return (M.points[id] || []).length;
    }

    // ---------- Busca ----------
    var ROMAN = { I:1, V:5, X:10, L:50, C:100 };
    function fromRoman(s){
      var t = 0;
      for(var i = 0; i < s.length; i++){
        var a = ROMAN[s[i]], b = ROMAN[s[i+1]];
        if(!a) return null;
        t += (b && a < b) ? -a : a;
      }
      return t || null;
    }
    function focusPoint(p, id){
      view.k = Math.max(view.k, 70);
      view.u = toU(p.x); view.v = toV(p.z);
      clamp(); select(p, id); draw();
    }
    function search(){
      var raw = document.getElementById('mapa-edania-q').value.trim();
      var hits = document.getElementById('mapa-edania-hits');
      hits.innerHTML = '';
      hits.classList.remove('hidden');
      if(!raw) return;
      var s = raw.toUpperCase().replace(/\s+/g,'');
      var kind = null;
      if(s.indexOf('유산') !== -1 || s.indexOf('LEGACY') !== -1 || s.indexOf('RELÍQUIA') !== -1 || s.indexOf('RELÍQUIAS') !== -1) kind = '유산';
      else if(s.indexOf('흔적') !== -1 || s.indexOf('TRACE') !== -1 || s.indexOf('VESTÍGIO') !== -1 || s.indexOf('VESTÍGIOS') !== -1) kind = '흔적';
      var rest = s.replace(/유산|흔적|LEGACY|TRACES?|TACHYON|RELÍQUIA|RELÍQUIAS|VESTÍGIO|VESTÍGIOS/g,'');
      var num = /^\d+$/.test(rest) ? +rest : (/^[IVXLC]+$/.test(rest) ? fromRoman(rest) : null);
      var out = [];
      ['relic','trace','klore','node','quest','npc'].forEach(function(id){
        if(!on[id] || !M.points[id]) return;
        M.points[id].forEach(function(p){
          var hay = ((p.n||'') + ' ' + (p.a||'') + ' ' + (p.ne||'') + ' ' + (p.ae||'')).toUpperCase();
          var ok;
          if(p.kind){
            if(kind && p.kind !== kind) return;
            if(num != null) ok = p.num === num;
            else if(rest) ok = hay.indexOf(rest) !== -1;
            else ok = !!kind;
          } else {
            if(kind || num != null) return;
            ok = !!rest && hay.indexOf(rest) !== -1;
          }
          if(!ok) return;
          out.push({ p:p, id:id });
        });
      });
      var head = document.createElement('div');
      head.className = 'hits-h';
      head.innerHTML = '<span>' + T('results') + '</span><b>' + out.length + '</b>'
        + '<span class="hits-x" title="' + T('clearSearch') + '">✕</span>';
      head.querySelector('.hits-x').onclick = function(){
        var q = document.getElementById('mapa-edania-q');
        q.value = ''; search(); q.focus();
      };
      hits.appendChild(head);
      if(!out.length){
        var none = document.createElement('div');
        none.className = 'none'; none.textContent = T('none');
        hits.appendChild(none);
        return;
      }
      out.slice(0, 12).forEach(function(h){
        var d = document.createElement('div');
        d.className = isDone(h.p) ? 'it off' : 'it';
        var nm = NM(h.p);
        var ar = AR(h.p);
        d.innerHTML = '<span class="dot" style="background:' + M.meta.layers[h.id].color + '"></span>'
          + '<span>' + (nm || '(sem nome)') + '</span>'
          + (ar ? '<span class="a">' + ar + '</span>' : '');
        d.onclick = function(){ focusPoint(h.p, h.id); };
        hits.appendChild(d);
      });
    }
    document.addEventListener('mousedown', function(e){
      var w = document.getElementById('mapa-edania-search-wrap');
      if(w && !w.contains(e.target)) document.getElementById('mapa-edania-hits').classList.add('hidden');
    }, sig);
    document.getElementById('mapa-edania-q').addEventListener('focus', function(){
      document.getElementById('mapa-edania-hits').classList.remove('hidden');
    }, sig);
    document.getElementById('mapa-edania-q').addEventListener('input', search, sig);
    document.getElementById('mapa-edania-q').addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ var it = document.querySelector('#mapa-edania-hits .it'); if(it) it.click(); }
      if(e.key === 'Escape'){ e.target.value = ''; search(); }
    }, sig);

    // ---------- Progresso ----------
    var COIN_TRACE = {
      1:15,2:15,3:15,4:20,5:25,6:25,7:25,8:30,9:30,10:25,16:15,17:15,18:15,19:15,20:25,21:25,22:25,23:25,24:30,25:25,
      31:15,32:15,33:15,34:30,35:25,36:30,37:30,38:30,39:30,40:20,46:15,47:15,48:15,49:30,50:30,51:25,52:30,53:30,54:30,55:30,
      61:15,62:15,63:15,64:30,65:30,66:30,67:30,68:25,69:30,70:30,76:15,77:15,78:15,79:30,80:25,81:25,82:25,83:25,84:25,85:30
    };
    function traceCoin(p){ return COIN_TRACE[p.num] != null ? COIN_TRACE[p.num] : (p.coin || 0); }
    function coinStats(){
      var earned = 0, total = 0;
      (M.points.relic || []).forEach(function(p){ total += 10; if(isDone(p)) earned += 10; });
      (M.points.trace || []).forEach(function(p){ var v = traceCoin(p); total += v; if(isDone(p)) earned += v; });
      (M.points.quest || []).forEach(function(p){
        (p.quests || []).forEach(function(q, i){ total += (q.c||0); if(qDone(p,i)) earned += (q.c||0); });
      });
      MAINQ.forEach(function(q, i){ total += (q.c||0); if(mqDone(i)) earned += (q.c||0); });
      return { earned:earned, total:total, pct: total ? Math.round(earned/total*100) : 0 };
    }
    function progress(){
      var el = document.getElementById('mapa-edania-prog');
      var tot = new Set(DONEABLE.map(keyOf));
      var per = function(k){
        var all = Array.from(tot).filter(function(t){ return t.indexOf(k) === 0; }).length;
        var got = Array.from(DONE).filter(function(t){ return t.indexOf(k) === 0 && tot.has(t); }).length;
        var pct = all ? Math.round(got/all*100) : 0;
        return '<div class="prog-row"><b class="prog-k">' + KND(k) + '</b> : <b>' + got + '</b>/' + all + ' <span class="prog-pct">(' + pct + '%)</span></div>';
      };
      var questRow = function(){
        var list = M.points.quest || [];
        var all = list.reduce(function(t,p){ return t + (p.quests || []).length; }, 0);
        if(!all) return '';
        var got = list.reduce(function(t,p){ return t + qCount(p); }, 0);
        var pct = Math.round(got/all*100);
        return '<div class="prog-row"><b class="prog-k">' + T('questShort') + '</b> : <b>' + got + '</b>/' + all + ' <span class="prog-pct">(' + pct + '%)</span></div>';
      };
      var c = coinStats();
      var coinRow = '<div class="prog-coin"><b>' + T('coinLabel') + '</b> : <b>' + c.earned + '</b>/' + c.total + ' <span class="prog-pct">(' + c.pct + '%)</span></div>';
      var mainRow = MAINQ.length
        ? '<div class="prog-row"><b class="prog-k">' + T('mainQShort') + '</b> : <b>' + mqCount() + '</b>/' + MAINQ.length + ' <span class="prog-pct">(' + Math.round(mqCount()/MAINQ.length*100) + '%)</span></div>'
        : '';
      el.innerHTML = coinRow + '<div class="prog-h">' + T('progress') + '</div>'
        + per('유산') + per('흔적') + questRow() + mainRow + per('지식');
      renderMainQ();
      updateResetBtn();
    }
    function updateResetBtn(){
      var b = document.getElementById('mapa-edania-btn-reset');
      if(!b) return;
      b.textContent = DONE.size ? T('resetAll') : T('doneAll');
    }
    function renderMainQ(){
      var el = document.getElementById('mapa-edania-mainq');
      if(!el) return;
      el.innerHTML = '';
      if(!MAINQ.length) return;
      var open = localStorage.getItem(MQ_OPEN_KEY) === '1';
      el.classList.toggle('closed', !open);
      var got = MAINQ.reduce(function(t,q,i){ return t + (mqDone(i) ? (q.c||0) : 0); }, 0);
      var tot = MAINQ.reduce(function(t,q){ return t + (q.c||0); }, 0);
      var h = document.createElement('div');
      h.className = 'mq-h';
      h.innerHTML = '<span class="mq-caret">▼</span><b>' + T('mainQ') + '</b><span class="mq-c">' + mqCount() + '/' + MAINQ.length + ' · ' + got + '/' + tot + '</span>';
      h.onclick = function(){
        var o = el.classList.toggle('closed');
        localStorage.setItem(MQ_OPEN_KEY, o ? '0' : '1');
      };
      el.appendChild(h);
      var body = document.createElement('div');
      body.className = 'mq-body';
      MAINQ.forEach(function(q, i){
        var row = document.createElement('div');
        row.className = 'q-row' + (mqDone(i) ? ' on' : '');
        row.title = q.ae || q.a || '';
        var nomeQ = q.ne || q.se || limparCoreano(q.s || q.n);
        var tipoQ = q.te || q.t || '';
        row.innerHTML = '<span class="q-n">' + nomeQ + '</span>'
          + (tipoQ ? '<span class="q-t">' + tipoQ + '</span>' : '')
          + '<span class="q-c">+' + (q.c||0) + '</span>'
          + '<button class="q-b' + (mqDone(i) ? '' : ' on') + '">' + (mqDone(i) ? T('undone') : T('done')) + '</button>';
        row.querySelector('button').onclick = function(){
          if(mqDone(i)) DONE.delete(mqKey(i));
          else DONE.add(mqKey(i));
          saveDone(); progress();
        };
        body.appendChild(row);
      });
      el.appendChild(body);
    }

    // ---------- Botões ----------
    document.getElementById('mapa-edania-ui-head').onclick = function(){
      var collapsed = document.getElementById('mapa-edania-ui').classList.toggle('collapsed');
      document.getElementById('mapa-edania-caret').textContent = collapsed ? 'Expandir' : 'Recolher';
    };
    document.getElementById('mapa-edania-btn-fit').onclick = function(){
      Object.keys(on).forEach(function(id){ on[id] = true; });
      document.querySelectorAll('#mapa-edania-layers .mapa-edania-layer').forEach(function(el){
        el.querySelector('input').checked = true;
        el.classList.remove('off');
      });
      search(); draw();
    };
    document.getElementById('mapa-edania-btn-reset').onclick = function(){
      if(DONE.size){
        if(!window.confirm(T('confirmReset').replace('{n}', DONE.size))) return;
        DONE.clear();
      } else {
        if(!window.confirm(T('confirmDone'))) return;
        DONE = new Set(DONEABLE.filter(function(p){ return p.kind; }).map(keyOf));
        (M.points.quest || []).forEach(function(p){
          (p.quests || []).forEach(function(_,i){ DONE.add(qKey(p,i)); });
        });
        MAINQ.forEach(function(_,i){ DONE.add(mqKey(i)); });
      }
      saveDone(); progress(); search(); draw();
    };
    document.getElementById('mapa-edania-btn-export').onclick = function(){
      var data = { app:'lc-mapa-edania', slug:slug, version:1, saved:new Date().toISOString(), done:Array.from(DONE) };
      var blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
      var url = URL.createObjectURL(blob);
      var d = new Date();
      var stamp = d.getFullYear() + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0');
      var a = document.createElement('a');
      a.href = url; a.download = 'progresso-' + slug + '-' + stamp + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
      toast('✓ Progresso salvo (' + DONE.size + ' pontos)');
    };
    document.getElementById('mapa-edania-btn-import').onclick = function(){
      document.getElementById('mapa-edania-file-import').click();
    };
    document.getElementById('mapa-edania-file-import').onchange = function(e){
      var f = e.target.files && e.target.files[0];
      e.target.value = '';
      if(!f) return;
      var r = new FileReader();
      r.onload = function(){
        try{
          var parsed = JSON.parse(r.result);
          var arr = Array.isArray(parsed) ? parsed : (parsed && parsed.done);
          if(!Array.isArray(arr)) throw new Error('formato inválido');
          DONE = new Set(arr.filter(function(x){ return typeof x === 'string'; }));
          saveDone(); progress(); search(); draw();
          toast('✓ Progresso carregado (' + DONE.size + ' pontos)');
        }catch(err){
          toast('Falha ao carregar — arquivo inválido');
        }
      };
      r.readAsText(f);
    };

    // ---------- Lightbox ----------
    var lbList = [], lbIdx = 0;
    function renderLb(){
      if(!lbList.length) return;
      var it = lbList[lbIdx], isVid = !!(it && it.v);
      var frame = document.getElementById('mapa-edania-lb-vid');
      lbEl.classList.toggle('video', isVid);
      if(isVid){
        lbImg.src = '';
        frame.src = 'https://www.youtube-nocookie.com/embed/' + it.v + '?rel=0&modestbranding=1';
      } else {
        frame.src = 'about:blank';
        lbImg.src = imgURL(it);
      }
      document.getElementById('mapa-edania-lb-count').textContent = lbList.length > 1 ? (lbIdx+1) + ' / ' + lbList.length : '';
      var multi = lbList.length > 1 ? '' : 'hidden';
      document.getElementById('mapa-edania-lb-prev').style.visibility = multi;
      document.getElementById('mapa-edania-lb-next').style.visibility = multi;
    }
    function openLb(list, i, title){
      lbList = list; lbIdx = i || 0;
      document.getElementById('mapa-edania-lb-title').textContent = title || '';
      renderLb(); lbEl.classList.add('open');
    }
    function lbGo(d){
      if(!lbList.length) return;
      lbIdx = (lbIdx + d + lbList.length) % lbList.length;
      renderLb();
    }
    function closeLb(){
      lbEl.classList.remove('open','video');
      lbImg.src = '';
      document.getElementById('mapa-edania-lb-vid').src = 'about:blank';
    }
    document.getElementById('mapa-edania-lb-prev').onclick = function(e){ e.stopPropagation(); lbGo(-1); };
    document.getElementById('mapa-edania-lb-next').onclick = function(e){ e.stopPropagation(); lbGo(1); };
    document.getElementById('mapa-edania-lb-close').onclick = function(e){ e.stopPropagation(); closeLb(); };
    lbEl.addEventListener('click', function(e){ if(e.target === lbEl) closeLb(); }, sig);
    document.addEventListener('keydown', function(e){
      if(!lbEl.classList.contains('open')) return;
      if(e.key === 'ArrowLeft') lbGo(-1);
      else if(e.key === 'ArrowRight') lbGo(1);
      else if(e.key === 'Escape') closeLb();
    }, sig);

    // ---------- Toast ----------
    var toastT;
    function toast(msg){
      var el = document.getElementById('mapa-edania-toast');
      el.textContent = msg;
      el.classList.add('show');
      clearTimeout(toastT);
      toastT = setTimeout(function(){ el.classList.remove('show'); }, 1800);
    }

    // ---------- Boot ----------
    window.addEventListener('resize', resize, sig);
    resize();
    view.k = kFit();
    view.u = (BOX.u0 + BOX.u1) / 2;
    view.v = (BOX.v0 + BOX.v1) / 2;
    clamp(); draw();
    progress();
  }

  // ---------- Boot global ----------
  function init(){
    var selectEl = document.getElementById('mapa-edania-select');
    fetch(INDEX_URL, { cache: 'no-store' })
      .then(function(r){ return r.ok ? r.json() : { maps: [] }; })
      .then(function(data){
        var maps = data.maps || [];
        if(!maps.length){ console.error('[Mapa] index.json vazio'); return; }
        if(selectEl){
          selectEl.innerHTML = maps.map(function(m){
            return '<option value="' + m.slug + '">' + m.title + '</option>';
          }).join('');
          selectEl.addEventListener('change', function(){
            loadMap(maps.find(function(m){ return m.slug === selectEl.value; }));
          });
        }
        loadMap(maps[0]);
      })
      .catch(function(err){
        console.error('[Mapa] Erro ao ler index.json', err);
      });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();