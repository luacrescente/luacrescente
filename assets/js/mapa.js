// Lua Crescente — Mapa de Pesca (BDOLytics)
(function(){
  'use strict';

  var WORLD = {
    x0: -2048500,
    x1: 1433648.75,
    y0: -2048500,
    y1: 1126373.75,
    levels: [0, 1, 2, 3, 4, 5],
    tileSize: 336,
    tileBase: '/assets/img/tiles-pesca/L',
  };

  var zones = [];
  var geometry = [];
  var hotspots = [];
  var zonesByKey = new Map();
  var geomByKey = new Map();

  var cv, ctx, wrap;
  var VW = 0, VH = 0, DPR = 1;
  var view = { u: 0.5, v: 0.5, k: 1 };
  var showZones = true, showHotspots = true, showLabels = true;
  var selected = null;

  var imgCache = new Map();

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }

  function colorFromKey(ck){
    var p = String(ck || '').split('-');
    if(p.length !== 3) return '#888';
    var b = parseInt(p[0], 10) || 0;
    var g = parseInt(p[1], 10) || 0;
    var r = parseInt(p[2], 10) || 0;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  // SEM inversão — convenção do BDO não é usada aqui porque o CDN
  // entrega os tiles já com Y na direção do canvas (Y cresce pra baixo).
  function coordToUV(x, y){
    return {
      u: (x - WORLD.x0) / (WORLD.x1 - WORLD.x0),
      v: (y - WORLD.y0) / (WORLD.y1 - WORLD.y0),
    };
  }

  function uvToScreen(u, v){
    return {
      x: (u - view.u) * view.k + VW / 2,
      y: (v - view.v) * view.k + VH / 2,
    };
  }

  function screenToUV(sx, sy){
    return {
      u: (sx - VW / 2) / view.k + view.u,
      v: (sy - VH / 2) / view.k + view.v,
    };
  }

  function fetchJSON(url){
    return fetch(url, { cache: 'no-store' }).then(function(r){
      if(!r.ok) throw new Error('HTTP ' + r.status + ' em ' + url);
      return r.json();
    });
  }

  function carregarDados(){
    return Promise.all([
      fetchJSON('/assets/data/pesca/mapfishing-zones.json'),
      fetchJSON('/assets/data/pesca/fishing-geometry.json'),
      fetchJSON('/assets/data/pesca/fishing-hotspots.json'),
    ]).then(function(arr){
      zones = arr[0].result.data || [];
      geometry = arr[1].result.data || [];
      hotspots = arr[2].result.data || [];

      zones.forEach(function(z){ if(z.colorKey) zonesByKey.set(z.colorKey, z); });
      geometry.forEach(function(g){ if(g.colorKey) geomByKey.set(g.colorKey, g); });

      console.log('[Pesca] Carregado:',
        zones.length, 'zonas,',
        geometry.length, 'geometrias,',
        hotspots.length, 'hotspots.');
    });
  }

  function pickLevel(){
    var ideal = Math.round(Math.log2(view.k / WORLD.tileSize));
    ideal = Math.max(WORLD.levels[0],
             Math.min(WORLD.levels[WORLD.levels.length - 1], ideal));
    return ideal;
  }

  function tileURL(lvl, tx, ty){
    return WORLD.tileBase + lvl + '/' + tx + '_' + ty + '.webp?v=1';
  }

  function getTile(lvl, tx, ty){
    var key = lvl + '/' + tx + '/' + ty;
    var im = imgCache.get(key);
    if(im) return im;
    im = new Image();
    im.onload = function(){ draw(); };
    im.onerror = function(){ imgCache.set(key, null); };
    im.src = tileURL(lvl, tx, ty);
    imgCache.set(key, im);
    return im;
  }

  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    VW = wrap.clientWidth;
    VH = wrap.clientHeight;
    cv.width = VW * DPR;
    cv.height = VH * DPR;
    cv.style.width = VW + 'px';
    cv.style.height = VH + 'px';
    draw();
  }

  function draw(){
    if(!ctx) return;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = '#0a0d10';
    ctx.fillRect(0, 0, VW, VH);

    if(!zones.length && !hotspots.length) return;

    desenharTiles();
    if(showZones) desenharZonas();
    if(showHotspots) desenharHotspots();
    if(showLabels) desenharLabels();
  }

  function desenharTiles(){
    var lvl = pickLevel();
    var n = Math.pow(2, lvl);
    var maxIndex = n - 1;
    var tileSpan = 1 / n;

    var uvTL = screenToUV(0, 0);
    var uvBR = screenToUV(VW, VH);
    var tx0 = Math.max(0, Math.floor(uvTL.u / tileSpan) - 1);
    var ty0 = Math.max(0, Math.floor(uvTL.v / tileSpan) - 1);
    var tx1 = Math.min(maxIndex, Math.ceil(uvBR.u / tileSpan) + 1);
    var ty1 = Math.min(maxIndex, Math.ceil(uvBR.v / tileSpan) + 1);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    for(var ty = ty0; ty <= ty1; ty++){
      // Sem inversão — tile (0,0) do CDN fica no topo.
      var tileV = ty * tileSpan;
      for(var tx = tx0; tx <= tx1; tx++){
        var im = getTile(lvl, tx, ty);
        if(!im || !im.complete || !im.naturalWidth) continue;
        var p = uvToScreen(tx * tileSpan, tileV);
        var nextP = uvToScreen((tx+1) * tileSpan, tileV + tileSpan);
        var w = nextP.x - p.x;
        var h = nextP.y - p.y;
        ctx.drawImage(im, p.x, p.y, w + 1, h + 1);
      }
    }
  }

  function desenharZonas(){
    geometry.forEach(function(g){
      var cor = colorFromKey(g.colorKey);
      var rgb = cor.match(/\d+/g);
      if(!rgb) return;
      var fill = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',.42)';
      var stroke = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',.85)';

      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;

      g.polygons.forEach(function(poly){
        poly.forEach(function(ring){
          if(ring.length < 3) return;
          ctx.beginPath();
          var first = true;
          ring.forEach(function(pt){
            var uv = coordToUV(pt[0], pt[1]);
            var sc = uvToScreen(uv.u, uv.v);
            if(first){ ctx.moveTo(sc.x, sc.y); first = false; }
            else { ctx.lineTo(sc.x, sc.y); }
          });
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
      });

      if(selected && selected.kind === 'zone' && selected.ref.colorKey === g.colorKey){
        ctx.save();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 10;
        g.polygons.forEach(function(poly){
          poly.forEach(function(ring){
            if(ring.length < 3) return;
            ctx.beginPath();
            var first = true;
            ring.forEach(function(pt){
              var uv = coordToUV(pt[0], pt[1]);
              var sc = uvToScreen(uv.u, uv.v);
              if(first){ ctx.moveTo(sc.x, sc.y); first = false; }
              else { ctx.lineTo(sc.x, sc.y); }
            });
            ctx.closePath();
            ctx.stroke();
          });
        });
        ctx.restore();
      }
    });
  }

  function desenharHotspots(){
    var R = Math.max(2.5, Math.min(5, view.k * 0.006));
    hotspots.forEach(function(h){
      var a = h.startCoordinates || h.endCoordinates;
      var b = h.endCoordinates || h.startCoordinates;
      if(!a) return;
      var uvA = coordToUV(a[0], a[1]);
      var sa = uvToScreen(uvA.u, uvA.v);
      if(sa.x < -50 || sa.y < -50 || sa.x > VW + 50 || sa.y > VH + 50) return;

      var isSel = selected && selected.kind === 'hotspot' && selected.ref === h;

      if(b && (b[0] !== a[0] || b[1] !== a[1])){
        var uvB = coordToUV(b[0], b[1]);
        var sb = uvToScreen(uvB.u, uvB.v);
        var dx = sb.x - sa.x, dy = sb.y - sa.y;
        if(dx * dx + dy * dy < 40000){
          ctx.strokeStyle = isSel ? '#fff' : 'rgba(255,181,71,.85)';
          ctx.lineWidth = isSel ? 3 : 2;
          ctx.beginPath();
          ctx.moveTo(sa.x, sa.y);
          ctx.lineTo(sb.x, sb.y);
          ctx.stroke();
        }
      }

      ctx.fillStyle = isSel ? '#fff' : '#ffb547';
      ctx.strokeStyle = 'rgba(11,15,20,.9)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(sa.x, sa.y, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  function desenharLabels(){
    if(view.k < 800) return;
    ctx.font = '600 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(11,15,20,.85)';
    ctx.fillStyle = '#ffe9a3';

    zones.forEach(function(z){
      var g = geomByKey.get(z.colorKey);
      if(!g || !g.centroid) return;
      var uv = coordToUV(g.centroid[0], g.centroid[1]);
      var sc = uvToScreen(uv.u, uv.v);
      if(sc.x < 20 || sc.y < 20 || sc.x > VW - 20 || sc.y > VH - 20) return;
      var nome = z.name || '';
      if(!nome) return;
      if(nome.length > 30) nome = nome.slice(0, 28) + '…';
      ctx.strokeText(nome, sc.x, sc.y);
      ctx.fillText(nome, sc.x, sc.y);
    });
  }

  function pontoEmPoligono(px, py, ring){
    var inside = false;
    for(var i = 0, j = ring.length - 1; i < ring.length; j = i++){
      var xi = ring[i][0], yi = ring[i][1];
      var xj = ring[j][0], yj = ring[j][1];
      var intersect = ((yi > py) !== (yj > py)) &&
                      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
      if(intersect) inside = !inside;
    }
    return inside;
  }

  function encontrarZonaEm(gameX, gameY){
    for(var i = 0; i < geometry.length; i++){
      var g = geometry[i];
      for(var p = 0; p < g.polygons.length; p++){
        for(var r = 0; r < g.polygons[p].length; r++){
          if(pontoEmPoligono(gameX, gameY, g.polygons[p][r])){
            return g;
          }
        }
      }
    }
    return null;
  }

  function encontrarHotspotProximo(sx, sy, R){
    R = R || 18;
    var best = null, bd = R * R;
    hotspots.forEach(function(h){
      var a = h.startCoordinates || h.endCoordinates;
      var b = h.endCoordinates || h.startCoordinates;
      if(!a) return;
      var uvA = coordToUV(a[0], a[1]);
      var sa = uvToScreen(uvA.u, uvA.v);
      var pts = [sa];
      if(b && (b[0] !== a[0] || b[1] !== a[1])){
        var uvB = coordToUV(b[0], b[1]);
        var sb = uvToScreen(uvB.u, uvB.v);
        var dx = sb.x - sa.x, dy = sb.y - sa.y;
        if(dx * dx + dy * dy < 40000) pts.push(sb);
      }
      pts.forEach(function(p){
        var dx = p.x - sx, dy = p.y - sy;
        var d = dx * dx + dy * dy;
        if(d < bd){ bd = d; best = h; }
      });
    });
    return best;
  }

  function gradeLabel(g){
    if(g === 1) return { txt: 'Comum', cls: 'gr-1' };
    if(g === 2) return { txt: 'Grande', cls: 'gr-2' };
    if(g === 3) return { txt: 'Raro', cls: 'gr-3' };
    if(g === 4) return { txt: 'Lendário', cls: 'gr-4' };
    return { txt: '?', cls: 'gr-1' };
  }

  function renderFishList(list){
    if(!list || !list.length) return '';
    return '<div class="pesca-fish-list">' + list.map(function(f){
      var gr = gradeLabel(f.grade);
      var pct = '';
      if(typeof f.share === 'number' && f.share > 0 && f.share < 1){
        pct = (f.share * 100).toFixed(2) + '%';
      } else if(f.share === 1){
        pct = '100%';
      }
      var icon = f.icon ? ('<img src="' + esc(f.icon) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">') : '';
      return '<div class="pesca-fish">' +
        icon +
        '<span class="nm">' + esc(f.name || '?') + '</span>' +
        '<span class="gr ' + gr.cls + '">' + gr.txt + '</span>' +
        (pct ? '<span class="pc">' + pct + '</span>' : '') +
      '</div>';
    }).join('') + '</div>';
  }

  function selecionarZona(g){
    selected = { kind: 'zone', ref: g };
    var z = zonesByKey.get(g.colorKey);
    var el = document.getElementById('pesca-sel');
    var tEl = document.getElementById('pesca-sel-t');
    var sEl = document.getElementById('pesca-sel-s');
    var cEl = document.getElementById('pesca-sel-content');

    tEl.textContent = z ? (z.name || '(sem nome)') : '(zona sem dados)';
    sEl.textContent = g.colorKey ? ('colorKey: ' + g.colorKey) : '';

    if(!z){
      cEl.innerHTML = '<div style="color:#9b968a;font-size:12px;">Sem dados de peixe pra essa zona.</div>';
    } else {
      var html = '';
      if(z.rareDrops && z.rareDrops.length){
        html += '<div><div class="pesca-group-title">Peixes raros</div>' + renderFishList(z.rareDrops) + '</div>';
      }
      if(z.bigDrops && z.bigDrops.length){
        html += '<div><div class="pesca-group-title">Peixes grandes</div>' + renderFishList(z.bigDrops) + '</div>';
      }
      if(z.generalDrops && z.generalDrops.length){
        html += '<div><div class="pesca-group-title">Peixes comuns</div>' + renderFishList(z.generalDrops) + '</div>';
      }
      if(z.priceDrops && z.priceDrops.length){
        html += '<div><div class="pesca-group-title">Peixes de preço</div>' + renderFishList(z.priceDrops) + '</div>';
      }
      if(z.treasureDrops && z.treasureDrops.length){
        html += '<div><div class="pesca-group-title">Tesouro</div>' + renderFishList(z.treasureDrops) + '</div>';
      }
      cEl.innerHTML = html || '<div style="color:#9b968a;font-size:12px;">Sem peixes cadastrados.</div>';
    }

    el.style.display = 'block';
    draw();
  }

  function selecionarHotspot(h){
    selected = { kind: 'hotspot', ref: h };
    var el = document.getElementById('pesca-sel');
    var tEl = document.getElementById('pesca-sel-t');
    var sEl = document.getElementById('pesca-sel-s');
    var cEl = document.getElementById('pesca-sel-content');

    tEl.textContent = h.name || '(hotspot)';
    sEl.textContent = 'Hotspot';

    var a = h.startCoordinates || [];
    var minW = h.minWaitTime ? (h.minWaitTime / 1000).toFixed(0) + 's' : '—';
    var maxW = h.maxWaitTime ? (h.maxWaitTime / 1000).toFixed(0) + 's' : '—';

    var html = '<dl class="pesca-hotspot-info">' +
      '<dt>Coordenadas</dt><dd>' + (a[0] ? Math.round(a[0]) + ', ' + Math.round(a[1]) : '—') + '</dd>' +
      '<dt>Nível mín.</dt><dd>' + (h.availableFishingLevel != null ? h.availableFishingLevel : '—') + '</dd>' +
      '<dt>Observável a partir de</dt><dd>' + (h.observableFishingLevel != null ? h.observableFishingLevel : '—') + '</dd>' +
      '<dt>Tempo de espera</dt><dd>' + minW + ' — ' + maxW + '</dd>' +
      '<dt>Peixes por vez</dt><dd>' + (h.minFishCount || '?') + ' — ' + (h.maxFishCount || '?') + '</dd>' +
    '</dl>';

    if(h.itemsObtainedFromHotspot && h.itemsObtainedFromHotspot.length){
      html += '<div><div class="pesca-group-title">Peixes desse hotspot</div>' + renderFishList(h.itemsObtainedFromHotspot) + '</div>';
    }

    cEl.innerHTML = html;
    el.style.display = 'block';
    draw();
  }

  function fecharPainel(){
    selected = null;
    document.getElementById('pesca-sel').style.display = 'none';
    draw();
  }

  function initInteracao(){
    var drag = null;

    cv.addEventListener('pointerdown', function(e){
      drag = { clientX: e.clientX, clientY: e.clientY, u: view.u, v: view.v, moved: false };
      try { cv.setPointerCapture(e.pointerId); } catch(_) {}
      cv.classList.add('drag');
    });

    cv.addEventListener('pointermove', function(e){
      if(drag){
        var dx = e.clientX - drag.clientX;
        var dy = e.clientY - drag.clientY;
        if(Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
        view.u = drag.u - dx / view.k;
        view.v = drag.v - dy / view.k;
        clampView();
        draw();
      } else {
        hover(e);
      }
    });

    cv.addEventListener('pointerup', function(e){
      if(drag && !drag.moved) click(e);
      drag = null;
      cv.classList.remove('drag');
    });

    cv.addEventListener('pointercancel', function(){
      drag = null;
      cv.classList.remove('drag');
    });

    cv.addEventListener('wheel', function(e){
      e.preventDefault();
      var rect = cv.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;
      var uvBefore = screenToUV(mx, my);
      var factor = Math.pow(1.0016, -e.deltaY);
      var kMin = Math.min(VW, VH) * 0.9;
      var kMax = 40000;
      view.k = Math.max(kMin, Math.min(kMax, view.k * factor));
      view.u = uvBefore.u - (mx - VW / 2) / view.k;
      view.v = uvBefore.v - (my - VH / 2) / view.k;
      clampView();
      draw();
    }, { passive: false });
  }

  function clampView(){
    var kMin = Math.min(VW, VH) * 0.9;
    if(view.k < kMin) view.k = kMin;
    if(view.k <= kMin * 1.02){
      view.u = 0.5;
      view.v = 0.5;
      return;
    }
    var margin = 0.25;
    view.u = Math.max(-margin, Math.min(1 + margin, view.u));
    view.v = Math.max(-margin, Math.min(1 + margin, view.v));
  }

  function hover(e){
    var rect = cv.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;
    var uv = screenToUV(mx, my);

    var gx = WORLD.x0 + uv.u * (WORLD.x1 - WORLD.x0);
    var gy = WORLD.y0 + uv.v * (WORLD.y1 - WORLD.y0);

    var tipEl = document.getElementById('pesca-tip');

    var h = encontrarHotspotProximo(mx, my, 14);
    if(h && showHotspots){
      tipEl.innerHTML = '<div><b>' + esc(h.name) + '</b></div><div class="k">Hotspot</div>';
      tipEl.style.display = 'block';
      tipEl.style.left = Math.min(mx + 14, VW - tipEl.offsetWidth - 8) + 'px';
      tipEl.style.top = Math.min(my + 16, VH - tipEl.offsetHeight - 8) + 'px';
      cv.style.cursor = 'pointer';
      return;
    }

    if(showZones){
      var g = encontrarZonaEm(gx, gy);
      if(g){
        var z = zonesByKey.get(g.colorKey);
        tipEl.innerHTML = '<div><b>' + esc(z ? z.name : '(zona)') + '</b></div><div class="k">Zona de pesca</div>';
        tipEl.style.display = 'block';
        tipEl.style.left = Math.min(mx + 14, VW - tipEl.offsetWidth - 8) + 'px';
        tipEl.style.top = Math.min(my + 16, VH - tipEl.offsetHeight - 8) + 'px';
        cv.style.cursor = 'pointer';
        return;
      }
    }

    tipEl.style.display = 'none';
    cv.style.cursor = '';
  }

  function click(e){
    var rect = cv.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;

    var h = encontrarHotspotProximo(mx, my, 18);
    if(h && showHotspots){ selecionarHotspot(h); return; }

    var uv = screenToUV(mx, my);
    var gx = WORLD.x0 + uv.u * (WORLD.x1 - WORLD.x0);
    var gy = WORLD.y0 + uv.v * (WORLD.y1 - WORLD.y0);
    var g = encontrarZonaEm(gx, gy);
    if(g){ selecionarZona(g); return; }

    fecharPainel();
  }

  function normalizar(s){
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function montarIndiceBusca(){
    var itens = [];
    zones.forEach(function(z){
      itens.push({ tipo: 'zona', nome: z.name, sub: 'Zona de pesca', cor: colorFromKey(z.colorKey), ref: z });
    });
    zones.forEach(function(z){
      ['rareDrops','bigDrops','generalDrops','priceDrops','treasureDrops'].forEach(function(cat){
        (z[cat] || []).forEach(function(f){
          itens.push({
            tipo: 'peixe',
            nome: f.name,
            sub: 'em ' + (z.name || '?'),
            icon: f.icon,
            cor: colorFromKey(z.colorKey),
            ref: z,
            _peixe: f,
          });
        });
      });
    });
    hotspots.forEach(function(h){
      itens.push({ tipo: 'hotspot', nome: h.name, sub: 'Hotspot', cor: '#ffb547', ref: h });
    });
    return itens;
  }

  var buscaIndex = null;

  function setupBusca(){
    buscaIndex = montarIndiceBusca();
    var input = document.getElementById('pesca-q');
    var hitsEl = document.getElementById('pesca-hits');

    function fechar(){ hitsEl.classList.add('hidden'); }

    function render(q){
      if(!q){ fechar(); return; }
      var nq = normalizar(q);
      var out = [];
      for(var i = 0; i < buscaIndex.length && out.length < 30; i++){
        var it = buscaIndex[i];
        if(normalizar(it.nome).indexOf(nq) !== -1) out.push(it);
      }

      var html = '<div class="hits-h"><span>Resultados</span><b>' + out.length + '</b><span class="hits-x">✕</span></div>';

      if(!out.length){
        html += '<div class="none">Nada encontrado</div>';
      } else {
        out.slice(0, 20).forEach(function(it){
          var iconHtml = it.icon
            ? '<img class="ic" src="' + esc(it.icon) + '" alt="" onerror="this.style.display=\'none\'">'
            : '<span class="ic" style="background:' + esc(it.cor) + ';"></span>';
          html += '<div class="it" data-tipo="' + it.tipo + '">' +
            iconHtml +
            '<span class="meta"><span class="nm">' + esc(it.nome) + '</span>' +
            '<span class="sub">' + esc(it.sub || '') + '</span></span>' +
          '</div>';
        });
      }

      hitsEl.innerHTML = html;
      hitsEl.classList.remove('hidden');
      hitsEl.querySelector('.hits-x').onclick = function(){
        input.value = ''; fechar(); input.focus();
      };
      hitsEl.querySelectorAll('.it').forEach(function(node, i){
        node.onclick = function(){
          var it = out[i];
          if(it.tipo === 'zona' || it.tipo === 'peixe'){
            var g = geomByKey.get(it.ref.colorKey);
            if(g && g.centroid){
              focar(g.centroid[0], g.centroid[1], 3);
              selecionarZona(g);
            }
          } else if(it.tipo === 'hotspot'){
            var h = it.ref;
            var a = h.startCoordinates;
            if(a){
              focar(a[0], a[1], 4);
              selecionarHotspot(h);
            }
          }
          fechar();
        };
      });
    }

    input.addEventListener('input', function(){ render(input.value.trim()); });
    input.addEventListener('focus', function(){ if(input.value.trim()) render(input.value.trim()); });
    document.addEventListener('click', function(e){
      var w = document.querySelector('.pesca-search-wrap');
      if(w && !w.contains(e.target)) fechar();
    });
    input.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){ input.value = ''; fechar(); }
    });
  }

  function focar(gameX, gameY, zoom){
    var uv = coordToUV(gameX, gameY);
    view.u = uv.u;
    view.v = uv.v;
    var target = Math.min(VW, VH) * (zoom || 3);
    view.k = Math.max(Math.min(VW, VH) * 0.9, target * 3);
    clampView();
    draw();
  }

  function init(){
    wrap = document.getElementById('pesca-wrap');
    cv = document.getElementById('pesca-canvas');
    if(!wrap || !cv) return;
    ctx = cv.getContext('2d');

    resize();
    window.addEventListener('resize', resize);

    initInteracao();

    document.getElementById('pesca-ui-head').addEventListener('click', function(){
      var ui = document.getElementById('pesca-ui');
      var collapsed = ui.classList.toggle('collapsed');
      document.getElementById('pesca-caret').textContent = collapsed ? 'Expandir' : 'Recolher';
    });

    document.getElementById('pesca-toggle-zones').addEventListener('change', function(e){
      showZones = e.target.checked; draw();
    });
    document.getElementById('pesca-toggle-hotspots').addEventListener('change', function(e){
      showHotspots = e.target.checked; draw();
    });
    document.getElementById('pesca-toggle-labels').addEventListener('change', function(e){
      showLabels = e.target.checked; draw();
    });

    document.getElementById('pesca-btn-fit').addEventListener('click', function(){
      view.k = Math.min(VW, VH) * 0.9;
      view.u = 0.5;
      view.v = 0.5;
      clampView();
      draw();
    });

    document.getElementById('pesca-sel-close').addEventListener('click', fecharPainel);

    document.getElementById('pesca-fullscreen').addEventListener('click', function(){
      wrap.classList.toggle('is-fullscreen');
      var isFs = wrap.classList.contains('is-fullscreen');
      document.body.style.overflow = isFs ? 'hidden' : '';
      var txt = this.querySelector('.pesca-fs-text');
      if(txt) txt.textContent = isFs ? 'Sair' : 'Tela cheia';
      setTimeout(resize, 60);
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && wrap.classList.contains('is-fullscreen')){
        wrap.classList.remove('is-fullscreen');
        document.body.style.overflow = '';
        var txt = document.querySelector('.pesca-fs-text');
        if(txt) txt.textContent = 'Tela cheia';
        setTimeout(resize, 60);
      }
    });

    carregarDados().then(function(){
      view.k = Math.min(VW, VH) * 0.9;
      view.u = 0.5;
      view.v = 0.5;
      clampView();
      draw();
      setupBusca();
    }).catch(function(err){
      console.error('[Pesca] Falha ao carregar:', err);
      var t = document.getElementById('pesca-title');
      if(t) t.textContent = 'Erro ao carregar dados';
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();