// Lua Crescente — Mapa de Pesca (BDOLytics) — v17 FINAL
(function(){
  'use strict';

  var CDN_BASE  = 'https://cdn.questlog.gg';
  var GAME_SLUG = 'black-desert';

  function urlIcone(ic){
    if(!ic) return null;
    if(/^https?:\/\//i.test(ic)) return ic;
    var p = String(ic).replace(/^\/+/, '');
    return CDN_BASE + '/' + GAME_SLUG + '/' + p;
  }

  var HALF_GAME = 1638700;
  var TILE_PX   = 336;
  var PROJ_SCALE  = 256 / (HALF_GAME * 2 * TILE_PX);
  var PROJ_OFFSET = 0.5;
  var Y_SIGN = 1;

  var WORLD = {
    x0: -PROJ_OFFSET / PROJ_SCALE,
    x1:  (1 - PROJ_OFFSET) / PROJ_SCALE,
    y0: -PROJ_OFFSET / PROJ_SCALE,
    y1:  (1 - PROJ_OFFSET) / PROJ_SCALE,
    levels: [0,1,2,3,4,5,6,7],
    tileSize: TILE_PX,
    tileBase: '/assets/img/tiles-pesca/L',
  };

  var CATEGORIAS = [
    { key:'priceDrops',    rate:'priceDropRate',    lbl:'Peixe Troféu', cor:'#c084fc' },
    { key:'rareDrops',     rate:'rareDropRate',     lbl:'Peixe Raro',   cor:'#0391c4' },
    { key:'bigDrops',      rate:'bigDropRate',      lbl:'Peixe Grande', cor:'#f6c232' },
    { key:'generalDrops',  rate:'generalDropRate',  lbl:'Peixe Comum',  cor:'#5ff369' },
    { key:'treasureDrops', rate:'treasureDropRate', lbl:'Tesouro',      cor:'#d36200' },
  ];

  var SUFIXOS_PT = [
    [/\s*-\s*Depth\s+(\d+)$/i,   ' - Profundidade $1'],
    [/\s*-\s*Coast$/i,            ' - Costa'],
    [/\s*-\s*Terrain Default$/i,  ' - Terreno Padrão'],
    [/\s*-\s*Default$/i,          ' - Padrão'],
    [/\s*-\s*Event Spot$/i,       ' - Ponto de Evento'],
    [/\s*-\s*Downstream$/i,       ' - Jusante'],
    [/\s*-\s*Upstream$/i,         ' - Montante'],
    [/\s*-\s*Dock$/i,             ' - Doca'],
    [/\s*-\s*Docks$/i,            ' - Docas'],
    [/\s*-\s*Beach$/i,            ' - Praia'],
    [/\s*-\s*Offshore$/i,         ' - Costa Afora'],
    [/\s*-\s*North$/i,            ' - Norte'],
    [/\s*-\s*South$/i,            ' - Sul'],
    [/\s*-\s*East$/i,             ' - Leste'],
    [/\s*-\s*West$/i,             ' - Oeste'],
    [/\s*-\s*Middle$/i,           ' - Meio'],
  ];
  var SUFIXOS_ES = [
    [/\s*-\s*Depth\s+(\d+)$/i,   ' - Profundidad $1'],
    [/\s*-\s*Coast$/i,            ' - Costa'],
    [/\s*-\s*Terrain Default$/i,  ' - Terreno Predeterminado'],
    [/\s*-\s*Default$/i,          ' - Predeterminado'],
    [/\s*-\s*Event Spot$/i,       ' - Punto de Evento'],
    [/\s*-\s*Downstream$/i,       ' - Aguas Abajo'],
    [/\s*-\s*Upstream$/i,         ' - Aguas Arriba'],
    [/\s*-\s*Dock$/i,             ' - Muelle'],
    [/\s*-\s*Docks$/i,            ' - Muelles'],
    [/\s*-\s*Beach$/i,            ' - Playa'],
    [/\s*-\s*Offshore$/i,         ' - Costa Afuera'],
    [/\s*-\s*North$/i,            ' - Norte'],
    [/\s*-\s*South$/i,            ' - Sur'],
    [/\s*-\s*East$/i,             ' - Este'],
    [/\s*-\s*West$/i,             ' - Oeste'],
    [/\s*-\s*Middle$/i,           ' - Medio'],
  ];

  var IDIOMA = (function(){
    var l = (document.documentElement.getAttribute('lang') || 'pt').toLowerCase();
    if(l.indexOf('es') === 0) return 'es';
    return 'pt';
  })();

  var I18N = { pt: {}, es: {} };

  function traduzirZona(nome){
    if(!nome) return nome;
    var dict = I18N[IDIOMA] || {};
    var sufixos = (IDIOMA === 'es') ? SUFIXOS_ES : SUFIXOS_PT;
    if(dict[nome]) return dict[nome];
    for(var i=0; i<sufixos.length; i++){
      var re = sufixos[i][0];
      var m = nome.match(re);
      if(m){
        var base = nome.replace(re, '');
        var baseT = dict[base];
        if(baseT){
          return baseT + sufixos[i][1].replace(/\$(\d+)/g, function(_, n){
            return m[parseInt(n,10)];
          });
        }
      }
    }
    return nome;
  }

  function normalizaRate(v){
    if(typeof v !== 'number' || v <= 0) return 0;
    return v > 1 ? v : v * 100;
  }

  var zones = [], geometry = [], hotspots = [];
  var zonesByKey = new Map(), geomByKey = new Map();

  var cv, ctx, wrap;
  var VW = 0, VH = 0, DPR = 1;
  var view = { u: 0.5, v: 0.5, k: 336 };
  var showZones = true, showHotspots = true, showLabels = true;
  var selected = null;

  var imgCache = new Map();

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }

  function corCSS(ck, alpha){
    var p = String(ck || '').split('-');
    if(p.length !== 3) return 'rgba(136,136,136,' + (alpha ?? 1) + ')';
    var b = parseInt(p[0],10) || 0;
    var g = parseInt(p[1],10) || 0;
    var r = parseInt(p[2],10) || 0;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha ?? 1) + ')';
  }

  function coordToUV(x, y){
    return { u: x * PROJ_SCALE + PROJ_OFFSET, v: Y_SIGN * y * PROJ_SCALE + PROJ_OFFSET };
  }
  function uvToGame(u, v){
    return { x: (u - PROJ_OFFSET) / PROJ_SCALE, y: (v - PROJ_OFFSET) / (PROJ_SCALE * Y_SIGN) };
  }
  function uvToScreen(u, v){
    return { x: (u - view.u) * view.k + VW/2, y: (v - view.v) * view.k + VH/2 };
  }
  function screenToUV(sx, sy){
    return { u: (sx - VW/2) / view.k + view.u, v: (sy - VH/2) / view.k + view.v };
  }

  function fetchJSON(url){
    return fetch(url, { cache:'no-store' }).then(function(r){
      if(!r.ok) throw new Error('HTTP ' + r.status + ' em ' + url);
      return r.json();
    });
  }

  function carregarDados(){
    var i18nPromise = fetchJSON('/assets/data/pesca/zonas-i18n.json')
      .catch(function(){ console.warn('[Pesca] zonas-i18n.json não encontrado — nomes em EN.'); return null; });

    return Promise.all([
      fetchJSON('/assets/data/pesca/mapfishing-zones.json'),
      fetchJSON('/assets/data/pesca/fishing-geometry.json'),
      fetchJSON('/assets/data/pesca/fishing-hotspots.json'),
      i18nPromise,
    ]).then(function(arr){
      zones    = arr[0].result.data || [];
      geometry = arr[1].result.data || [];
      hotspots = arr[2].result.data || [];
      if(arr[3]) I18N = arr[3];

      var foraKeys = {};
      zones.forEach(function(z){
        if(/out-?of-?bounds/i.test(z.name || '')) foraKeys[z.colorKey] = true;
      });
      zones = zones.filter(function(z){ return !foraKeys[z.colorKey]; });
      geometry = geometry.filter(function(g){ return !foraKeys[g.colorKey]; });

      var LIMITE = HALF_GAME;
      hotspots = hotspots.filter(function(h){
        var a = h.startCoordinates || h.endCoordinates;
        var b = h.endCoordinates || h.startCoordinates;
        if(!a) return false;
        if(Math.abs(a[0]) > LIMITE || Math.abs(a[1]) > LIMITE) return false;
        if(b && (Math.abs(b[0]) > LIMITE || Math.abs(b[1]) > LIMITE)) return false;
        return true;
      });
      geometry = geometry.filter(function(g){
        if(!g.centroid) return true;
        return Math.abs(g.centroid[0]) <= LIMITE && Math.abs(g.centroid[1]) <= LIMITE;
      });

      zones.forEach(function(z){ if(z.colorKey) zonesByKey.set(z.colorKey, z); });
      geometry.forEach(function(g){ if(g.colorKey) geomByKey.set(g.colorKey, g); });

      console.log('[Pesca] Carregado:', zones.length, 'zonas,',
        geometry.length, 'geometrias,', hotspots.length, 'hotspots, i18n', IDIOMA);
    });
  }

  function pickLevel(){
    var ideal = Math.round(Math.log2(view.k / WORLD.tileSize));
    return Math.max(WORLD.levels[0], Math.min(WORLD.levels[WORLD.levels.length-1], ideal));
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
    VW = wrap.clientWidth; VH = wrap.clientHeight;
    cv.width = VW*DPR; cv.height = VH*DPR;
    cv.style.width = VW + 'px'; cv.style.height = VH + 'px';
    draw();
  }

  function draw(){
    if(!ctx) return;
    ctx.setTransform(DPR,0,0,DPR,0,0);
    ctx.fillStyle = '#0a0d10';
    ctx.fillRect(0,0,VW,VH);
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
    var tileSpan = 1/n;
    var uvTL = screenToUV(0,0);
    var uvBR = screenToUV(VW,VH);
    var tx0 = Math.max(0, Math.floor(uvTL.u/tileSpan)-1);
    var ty0 = Math.max(0, Math.floor(uvTL.v/tileSpan)-1);
    var tx1 = Math.min(maxIndex, Math.ceil(uvBR.u/tileSpan)+1);
    var ty1 = Math.min(maxIndex, Math.ceil(uvBR.v/tileSpan)+1);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    for(var ty = ty0; ty <= ty1; ty++){
      var tileV = ty * tileSpan;
      for(var tx = tx0; tx <= tx1; tx++){
        var im = getTile(lvl, tx, ty);
        if(!im || !im.complete || !im.naturalWidth) continue;
        var p = uvToScreen(tx*tileSpan, tileV);
        var nextP = uvToScreen((tx+1)*tileSpan, tileV + tileSpan);
        ctx.drawImage(im, p.x, p.y, (nextP.x-p.x)+1, (nextP.y-p.y)+1);
      }
    }
  }

  function desenharZonas(){
    var BORDA     = 'rgba(255,118,255,.90)';
    var BORDA_SEL = 'rgba(255,118,255,1)';
    geometry.forEach(function(g){
      var isSel = selected && selected.kind === 'zone' && selected.ref.colorKey === g.colorKey;
      if(isSel){
        ctx.fillStyle   = corCSS(g.colorKey, 0.85);
        ctx.strokeStyle = BORDA_SEL;
        ctx.lineWidth   = 2.5;
        ctx.shadowColor = 'rgba(255,118,255,.75)';
        ctx.shadowBlur  = 14;
      } else {
        ctx.fillStyle   = corCSS(g.colorKey, 0.75);
        ctx.strokeStyle = BORDA;
        ctx.lineWidth   = 1;
        ctx.shadowBlur  = 0;
      }
      g.polygons.forEach(function(poly){
        poly.forEach(function(ring){
          if(ring.length < 3) return;
          ctx.beginPath();
          var first = true;
          ring.forEach(function(pt){
            var uv = coordToUV(pt[0], pt[1]);
            var sc = uvToScreen(uv.u, uv.v);
            if(first){ ctx.moveTo(sc.x,sc.y); first = false; }
            else { ctx.lineTo(sc.x,sc.y); }
          });
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
      });
      ctx.shadowBlur = 0;
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
      if(sa.x < -50 || sa.y < -50 || sa.x > VW+50 || sa.y > VH+50) return;
      var isSel = selected && selected.kind === 'hotspot' && selected.ref === h;
      if(b && (b[0] !== a[0] || b[1] !== a[1])){
        var uvB = coordToUV(b[0], b[1]);
        var sb = uvToScreen(uvB.u, uvB.v);
        var dx = sb.x-sa.x, dy = sb.y-sa.y;
        if(dx*dx+dy*dy < 40000){
          ctx.strokeStyle = isSel ? '#fff' : 'rgba(255,118,255,.85)';
          ctx.lineWidth = isSel ? 3 : 2;
          ctx.beginPath(); ctx.moveTo(sa.x,sa.y); ctx.lineTo(sb.x,sb.y); ctx.stroke();
        }
      }
      ctx.fillStyle = isSel ? '#fff' : '#ff76ff';
      ctx.strokeStyle = 'rgba(11,15,20,.9)';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(sa.x, sa.y, R, 0, Math.PI*2);
      ctx.fill(); ctx.stroke();
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
      if(sc.x < 20 || sc.y < 20 || sc.x > VW-20 || sc.y > VH-20) return;
      var nome = traduzirZona(z.name || '');
      if(!nome) return;
      if(nome.length > 30) nome = nome.slice(0,28) + '…';
      ctx.strokeText(nome, sc.x, sc.y);
      ctx.fillText(nome, sc.x, sc.y);
    });
  }

  function pontoEmPoligono(px, py, ring){
    var inside = false;
    for(var i=0, j=ring.length-1; i<ring.length; j=i++){
      var xi = ring[i][0], yi = ring[i][1];
      var xj = ring[j][0], yj = ring[j][1];
      var inter = ((yi>py)!==(yj>py)) && (px < (xj-xi)*(py-yi)/(yj-yi)+xi);
      if(inter) inside = !inside;
    }
    return inside;
  }
  function encontrarZonaEm(gx, gy){
    for(var i=0; i<geometry.length; i++){
      var g = geometry[i];
      for(var p=0; p<g.polygons.length; p++)
        for(var r=0; r<g.polygons[p].length; r++)
          if(pontoEmPoligono(gx, gy, g.polygons[p][r])) return g;
    }
    return null;
  }
  function encontrarHotspotProximo(sx, sy, R){
    R = R || 18;
    var best = null, bd = R*R;
    hotspots.forEach(function(h){
      var a = h.startCoordinates || h.endCoordinates;
      var b = h.endCoordinates || h.startCoordinates;
      if(!a) return;
      var uvA = coordToUV(a[0], a[1]);
      var sa = uvToScreen(uvA.u, uvA.v);
      var pts = [sa];
      if(b && (b[0]!==a[0] || b[1]!==a[1])){
        var uvB = coordToUV(b[0], b[1]);
        var sb = uvToScreen(uvB.u, uvB.v);
        var dx = sb.x-sa.x, dy = sb.y-sa.y;
        if(dx*dx+dy*dy < 40000) pts.push(sb);
      }
      pts.forEach(function(p){
        var dx = p.x-sx, dy = p.y-sy;
        var d = dx*dx+dy*dy;
        if(d < bd){ bd = d; best = h; }
      });
    });
    return best;
  }

// ===== FIM DA PARTE 1 =====
  // ============================================================
  // Card de peixe — enriquecido via database.getItem
  // ============================================================
  var _fishRegistry = [];
  var _cardPeixeEl = null;
  var _cardCache = new Map();

  var GRADE_LBL = ['Comum','Incomum','Raro','Épico','Lendário','Mítico'];
  var GRADE_HEX = ['#d0d0d0','#5ff369','#0391c4','#f6c232','#d36200','#ff8b37'];

  function fmtNumero(n){
    if(typeof n !== 'number' || !isFinite(n)) return '—';
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  function fmtVidaUtil(min){
    if(typeof min !== 'number' || min <= 0) return null;
    if(min >= 2880){
      var s = min / 2880;
      return (s === Math.floor(s) ? s : s.toFixed(1).replace('.', ',')) + 's';
    }
    if(min >= 1440){
      var d = min / 1440;
      return (d === Math.floor(d) ? d : d.toFixed(1).replace('.', ',')) + 'd';
    }
    if(min >= 60){
      var h = min / 60;
      return (h === Math.floor(h) ? h : h.toFixed(1).replace('.', ',')) + 'h';
    }
    return min + 'min';
  }
  function fmtPeso(v){
    if(typeof v !== 'number' || v <= 0) return null;
    if(v === Math.floor(v)) return v + ' LT';
    return v.toFixed(2).replace('.', ',') + ' LT';
  }

  function fetchItemCompleto(id){
    if(!id) return Promise.resolve(null);
    if(_cardCache.has(id)) return Promise.resolve(_cardCache.get(id));
    var payload = JSON.stringify({ id: String(id), language: IDIOMA });
    var url = 'https://bdolytics.com/api/trpc/database.getItem?input=' + encodeURIComponent(payload);
    return fetch(url, { cache:'force-cache' })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(j){
        var d = j && j.result && j.result.data;
        if(d) _cardCache.set(id, d);
        return d;
      })
      .catch(function(){ return null; });
  }

  var CAT_I18N = {
    pt: { misc:'Diversos', item:'Item', consumables:'Consumíveis', 'item-parts':'Componentes', material:'Material' },
    es: { misc:'Varios',   item:'Objeto', consumables:'Consumibles', 'item-parts':'Componentes', material:'Material' }
  };

  function montarCardPeixe(f, completo){
    var grade = (typeof f.grade === 'number' && f.grade >= 0 && f.grade <= 5) ? f.grade : 0;
    var nome  = esc(f.name || '?');
    var url   = urlIcone(f.icon);
    var ic = url
      ? '<img class="fc-ic" src="' + esc(url) + '" alt="" onerror="this.style.display=\'none\'">'
      : '<span class="fc-ic"></span>';

    var html = '<div class="fc-head">' + ic +
      '<div><div class="fc-name" style="color:' + GRADE_HEX[grade] + '">' + nome + '</div>' +
      '<div class="fc-grade">' + GRADE_LBL[grade] + '</div></div>' +
    '</div>';

    var linhas = [];

             var peso = null;
    if(completo && typeof completo.weight === 'number' && completo.weight > 0) peso = completo.weight;
    else if(typeof f.weight === 'number' && f.weight > 0) peso = f.weight / 200000;
    if(peso != null && peso > 0){ var pStr = fmtPeso(peso); if(pStr) linhas.push(['Peso', pStr]); }

    if(completo && completo.expirationPeriod){
      var vu = fmtVidaUtil(completo.expirationPeriod);
      if(vu) linhas.push(['Vida Útil', vu]);
    }

    if(completo && typeof completo.buyPrice === 'number' && completo.buyPrice > 0){
      linhas.push(['Preço de Compra', fmtNumero(completo.buyPrice)]);
    }

    var catRaw = (completo && (completo.mainCategory || completo.subCategory))
              || f.mainCategory || f.subCategory;
    if(catRaw){
      var tabela = CAT_I18N[IDIOMA] || CAT_I18N.pt;
      var catTrad = tabela[catRaw] || catRaw;
      linhas.push(['Categoria', esc(catTrad)]);
    }

    if(linhas.length){
      html += '<dl>';
      linhas.forEach(function(l){ html += '<dt>' + l[0] + '</dt><dd>' + l[1] + '</dd>'; });
      html += '</dl>';
    }

    if(completo && completo.description){
      html += '<div class="fc-desc">' + completo.description + '</div>';
    }

    if(completo && completo.itemIsUsedInFishGuides && completo.itemIsUsedInFishGuides.length){
      html += '<div class="fc-guides-h">Guias de Peixes:</div>';
      completo.itemIsUsedInFishGuides.forEach(function(g){
        var gi = urlIcone(g.icon);
        var giHtml = gi
          ? '<img class="fc-guide-ic" src="' + esc(gi) + '" alt="" onerror="this.style.display=\'none\'">'
          : '<span class="fc-guide-ic"></span>';
        html += '<div class="fc-guide">' + giHtml + '<span>' + esc(g.name || '?') + '</span></div>';
      });
    }

    return html;
  }

  function getCardPeixe(){
    if(_cardPeixeEl) return _cardPeixeEl;
    _cardPeixeEl = document.createElement('div');
    _cardPeixeEl.className = 'pesca-fish-card';
    document.body.appendChild(_cardPeixeEl);
    return _cardPeixeEl;
  }

  function posicionarCardPeixe(x, y){
    if(!_cardPeixeEl) return;
    var w = _cardPeixeEl.offsetWidth, h = _cardPeixeEl.offsetHeight;
    var px = x + 18, py = y + 18;
    if(px + w > window.innerWidth - 12)  px = x - w - 18;
    if(py + h > window.innerHeight - 12) py = y - h - 18;
    _cardPeixeEl.style.left = Math.max(8, px) + 'px';
    _cardPeixeEl.style.top  = Math.max(8, py) + 'px';
  }

  function mostrarCardPeixe(f, x, y){
    var el = getCardPeixe();
    var grade = (typeof f.grade === 'number' && f.grade >= 0 && f.grade <= 5) ? f.grade : 0;
    el.className = 'pesca-fish-card gr-' + grade;
    el.innerHTML = montarCardPeixe(f, _cardCache.get(f.id) || null);
    el.style.display = 'block';
    posicionarCardPeixe(x, y);

    if(f.id && !_cardCache.has(f.id)){
      fetchItemCompleto(f.id).then(function(completo){
        if(!completo) return;
        if(_cardPeixeEl && _cardPeixeEl.style.display === 'block'){
          _cardPeixeEl.className = 'pesca-fish-card gr-' + grade;
          _cardPeixeEl.innerHTML = montarCardPeixe(f, completo);
        }
      });
    }
  }

  function esconderCardPeixe(){
    if(_cardPeixeEl) _cardPeixeEl.style.display = 'none';
  }

  function renderPeixeRow(f){
    var pct = '';
    if(typeof f.share === 'number' && f.share > 0 && f.share < 1)
      pct = (f.share * 100).toFixed(2) + '%';
    else if(f.share === 1) pct = '100%';
    else if(typeof f.share === 'number' && f.share > 1)
      pct = f.share.toFixed(2) + '%';
    var url = urlIcone(f.icon);
    var icon = url
      ? '<img src="' + esc(url) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">'
      : '<span class="pesca-ic-empty"></span>';
    var grade = (typeof f.grade === 'number' && f.grade >= 0 && f.grade <= 5) ? f.grade : 0;
    var gradeCls = 'gr-' + grade;
    var idx = _fishRegistry.length;
    _fishRegistry.push(f);
    return '<div class="pesca-fish" data-fish-idx="' + idx + '">' + icon +
      '<span class="nm ' + gradeCls + '">' + esc(f.name || '?') + '</span>' +
      '<span class="pc">' + (pct || '—') + '</span>' +
    '</div>';
  }
  function renderListaPeixes(titulo, list){
    if(!list || !list.length) return '';
    return '<div class="pesca-grupo">' +
      '<div class="pesca-grupo-h"><span>' + esc(titulo) + '</span></div>' +
      '<div class="pesca-fish-list">' + list.map(renderPeixeRow).join('') + '</div>' +
    '</div>';
  }

  function renderComposicao(z){
    var vals = [], tot = 0;
    CATEGORIAS.forEach(function(c){
      var arr = z[c.key] || [];
      if(!arr.length) return;
      var r = normalizaRate(z[c.rate]);
      if(r <= 0){
        arr.forEach(function(f){ if(typeof f.share === 'number') r += f.share; });
        r = normalizaRate(r);
      }
      if(r <= 0) return;
      vals.push({ lbl: c.lbl, cor: c.cor, v: r });
      tot += r;
    });
    if(tot <= 0) return '';
    var bar = '<div class="pesca-comp-bar">';
    vals.forEach(function(v){
      bar += '<span style="width:' + (v.v/tot*100).toFixed(2) + '%;background:' + v.cor + '"></span>';
    });
    bar += '</div>';
    var leg = '<div class="pesca-comp-leg">';
    vals.forEach(function(v){
      leg += '<span><i style="background:' + v.cor + '"></i>' +
        v.lbl + ' ' + (v.v/tot*100).toFixed(0) + '%</span>';
    });
    leg += '</div>';
    return '<div class="pesca-comp">' + bar + leg + '</div>';
  }

  function selecionarZona(g){
    selected = { kind:'zone', ref:g };
    var z = zonesByKey.get(g.colorKey);
    var el  = document.getElementById('pesca-sel');
    var tEl = document.getElementById('pesca-sel-t');
    var sEl = document.getElementById('pesca-sel-s');
    var cEl = document.getElementById('pesca-sel-content');
    if(tEl) tEl.textContent = z ? traduzirZona(z.name || '(sem nome)') : '(zona sem dados)';
    if(sEl) sEl.textContent = 'Zona de Pesca';
    if(!z){
      cEl.innerHTML = '<div class="pesca-empty">Sem dados de peixe pra essa zona.</div>';
      el.style.display = 'block'; draw(); return;
    }
    var cx = g.centroid ? Math.round(g.centroid[0]) : null;
    var cy = g.centroid ? Math.round(g.centroid[1]) : null;
    var minW = z.minWaitTime ? Math.round(z.minWaitTime/1000) : null;
    var maxW = z.maxWaitTime ? Math.round(z.maxWaitTime/1000) : null;
    var totalDrops = 0;
    CATEGORIAS.forEach(function(c){ totalDrops += (z[c.key] || []).length; });
    var html = '';
    html += '<div class="pesca-coord">' +
      '<span class="pesca-coord-pin">📍</span>' +
      '<span class="pesca-coord-val">' + (cx != null ? '[' + cx + ', ' + cy + ']' : '—') + '</span>' +
      '<button class="pesca-copy-bm" type="button">Copiar Bookmark</button>' +
    '</div>';
    if((minW != null && maxW != null) || totalDrops > 0){
      html += '<div class="pesca-info-cards">';
      if(minW != null && maxW != null){
        html += '<div class="pesca-info-card">' +
          '<div class="pesca-info-lbl">Tempo de Mordida</div>' +
          '<div class="pesca-info-val">' + minW + '-' + maxW + 's</div>' +
        '</div>';
      }
      if(totalDrops > 0){
        html += '<div class="pesca-info-card">' +
          '<div class="pesca-info-lbl">Possible Drops</div>' +
          '<div class="pesca-info-val">' + totalDrops + '</div>' +
        '</div>';
      }
      html += '</div>';
    }
    html += '<div class="pesca-what-label">O que você pesca aqui</div>';
    html += renderComposicao(z);
    html += '<div class="pesca-tabs">' +
      '<button class="pesca-tab active" data-tab="chance">Chance</button>' +
      '<button class="pesca-tab" data-tab="weight-pct">Weight %</button>' +
      '<button class="pesca-tab" data-tab="weight">Weight</button>' +
    '</div>';
    var totRate = 0;
    CATEGORIAS.forEach(function(cc){
      var arr2 = z[cc.key] || [];
      if(!arr2.length) return;
      var r2 = normalizaRate(z[cc.rate]);
      if(r2 <= 0){
        arr2.forEach(function(f){ if(typeof f.share === 'number') r2 += f.share; });
        r2 = normalizaRate(r2);
      }
      totRate += r2;
    });
    CATEGORIAS.forEach(function(c){
      var arr = z[c.key];
      if(!arr || !arr.length) return;
      var r = normalizaRate(z[c.rate]);
      if(r <= 0){
        arr.forEach(function(f){ if(typeof f.share === 'number') r += f.share; });
        r = normalizaRate(r);
      }
      var pct = totRate > 0 ? Math.round(r / totRate * 100) : 0;
      html += '<div class="pesca-grupo">' +
        '<div class="pesca-grupo-h">' +
          '<span>' + esc(c.lbl) + '</span>' +
          '<span class="pesca-grupo-pct">' + pct + '%</span>' +
        '</div>' +
        '<div class="pesca-fish-list">' + arr.map(renderPeixeRow).join('') + '</div>' +
      '</div>';
    });
    cEl.innerHTML = html;
    var bmBtn = cEl.querySelector('.pesca-copy-bm');
    if(bmBtn){
      bmBtn.onclick = function(){
        var url = location.origin + location.pathname + '?zona=' + encodeURIComponent(z.name || g.colorKey);
        navigator.clipboard.writeText(url).then(function(){
          bmBtn.textContent = 'Copiado!';
          setTimeout(function(){ bmBtn.textContent = 'Copiar Bookmark'; }, 1500);
        });
      };
    }
    el.style.display = 'block';
    draw();
  }

  function selecionarHotspot(h){
    selected = { kind:'hotspot', ref:h };
    var el  = document.getElementById('pesca-sel');
    var tEl = document.getElementById('pesca-sel-t');
    var sEl = document.getElementById('pesca-sel-s');
    var cEl = document.getElementById('pesca-sel-content');
    tEl.textContent = h.name || '(hotspot)';
    sEl.textContent = 'Hotspot';
    var a = h.startCoordinates || [];
    var minW = h.minWaitTime ? (h.minWaitTime/1000).toFixed(0)+'s' : '—';
    var maxW = h.maxWaitTime ? (h.maxWaitTime/1000).toFixed(0)+'s' : '—';
    var html = '<dl class="pesca-hotspot-info">' +
      '<dt>Coordenadas</dt><dd>' + (a[0]?Math.round(a[0])+', '+Math.round(a[1]):'—') + '</dd>' +
      '<dt>Nível mín.</dt><dd>' + (h.availableFishingLevel != null ? h.availableFishingLevel : '—') + '</dd>' +
      '<dt>Observável</dt><dd>' + (h.observableFishingLevel != null ? h.observableFishingLevel : '—') + '</dd>' +
      '<dt>Tempo de espera</dt><dd>' + minW + ' — ' + maxW + '</dd>' +
      '<dt>Peixes por vez</dt><dd>' + (h.minFishCount||'?') + ' — ' + (h.maxFishCount||'?') + '</dd>' +
    '</dl>';
    if(h.itemsObtainedFromHotspot && h.itemsObtainedFromHotspot.length){
      html += renderListaPeixes('Peixes desse hotspot', h.itemsObtainedFromHotspot);
    }
    cEl.innerHTML = html;
    el.style.display = 'block';
    draw();
  }

  function fecharPainel(){
    selected = null;
    document.getElementById('pesca-sel').style.display = 'none';
    esconderCardPeixe();
    draw();
  }

  var hoverTip = null;
  function getHoverTip(){
    if(hoverTip) return hoverTip;
    hoverTip = document.createElement('div');
    hoverTip.className = 'pesca-hover-tip';
    hoverTip.style.display = 'none';
    document.body.appendChild(hoverTip);
    return hoverTip;
  }
  function posicionarTip(mx, my, html){
    var tip = getHoverTip();
    tip.innerHTML = html;
    tip.style.display = 'block';
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var x = mx + 16, y = my + 16;
    if(x + w > window.innerWidth - 12)  x = mx - w - 16;
    if(y + h > window.innerHeight - 12) y = my - h - 16;
    tip.style.left = Math.max(8, x) + 'px';
    tip.style.top  = Math.max(8, y) + 'px';
  }
  function esconderTip(){ if(hoverTip) hoverTip.style.display = 'none'; }

  function montarTipZona(z){
    var html = '<div class="pesca-tip-h">' + esc(traduzirZona(z.name) || 'Zona de Pesca') + '</div>';
    html += '<div class="pesca-tip-sub">Zona de Pesca</div>';
    html += renderComposicao(z);
    var todos = [];
    CATEGORIAS.forEach(function(c){
      (z[c.key] || []).forEach(function(f){ todos.push(f); });
    });
    todos.sort(function(a,b){ return (b.share||0) - (a.share||0); });
    var top = todos.slice(0,3);
    if(top.length){
      html += '<div class="pesca-tip-h3">Destaques</div>';
      top.forEach(function(f){ html += renderPeixeRow(f); });
    }
    html += '<div class="pesca-tip-foot">Clique para ver a tabela completa</div>';
    return html;
  }
  function montarTipHotspot(h){
    var minW = h.minWaitTime ? (h.minWaitTime/1000).toFixed(0)+'s' : '—';
    var maxW = h.maxWaitTime ? (h.maxWaitTime/1000).toFixed(0)+'s' : '—';
    var html = '<div class="pesca-tip-h">' + esc(h.name || 'Hotspot') + '</div>';
    html += '<div class="pesca-tip-sub">Hotspot</div>';
    html += '<dl class="pesca-hotspot-info">' +
      '<dt>Tempo de espera</dt><dd>' + minW + ' — ' + maxW + '</dd>' +
      '<dt>Peixes por vez</dt><dd>' + (h.minFishCount||'?') + ' — ' + (h.maxFishCount||'?') + '</dd>' +
    '</dl>';
    var items = h.itemsObtainedFromHotspot || [];
    if(items.length){
      html += '<div class="pesca-tip-h3">Peixes</div>';
      items.slice(0,3).forEach(function(f){ html += renderPeixeRow(f); });
    }
    html += '<div class="pesca-tip-foot">Clique para ver a tabela completa</div>';
    return html;
  }

  function initInteracao(){
    var drag = null;
    cv.addEventListener('pointerdown', function(e){
      drag = { clientX:e.clientX, clientY:e.clientY, u:view.u, v:view.v, moved:false };
      try { cv.setPointerCapture(e.pointerId); } catch(_){}
      cv.classList.add('drag');
    });
    cv.addEventListener('pointermove', function(e){
      if(drag){
        var dx = e.clientX-drag.clientX, dy = e.clientY-drag.clientY;
        if(Math.abs(dx)+Math.abs(dy) > 3) drag.moved = true;
        view.u = drag.u - dx/view.k;
        view.v = drag.v - dy/view.k;
        clampView(); draw();
      } else { hover(e); }
    });
    cv.addEventListener('pointerup', function(e){
      if(drag && !drag.moved) click(e);
      drag = null; cv.classList.remove('drag');
    });
    cv.addEventListener('pointerleave', function(){ esconderTip(); });
    cv.addEventListener('pointercancel', function(){ drag=null; cv.classList.remove('drag'); });
    cv.addEventListener('wheel', function(e){
      e.preventDefault();
      var rect = cv.getBoundingClientRect();
      var mx = e.clientX - rect.left, my = e.clientY - rect.top;
      var uvBefore = screenToUV(mx, my);
      var factor = Math.pow(1.0016, -e.deltaY);
      var kMin = Math.min(VW,VH)*0.9;
      var kMax = 336*128;
      view.k = Math.max(kMin, Math.min(kMax, view.k*factor));
      view.u = uvBefore.u - (mx - VW/2)/view.k;
      view.v = uvBefore.v - (my - VH/2)/view.k;
      clampView(); draw();
    }, { passive:false });
  }

  function clampView(){
    var kMin = Math.min(VW,VH)*0.9;
    if(view.k < kMin) view.k = kMin;
    if(view.k <= kMin*1.02){ view.u = 0.5; view.v = 0.5; return; }
    var m = 0.25;
    view.u = Math.max(-m, Math.min(1+m, view.u));
    view.v = Math.max(-m, Math.min(1+m, view.v));
  }

  function hover(e){
    var rect = cv.getBoundingClientRect();
    var mx = e.clientX - rect.left, my = e.clientY - rect.top;
    var uv = screenToUV(mx, my);
    var g = uvToGame(uv.u, uv.v);
    var h = encontrarHotspotProximo(mx, my, 14);
    if(h && showHotspots){
      posicionarTip(e.clientX, e.clientY, montarTipHotspot(h));
      cv.style.cursor = 'pointer'; return;
    }
    if(showZones){
      var z = encontrarZonaEm(g.x, g.y);
      if(z){
        var zz = zonesByKey.get(z.colorKey);
        if(zz){ posicionarTip(e.clientX, e.clientY, montarTipZona(zz)); cv.style.cursor='pointer'; return; }
      }
    }
    esconderTip();
    cv.style.cursor = '';
  }

  function click(e){
    var rect = cv.getBoundingClientRect();
    var mx = e.clientX - rect.left, my = e.clientY - rect.top;
    var h = encontrarHotspotProximo(mx, my, 18);
    if(h && showHotspots){ selecionarHotspot(h); return; }
    var uv = screenToUV(mx, my);
    var g = uvToGame(uv.u, uv.v);
    var zona = encontrarZonaEm(g.x, g.y);
    if(zona){ selecionarZona(zona); return; }
    fecharPainel();
  }

  function normalizar(s){
    return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  }
  function montarIndiceBusca(){
    var itens = [];
    zones.forEach(function(z){
      itens.push({ tipo:'zona', nome:traduzirZona(z.name), sub:'Zona de pesca', cor:corCSS(z.colorKey,1), ref:z });
    });
    zones.forEach(function(z){
      CATEGORIAS.forEach(function(c){
        (z[c.key]||[]).forEach(function(f){
          itens.push({ tipo:'peixe', nome:f.name, sub:'em '+traduzirZona(z.name||'?'),
            icon:urlIcone(f.icon), cor:corCSS(z.colorKey,1), ref:z });
        });
      });
    });
    hotspots.forEach(function(h){
      itens.push({ tipo:'hotspot', nome:h.name, sub:'Hotspot', cor:'#ff76ff', ref:h });
    });
    return itens;
  }
  var buscaIndex = null;
  function setupBusca(){
    buscaIndex = montarIndiceBusca();
    var input = document.getElementById('pesca-q');
    var hitsEl = document.getElementById('pesca-hits');
    if(!input || !hitsEl) return;
    function fechar(){ hitsEl.classList.add('hidden'); }
    function render(q){
      if(!q){ fechar(); return; }
      var nq = normalizar(q);
      var out = [];
      for(var i=0;i<buscaIndex.length && out.length<30;i++){
        var it = buscaIndex[i];
        if(normalizar(it.nome).indexOf(nq) !== -1) out.push(it);
      }
      var html = '<div class="hits-h"><span>Resultados</span><b>'+out.length+'</b><span class="hits-x">✕</span></div>';
      if(!out.length) html += '<div class="none">Nada encontrado</div>';
      else out.slice(0,20).forEach(function(it){
        var ic = it.icon
          ? '<img class="ic" src="'+esc(it.icon)+'" alt="" onerror="this.style.display=\'none\'">'
          : '<span class="ic" style="background:'+esc(it.cor)+';"></span>';
        html += '<div class="it"><span>'+ic+'</span><span class="meta">'+
          '<span class="nm">'+esc(it.nome)+'</span>'+
          '<span class="sub">'+esc(it.sub||'')+'</span></span></div>';
      });
      hitsEl.innerHTML = html;
      hitsEl.classList.remove('hidden');
      var hx = hitsEl.querySelector('.hits-x');
      if(hx) hx.onclick = function(){ input.value=''; fechar(); input.focus(); };
      hitsEl.querySelectorAll('.it').forEach(function(node,i){
        node.onclick = function(){
          var it = out[i];
          if(it.tipo==='zona' || it.tipo==='peixe'){
            var g = geomByKey.get(it.ref.colorKey);
            if(g && g.centroid){ focar(g.centroid[0], g.centroid[1], 3); selecionarZona(g); }
          } else if(it.tipo==='hotspot'){
            var h = it.ref; var a = h.startCoordinates;
            if(a){ focar(a[0], a[1], 4); selecionarHotspot(h); }
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
      if(e.key==='Escape'){ input.value=''; fechar(); }
    });
  }

  function focar(gameX, gameY, zoom){
    var uv = coordToUV(gameX, gameY);
    view.u = uv.u; view.v = uv.v;
    var target = Math.min(VW,VH)*(zoom||3);
    view.k = Math.max(Math.min(VW,VH)*0.9, target*3);
    clampView(); draw();
  }

  function init(){
    wrap = document.getElementById('pesca-wrap');
    cv = document.getElementById('pesca-canvas');
    if(!wrap || !cv){
      console.error('[Pesca] #pesca-wrap ou #pesca-canvas não encontrado');
      return;
    }
    ctx = cv.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    initInteracao();

    var headEl = document.getElementById('pesca-ui-head');
    if(headEl) headEl.addEventListener('click', function(){
      var ui = document.getElementById('pesca-ui');
      var collapsed = ui.classList.toggle('collapsed');
      var caret = document.getElementById('pesca-caret');
      if(caret) caret.textContent = collapsed ? 'Expandir' : 'Recolher';
    });
    var tz = document.getElementById('pesca-toggle-zones');
    if(tz) tz.addEventListener('change', function(e){ showZones = e.target.checked; draw(); });
    var th = document.getElementById('pesca-toggle-hotspots');
    if(th) th.addEventListener('change', function(e){ showHotspots = e.target.checked; draw(); });
    var tl = document.getElementById('pesca-toggle-labels');
    if(tl) tl.addEventListener('change', function(e){ showLabels = e.target.checked; draw(); });
    var bf = document.getElementById('pesca-btn-fit');
    if(bf) bf.addEventListener('click', function(){
      view.k = Math.min(VW,VH)*0.9; view.u = 0.5; view.v = 0.5;
      clampView(); draw();
    });
    var cs = document.getElementById('pesca-sel-close');
    if(cs) cs.addEventListener('click', fecharPainel);

    var selContent = document.getElementById('pesca-sel-content');
    if(selContent){
      selContent.addEventListener('mouseover', function(e){
        var row = e.target.closest && e.target.closest('.pesca-fish');
        if(!row) return;
        var idx = parseInt(row.getAttribute('data-fish-idx'), 10);
        var f = _fishRegistry[idx];
        if(f) mostrarCardPeixe(f, e.clientX, e.clientY);
      });
      selContent.addEventListener('mouseout', function(e){
        var row = e.target.closest && e.target.closest('.pesca-fish');
        if(row) esconderCardPeixe();
      });
      selContent.addEventListener('mousemove', function(e){
        if(_cardPeixeEl && _cardPeixeEl.style.display === 'block')
          posicionarCardPeixe(e.clientX, e.clientY);
      });
    }

    var fs = document.getElementById('pesca-fullscreen');
    if(fs) fs.addEventListener('click', function(){
      wrap.classList.toggle('is-fullscreen');
      var isFs = wrap.classList.contains('is-fullscreen');
      document.body.style.overflow = isFs ? 'hidden' : '';
      var txt = this.querySelector('.pesca-fs-text');
      if(txt) txt.textContent = isFs ? 'Sair' : 'Tela cheia';
      setTimeout(resize, 60);
    });
    document.addEventListener('keydown', function(e){
      if(e.key==='Escape' && wrap.classList.contains('is-fullscreen')){
        wrap.classList.remove('is-fullscreen');
        document.body.style.overflow = '';
        var txt = document.querySelector('.pesca-fs-text');
        if(txt) txt.textContent = 'Tela cheia';
        setTimeout(resize, 60);
      }
    });

    carregarDados().then(function(){
      view.k = Math.min(VW,VH)*0.9; view.u = 0.5; view.v = 0.5;
      clampView(); draw();
      setupBusca();
    }).catch(function(err){
      console.error('[Pesca] Falha ao carregar:', err);
      var t = document.getElementById('pesca-title');
      if(t) t.textContent = 'Erro ao carregar dados';
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
// ===== FIM DO ARQUIVO =====