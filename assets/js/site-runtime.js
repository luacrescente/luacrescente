// Lua Crescente — runtime compartilhado das páginas
// A lógica de dados fica em assets/data/.
// v106 — removeu o HTML morto do changelog (v90) que era sobrescrito pelo
// renderChangelogTimeline, e adicionou guardas para os globais de tradução.

var DATA = window.DATA || [];
// Ícones neutros (SVG, herdam a cor do botão) usados nos botões de compartilhar/copiar link/imagem.
window.LC_ICONS = (function(){
  const svg = (inner)=>`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
  return {
    share: svg('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>'),
    link: svg('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
    image: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>'),
    check: svg('<polyline points="20 6 9 17 4 12"/>'),
    download: svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>')
  };
})();


// ---------------------------------------------------------------------
// Sub-receitas e fontes pesquisadas (BDO Codex / BDOlytics / guias PT-BR).
// Itens aqui viram expansíveis em cascata dentro da árvore. Itens sem
// entrada aqui aparecem marcados como "a confirmar" na fonte.
// ---------------------------------------------------------------------


// Itens que são material-base (não têm sub-receita), com fonte confirmada.


// Índices das cascatas. São reconstruídos quando uma categoria é carregada.
const EXPAND_INDEX = {};
const EXPAND_INDEX_ALL = {};
function clearExpandIndexes(){
  Object.keys(EXPAND_INDEX).forEach(k=>delete EXPAND_INDEX[k]);
  Object.keys(EXPAND_INDEX_ALL).forEach(k=>delete EXPAND_INDEX_ALL[k]);
}
function registerExpandDefinition(name, def){
  if(!name || !def) return;
  (EXPAND_INDEX_ALL[name] ||= []).push(def);
  if(!EXPAND_INDEX[name]) EXPAND_INDEX[name] = def;
}
function rebuildExpandIndex(){
  clearExpandIndexes();
  DATA.forEach(item=>{

  if(item.isGroup){
    if(item.routes){
      item.routes.forEach(r=> (r.variants||[]).forEach(v=>{
        registerExpandDefinition(v.title, v.routes ? {routes:v.routes, note:v.note, produces:v.produces} : {children:v.children, note:v.note, produces:v.produces});
      }));
      const first = item.routes[0]?.variants?.[0];
      if(first){
        registerExpandDefinition(item.name, first.routes ? {routes:first.routes, note:first.note, produces:first.produces} : {children:first.children, note:first.note, produces:first.produces});
      }
    } else {
      item.variants.forEach(v=>registerExpandDefinition(v.title, {children:v.children, produces:v.produces}));
      if(item.variants[0]) registerExpandDefinition(item.name, {children:item.variants[0].children, produces:item.variants[0].produces});
    }
  } else if(item.routes){
    registerExpandDefinition(item.name, {routes:item.routes, produces:item.produces});
  } else if(Array.isArray(item.children) && item.children.length){
    registerExpandDefinition(item.name, {children:item.children, note:item.note, produces:item.produces});
  }
});
Object.entries(typeof SUBRECIPES !== 'undefined' ? SUBRECIPES : {}).forEach(([name, info])=>{
  if(Array.isArray(info.children) && info.children.length) registerExpandDefinition(name, {children:info.children, note:info.note});
});
}

const SOURCE_INDEX = typeof LEAF_SOURCES !== 'undefined' ? {...LEAF_SOURCES} : {};

// Recupera diretamente uma receita por título quando um ingrediente aponta
// para uma variante que pertence a um grupo/rota. Isso evita que variantes
// como "Fármaco da Harmonia - Edania" caiam no estado "a confirmar".
function findRecipeDefinition(name, desiredQty){
  if(!name) return null;
  const defs = EXPAND_INDEX_ALL[name] || [];
  if(defs.length && Number.isFinite(Number(desiredQty))){
    const target = Number(desiredQty);
    const exact = defs.find(d => Number(d.produces) === target);
    if(exact) return exact;
  }
  if(EXPAND_INDEX[name]) return EXPAND_INDEX[name];

  // Primeiro, procure explicitamente em TODAS as variantes/rotas do DATA.
  // Isso é necessário para variantes como "Fármaco da Harmonia - Edania",
  // que são receitas válidas, mas não são raízes independentes do DATA.
  const visit=(node)=>{
    if(!node) return null;
    const title=node.title || node.name;
    if(title===name){
      if(node.routes) return {routes:node.routes, note:node.note, produces:node.produces};
      if(Array.isArray(node.children)) return {children:node.children, note:node.note, produces:node.produces};
    }
    for(const v of (node.variants||[])){
      const found=visit(v);
      if(found) return found;
    }
    for(const r of (node.routes||[])){
      const found=visit(r);
      if(found) return found;
    }
    return null;
  };

  for(const item of DATA){
    const found=visit(item);
    if(found){
      EXPAND_INDEX[name]=found;
      return found;
    }
  }
  return null;
}

let uidCounter = 5000;
const nextUid = ()=> uidCounter++;

function translateFreeText(text){
  if(currentLang!=='es' || !text) return text;
  const exact={
    'Culinária no Utensílio de Culinária.':'Cocina en el Utensilio de Cocina.',
    'Culinária (Mestre 1+) no Utensílio de Culinária.':'Cocina (Maestro 1+) en el Utensilio de Cocina.',
    'Culinária (Habilidoso 1+) no Utensílio de Culinária.':'Cocina (Hábil 1+) en el Utensilio de Cocina.',
    'Culinária (Habilidoso 6+) no Utensílio de Culinária.':'Cocina (Hábil 6+) en el Utensilio de Cocina.',
    'Alquimia no Alambique.':'Alquimia en el Alambique.',
    'Alquimia (Habilidoso 1+) no Alambique.':'Alquimia (Hábil 1+) en el Alambique.'
  };
  if(exact[text]) return exact[text];
  return text.replace(/Coleta/g,'Recolección').replace(/Loot/g,'Botín').replace(/derrotar monstros/g,'derrotar monstruos').replace(/derrotar /g,'derrotar ').replace(/chance/g,'probabilidad').replace(/também/g,'también').replace(/comprável/g,'comprable').replace(/via /g,'mediante ').replace(/em /g,'en ').replace(/ no /g,' en ').replace(/ de /g,' de ');
}

function renderChildren(children, ancestry){
  ancestry = ancestry || [];
  if(!children || !children.length) return '';
  const items = children.map(c=>{
    if(c.placeholder){
      return `<li><span class="placeholder">${tName(c.name)}</span></li>`;
    }

    // Ingrediente com alternativas de grupo (ou uma alternativa simples).
    if(c.alternatives && c.alternatives.length){
      const newAncestry = ancestry.concat([c.name]);
      const options = [{name:c.name, qty:c.qty}, ...(c.alternatives || []).map(a => typeof a === 'string' ? {name:a, qty:c.qty} : a)];
      const names = options.map(o => o.name);
      const routes = options.map(opt => ({
        label: opt.name,
        children: [{name:opt.name, qty:opt.qty ?? c.qty, source: opt.name===c.name ? c.source : SOURCE_INDEX[opt.name] || null}]
      }));
      const inner = renderRoutes(routes, nextUid(), newAncestry);
      return `<li class="has-sub">
        <div class="ingredient-row">
          <span class="qty">×${c.qty}</span><span class="ingredient-name">${tName(c.name)}</span>
          <span class="tag">${currentLang==='es'?`${names.length} opciones`:`${names.length} opções`}</span><span class="sub-chevron"></span>
        </div>
        <div class="sub-recipe">
          <div class="sub-recipe-label">${currentLang==='es'?'Elija 1 opción':'Escolha 1 opção'}</div>
          ${inner}
        </div>
      </li>`;
    }
    if(c.alt){
      const newAncestry = ancestry.concat([c.name]);
      const routes = [
        { label: c.name, children: [{name:c.name, qty:c.qty, source:c.source}] },
        { label: c.alt.name, children: [{name:c.alt.name, qty:c.alt.qty, source:c.alt.source}] },
      ];
      const inner = renderRoutes(routes, nextUid(), newAncestry);
      return `<li class="has-sub">
        <div class="ingredient-row">
          <span class="qty">×${c.qty}</span><span class="ingredient-name">${tName(c.name)}</span>
          <span class="tag">${currentLang==='es'?'2 rutas':'2 rotas'}</span><span class="sub-chevron"></span>
        </div>
        <div class="sub-recipe">
          <div class="sub-recipe-label">Como conseguir ${tName(c.name)}</div>
          ${inner}
        </div>
      </li>`;
    }

    // Grupos de substituição: listar as opções individualmente em vez de exibir um rótulo genérico.
    const genericOptions = GENERIC_SUBSTITUTION_OPTIONS[c.name];
    if(genericOptions && genericOptions.length){
      const newAncestry = ancestry.concat([c.name]);
      const routes = genericOptions.map(opt => {
        const option = typeof opt === 'string' ? {name:opt, qty:c.qty} : {...opt, qty:opt.qty ?? c.qty};
        return {label: option.name, children:[{name:option.name, qty:option.qty, source:option.source || SOURCE_INDEX[option.name] || null}]};
      });
      const inner = renderRoutes(routes, nextUid(), newAncestry);
      return `<li class=\"has-sub\"><div class=\"ingredient-row\"><span class=\"qty\">×${c.qty}</span><span class=\"ingredient-name\">${tName(c.name)}</span><span class=\"tag\">${currentLang==='es'?`${genericOptions.length} opciones`:`${genericOptions.length} opções`}</span><span class=\"sub-chevron\"></span></div><div class=\"sub-recipe\"><div class=\"sub-recipe-label\">${currentLang==='es'?'Elija 1 opción':'Escolha 1 opção'}</div>${inner}</div></li>`;
    }

    const expand = findRecipeDefinition(c.name, c.qty);
    // Auto-referência: quando um perfume aparece dentro da própria rota de
    // Imortalidade, ele deve abrir novamente sua receita completa. Não
    // redirecionamos e não mostramos "a confirmar". Para evitar loop infinito,
    // nesse caso abrimos a rota-base do próprio item ("Receita base") e
    // continuamos a cascata normalmente pelos ingredientes dela.
    const selfCascade = !!(expand && ancestry.length >= 1 && ancestry[ancestry.length - 1] === c.name);
    const canExpand = expand && (ancestry.indexOf(c.name) === -1 || selfCascade) && ancestry.length < 14;
    if(canExpand){
      const newAncestry = ancestry.concat([c.name]);
      let inner = '';
      if(expand.routes){
        const baseRoute = expand.routes.find(r => /^receita base$/i.test(r.label || '')) || expand.routes[0];
        // Para uma auto-referência, mostrar a receita-base evita recursão das
        // próprias rotas de Imortalidade, mas mantém toda a árvore acessível.
        inner = selfCascade
          ? renderChildren(baseRoute.children, newAncestry)
          : renderRoutes(expand.routes, nextUid(), newAncestry);
      } else {
        inner = renderChildren(expand.children, newAncestry);
      }
      const note = expand.note ? `<div class="sub-recipe-note">${translateFreeText(expand.note)}</div>` : '';
      return `<li class="has-sub">
        <div class="ingredient-row">
          <span class="qty">×${c.qty}</span><span class="ingredient-name">${tName(c.name)}</span>
          <span class="tag">${currentLang==='es'?'Subreceta':'Sub-receita'}</span><span class="sub-chevron"></span>
        </div>
        <div class="sub-recipe">
          <div class="sub-recipe-label">Receita de ${tName(c.name)}</div>
          ${note}
          ${inner}
        </div>
      </li>`;
    }
    const src = c.source || SOURCE_INDEX[c.name] || GENERIC_SUBSTITUTION_SOURCES[c.name] || null;
    const srcTag = src
      ? `<span class="src-tag">📍 ${currentLang==='es'?translateFreeText(src):src}</span>`
      : `<span class="src-unknown">📍 ${currentLang==='es'?'por confirmar':'a confirmar'}</span>`;
    return `<li><span class="qty">×${c.qty}</span><span class="ingredient-name">${tName(c.name)}</span>${srcTag}</li>`;
  }).join('');
  return `<ul class="tree">${items}</ul>`;
}

function renderVariantList(variants, ancestry){
  return (variants||[]).map(v=>`
    <div class="variant">
      <div class="variant-title ${v.immortality?'immortality':''}">
        ${VARIANT_ITEM_ICONS[v.title] ? `<img class="variant-item-icon" src="${assetIcon(VARIANT_ITEM_ICONS[v.title])}" alt="" loading="eager" referrerpolicy="no-referrer" onerror="this.onerror=null;this.style.display='none'">` : ''}
        ${tName(v.title)}
        ${v.produces? `<span class="produces">— rende ${tName(v.produces)}</span>`:''}
      </div>
      ${v.routes ? renderRoutes(v.routes, nextUid(), ancestry.concat([v.title])) : renderChildren(v.children, ancestry.concat([v.title]))}
    </div>
  `).join('');
}

function renderVariantRoutes(routes, uid, ancestry){
  const tabs = routes.map((r,i)=>
    `<button class="route-tab ${i===0?'active':''}" data-uid="${uid}" data-idx="${i}">${tName(r.label)}</button>`
  ).join('');
  const panes = routes.map((r,i)=>{
    const body = r.variants ? renderVariantList(r.variants, ancestry) : (r.routes ? renderRoutes(r.routes, nextUid(), ancestry) : renderChildren(r.children, ancestry));
    return `<div class="route-pane ${i===0?'active':''}" data-uid="${uid}" data-idx="${i}">${body}</div>`;
  }).join('');
  return `<div class="route-tabs">${tabs}</div>${panes}`;
}

function renderRoutes(routes, uid, ancestry){
  const tabs = routes.map((r,i)=>
    `<button class="route-tab ${i===0?'active':''}" data-uid="${uid}" data-idx="${i}">${tName(r.label)}</button>`
  ).join('');
  const panes = routes.map((r,i)=>{
    const guide = r.image ? `<div class="combination-guide"><img src="${assetIcon(r.image)}" alt="Combinação do tesouro na Bolsa de Combinações de Yaz" loading="lazy"><div class="combination-guide-caption">Combinação na Bolsa de Combinações de Yaz</div></div>` : '';
    return `<div class="route-pane ${i===0?'active':''}" data-uid="${uid}" data-idx="${i}">${guide}${renderChildren(r.children, ancestry)}</div>`;
  }).join('');
  return `<div class="route-tabs">${tabs}</div>${panes}`;
}

function assetIcon(file){
  if(!file) return '';
  const s=String(file);
  if(/^https?:\/\//i.test(s) || s.startsWith('/') || s.startsWith('data:')) return s;
  return '/assets/img/' + s.replace(/^\.\//,'').replace(/^assets\/img\//,'');
}

function codexIcon(id){
  // Ícone oficial do item via BDO Codex. Evita divergências regionais da CDN de mercado.
  return `https://s1.pearlcdn.com/NAEU/TradeMarket/Common/img/BDO/item/${String(id)}.png`;
}

const ROOT_ITEM_ICONS = {
  'Fármacos da Harmonia': codexIcon(1399),
  'Fármacos Tradicionais': codexIcon(799),
  'Fármacos Base':'⚗️',
  'Fármaco da Raiva': codexIcon(1389),
  'Fármaco da Adaptação': codexIcon(1391),
  'Fármaco do Potencial': codexIcon(1393),
  'Fármaco da Decadência': codexIcon(1395),
  'Fármaco da Ira Descontrolada': codexIcon(1397),
  'Sangue da Fera Lendária': codexIcon(6351),
  'Sangue do Tirano': codexIcon(6352),
  'Sangue de Palhaço': codexIcon(6353),
  'Sangue do Pecador': codexIcon(6354),
  'Sangue de Homem Sábio': codexIcon(6355),
  'Sangue de Cervo': codexIcon(6201),
  'Sangue de Ovelha': codexIcon(6202),
  'Sangue de Raposa': codexIcon(6203),
  'Sangue de Rinoceronte': codexIcon(6204),
  'Sangue de Dragão Guepardo': codexIcon(6216),
  'Sangue de Flamingo': codexIcon(6218),
  'Sangue de Guaxinim': codexIcon(6210),
  'Sangue de Macaco': codexIcon(6211),
  'Sangue de Doninha': codexIcon(6212),
  'Sangue de Boi': codexIcon(6206),
  'Sangue de Waragon': codexIcon(6215),
  'Sangue de Lhama': codexIcon(6227),
  'Sangue de Cabra': codexIcon(6228),
  'Sangue de Troll': codexIcon(6220),
  'Sangue de Morcego': codexIcon(6219),
  'Sangue de Porco': codexIcon(6205),
  'Sangue de Dinossauro': codexIcon(6207),
  'Sangue de Lagarto': codexIcon(6208),
  'Sangue de Minhoca': codexIcon(6209),
  'Sangue de Urso': codexIcon(6213),
  'Sangue de Lobo': codexIcon(6214),
  'Sangue de Pássaro Kuku': codexIcon(6217),
  'Sangue de Ogro': codexIcon(6221),
  'Sangue de Cobra': codexIcon(6222),
  'Sangue de Leão': codexIcon(6223),
  'Sangue de Escorpião': codexIcon(6224),
  'Sangue de Iaque': codexIcon(6225),
  'Sangue de Marmota': codexIcon(6226),
  'Sangue de Elefante Rocha': codexIcon(6359),
  'Sangue de Turo Rígido': codexIcon(9778),
  'Seiva de Freixo': codexIcon(5001),
  'Seiva de Bordo': codexIcon(5002),
  'Seiva de Pinheiro': codexIcon(5003),
  'Seiva de Bétula': codexIcon(5004),
  'Seiva de Abeto': codexIcon(5009),
  'Seiva de Cedro': codexIcon(5010),
  'Seiva de Cedro Branco': codexIcon(5012),
  'Seiva de Cedro Nevado': codexIcon(5024),
  'Seiva de Árvore-Anel': codexIcon(5018),
  'Seiva de Tuia': codexIcon(5020),
  'Seiva de Espinheiro': codexIcon(5023),
  'Seiva de Árvore de Caphras': codexIcon(5025),
  'Seiva de Árvore Musgosa': codexIcon(5017),
  'Biscoito de Aloés': codexIcon(9205),
  'Iogurte de Aloés': codexIcon(9204),
  'Acompanhamentos Variados': codexIcon(9209),
  'Marmita de Balacs': codexIcon(9359),
  'Ovos de Pássaros Cozidos': codexIcon(9402),
  'Lagosta Assada em Manteiga': codexIcon(9477),
  'Refeição de Calpheon': codexIcon(9605),
  'Macarrão de Coco': codexIcon(9308),
  'Peixe Coco Frito': codexIcon(9309),
  'Arroz Cozido': codexIcon(820815),
  'Cuscuz': codexIcon(9220),
  'Gukbap de Dhal-Bohl': codexIcon(820857),
  'Pudim Escuro': codexIcon(9422),
  'Suco de Delotia': codexIcon(9327),
  'Chá com Leite de Delotia': codexIcon(9329),
  'Pudim de Delotia': codexIcon(9325),
  'Bolinho do Deserto': codexIcon(9410),
  'Tempero': codexIcon(9006),
  'Refeição de Eil': codexIcon(9640),
  'Refeição de Frutos do Mar de Cron': codexIcon(9691),
  'Refeição Especial de Arehaza': codexIcon(9632),
  'Legumes Refogados': codexIcon(9241),
  'Refeição de Valência': codexIcon(9609),
  'Suco de Yuzu': codexIcon(9355),
  'Bala de Yuzu': codexIcon(9378),
  'Vinagre de Yuzu': codexIcon(9353),
  'Elixir de Fúria': codexIcon(704),
  'Elixir do Frenesi': codexIcon(672),
  'Elixir da Concentração': codexIcon(700),
  'Elixir da Destruição': codexIcon(1180),
  'Elixir da Defesa': codexIcon(716),
  'Elixir de Espiral': codexIcon(782),
  'Elixir de Vida': codexIcon(708),
  'Elixir de Estamina': codexIcon(722),
  'Elixir do Vento': codexIcon(688),
  'Elixir de Rapidez': codexIcon(690),
  'Elixir de Feitiço': codexIcon(692),
  'Elixir de Choque': codexIcon(762),
  'Elixir do Ceifador': codexIcon(712),
  'Elixir da Morte': codexIcon(686),
  'Elixir de Perfuração': codexIcon(680),
  'Elixir de Pilhagem': codexIcon(676),
  'Elixir de Assassinato': codexIcon(696),
  'Elixir de Detecção': codexIcon(698),
  'Elixir de Carnificina': codexIcon(718),
  'Elixir do Céu': codexIcon(720),
  'Elixir da Força Física': codexIcon(1188),
  'Elixir da Persistência': codexIcon(1184),
  'Elixir de Trabalhador': codexIcon(724),
  'Elixir da Energia': codexIcon(682),
  'Elixir de Mentalidade': codexIcon(710),
  'Elixir de Ressurreição': codexIcon(668),
  'Elixir de Remoção de Queimadura': codexIcon(728),
  'Elixir de Antídoto': codexIcon(542),
  'Elixir do Selo': codexIcon(694),
  'Elixir de Tendão de Baleia': codexIcon(732),
  'Elixir da Habilidade': codexIcon(1152),
  // Fármacos do Oceano — ícones fornecidos pelo usuário, armazenados localmente.
  'Fármaco do Oceano': 'farmacos-oceano/farmaco-do-oceano.png',
  'Fármaco do Vasto Oceano': 'farmacos-oceano/farmaco-do-vasto-oceano.png',
  'Fármaco do Oceano Infinito': 'farmacos-oceano/farmaco-do-oceano-infinito.png',
  // Fármacos — IDs confirmados no BDO Codex.
  'Fármaco da Fúria': codexIcon(799),
  'Fármaco do Gigante': codexIcon(793),
  'Fármaco da Fera': codexIcon(792),
  'Fármaco de Barbaridade': codexIcon(794),
  'Fármaco do Alvoroço': codexIcon(795),
  'Fármaco da Armadura de Aço': codexIcon(798),

  // Rações — alimentação de mascotes e montarias.
  'Ração Boa': codexIcon(54017),
  'Ração Orgânica': codexIcon(54018),
  'Suco de Cenoura de Alta Qualidade': codexIcon(9210),
  'Suco de Cenoura Especial': codexIcon(9211),
  'Cenoura Confit': codexIcon(9321),
  'Chá com Leite de Delotia': 'cha-leite-delotia.png',

  // Perfumes — IDs confirmados no BDO Codex.
  'Perfume de Coragem': codexIcon(734),
  'Perfume do Khalk': codexIcon(748),
  'Perfume do Mar Profundo': codexIcon(771),
  'Perfume do Desejo': codexIcon(1411),
  'Perfume da Perseverança': codexIcon(1413),
  'Perfume de Rapidez': codexIcon(735),
  'Perfume de Espírito': codexIcon(781),
  'Perfume de Espírito da Respiração': codexIcon(872),
  'Perfume do Encanto': codexIcon(1161),
  'Perfume do Discernimento': codexIcon(1200),
  'Perfume da Sombra Verde': 'perfumes/perfume-da-sombra-verde.png',

  'Bênção de Criatura Mística - PA Total': codexIcon(767969),
  'Bênção de Criatura Mística - Precisão': codexIcon(767970),
  'Bênção de Criatura Mística - Redução de Dano': codexIcon(767971),
  'Bênção de Criatura Mística - Evasão': codexIcon(767972),
  'Bênção de Criatura Mística - HP Máximo': codexIcon(767973),
  'Bênção de Criatura Mística - Maestria de Vida': codexIcon(790781),

  'Cerveja': codexIcon(9213),
  'Chope Gelado': codexIcon(9283),
  'Carne de Pássaro Grelhada': codexIcon(9492),
  'Carne de Pássaro Bem Grelhada': codexIcon(9493),
  'Aveia': codexIcon(9261),
  'Aveia Refinada': codexIcon(9276),
  'Salgado de Filé de Peixe': codexIcon(9208),
  'Salgadinho Delicioso de Filé de Peixe': codexIcon(9297),
  'Ensopado de Cobra Freekeh': codexIcon(9215),
  'Ensopado de Cobra Freekeh Forte': codexIcon(9300),
  'Torta de Queijo': codexIcon(9268),
  'Torta de Queijo de Alta Qualidade': codexIcon(9273),

  'Poção de HP (P)': codexIcon(517),
  'Poção de HP (M)': codexIcon(518),
  'Poção de HP (G)': codexIcon(519),
  'Poção de MP (P)': codexIcon(520),
  'Poção de MP (M)': codexIcon(521),
  'Poção de MP (G)': codexIcon(522),
  'Poção de Tendão de Baleia': codexIcon(575),
  'Tendão de Baleia Azul': codexIcon(9729),
  'Poção de Tendão de Baleia Superior': codexIcon(576),

  'Essência Espiritual de Ornette': 'ornette-essencia.png',
  'Essência Espiritual de Odore': codexIcon(40771),
  'Bússola Atualizada de Lafi Bedmountain': 'bussola-atualizada.png',
  'Mapa de Arqueólogo': 'mapa-arqueologo.png',
  'Brilho de Evenruth': 'evenruth.png',
  'Anel de Comerciante Rico': 'comerciante-rico.png',
  'Lâmpada Flutuante de Remitaronsom': 'lampada-remitaronsom.png',
  'Telescópio Reforçado de Lafi Bedmountain': 'telescopio.png',
  'Estrela de Nostos': 'estrela-nostos.png',
  'Retiro de Krogdalo': 'retiro-krogdalo.png',

  // Culinária Especial — IDs dos itens conferidos no BDO Codex.
  'Sopa Nutritiva Milagrosa': codexIcon(820146),
  'Sopa de Bolinho de Arroz Milagroso': codexIcon(820147),
  'Licor de Ameixa Colorido': codexIcon(820148),
  'Refeição Coreana Farta': codexIcon(821136),
  'Refeição Coreana Requintada': codexIcon(821137),
  'Doces e Chá Tradicionais': codexIcon(821138),
  'Tteoks Sortidos': codexIcon(821139),
  'Kimchis Sortidos': codexIcon(821140),
  'Namul Tricolor': codexIcon(821141),
  'Yeolgujatang': codexIcon(821142),
  'Gujeolpan': codexIcon(821143),
  'Remédio de Erva Misterioso': codexIcon(821144),
  'Remédio de Erva Sutil': codexIcon(821145),
  'Gukbap de Mu-Duh': codexIcon(820856),
  'Gukbap de Dhal-Bhol': codexIcon(820857),
  'Gukbap do Concelho de Byot': codexIcon(820858)
};

// Culinária — ícones reais dos itens, via IDs do BDO Codex/Pearl Abyss.
const CULINARY_ICON_IDS = {
  'Sopa de Carne':'sopa-de-carne.png',
  'Chá com Aroma Fino':'cha-com-aroma-fino.png',
  'Pão de Teff':'pao-de-teff.png',
  'Sanduíche Teff':'sanduiche-teff.png',
  'Chá com Leite':'cha-com-leite.png',
  'Refeição da Onda de Okilua':'refeicao-da-onda-de-okilua.png',
  'Lagosta Assada em Manteiga':9477,
  'Chá com Leite de Delotia':9329,
  'Carne Frita com Cogumelo Oriole':9340,
  'Ensopado de Cogumelo Oriole':9339,
  'Ensopado de Batata e Cogumelo Oriole':9341,
  'Mingau de Cogumelo Oriole':9345,
  'Risoto de Cogumelo Oriole':9343,
  'Biscoito de Aloés':9205,
  'Iogurte de Aloés':9204,
  'Acompanhamentos Variados':9209,
  'Marmita de Balacs':9359,
  'Refeição de Balenos':9601,
  'Ovos de Pássaros Cozidos':9402,
  'Cenoura Confit':9321,
  'Queijo Gratinado':9203,
  'Torta de Queijo':9268,
  'Chowder':6394,
  'Cuscuz':9220,
  'Cuscuz Clássico':9305,
  'Coquetel de Coco':9307,
  'Macarrão de Coco':9308,
  'Coquetel de Coco Gelado':9310,
  'Suco de Fruta':9257,
  'Ensopado de Cobra Freekeh':9215,
  'Makgeolli':9262,
  'Salsicha Grelhada':9427,
  'Refeição de Serendia':9603,
  'Refeição de Calpheon':9605,
  'Refeição de Mediah':9607,
  'Refeição de Valência':9609,
  'Refeição de Kamasylvia':9635,
  "Refeição de O'dyllita":9638,
  'Refeição de Eil':9640,
  'Refeição de Drieghan Especial':9637,
  'Refeição Especial de Arehaza':9632,
  'Refeição de Kamasylvia Especial':9636,
  'Refeição de Mediah Especial':9608,
  'Refeição de Valência Especial':9610,
  'Refeição Simples de Cron':9692,
  'Refeição Energética de Cron':9694,
  'Suco de Cenoura de Alta Qualidade':9210,
  'Vinagre':9066,
  'Arroz Cozido':820815,
  'Pudim Escuro':9422,
  'Aveia':9261,
  'Tempero':9006,
  'Bala de Yuzu':9378,
  'Sidra de Yuzu':9352,
  'Suco de Yuzu':9355,
  'Vinagre de Yuzu':9353,
  'Peixe Coco Frito':9309,
  'Borscht':9408,
  'Sopa de Grãos':9255,
  'Bife Saboroso':9496,
  'Gelatina de Trigo-Sarraceno':9290,
  'Chá Sute':9207,
  'Pão Macio':9260,
  'Bife':9401,
  'Carne de Ave Grelhada':9492,
  'Pássaro Frito':9403,
  'Peixe Frito':9407,
  'Croquete de Carne':9404,
  'Macarrão com Carne':9416,
  'Torta de Carne':9265,
  'Sanduíche de Carne':9415,
  'Sopa de Carne':'sopa-de-carne.png',
  'Ensopado de Carne':9414,
  'Salada de Peito de Frango':9335,
  'Salada de Filé de Peixe':9423,
  'Sopa de Peixe':9418,
  'Salada de Frutas e Legumes':9258,
  'Torta de Fruta':9264,
  'Pudim de Fruta':9259,
  'Vinho de Fruta':9201,
  'Sorbet de Frutas':9376,
  'Garae-Tteok':820845,
  'Carne Frita':9426,
  'Frutos do Mar Refogados':9420,
  'Omelete':9269,
  'Panqueca de Ostra':9475,
  'Legumes em Conserva':9271,
  'Peixe em Conserva':9412,
  'Molho Vermelho':9065,
  'Molho Branco':9003,
  'Sungnyung':9275,
  'Prato Especial de Frutos do Mar de Margoria':9634,
  'Refeição Especial de Eil':9360,
  'Vinho de Tamareira':9219,
  'Licor de Mel':9206,
  'Biscoito de Colmeia':9266,
  'Chá de Jujuba':820839,
  'Salada de Carne Magra':9425,
  'Kebab de Lagarto':9406,
  'Hambúrguer do Rei da Selva':9463,
  'Ração de Combate do Cavaleiro':9631,
  'Gukbap de Dhal-Bohl':820857,
  'Pudim de Delotia':9325,
  'Dongchimi':820805,
  'Mexido de Broto de Feijão':820811,
  'Suco de Delotia':9327,
  'Tartar de Delotia':9323,
  'Bolinho do Deserto':9410,
  'Essência do Liquor':9057,
  'Torta de Figo':9216,
  'Sanduíche Frank':9337,
  'Legumes Fritos':9256,
  'Escorpião Grelhado':9461,
  'Sanduíche de Presunto':9267,
  'Refeição de Cron Saborosa':9695,
  'Ginkgo Torrado':820843,
  'Churrasco de Marmota':9488,
  'Sanduíche de Cogumelo Arco-Íris':9316,
  'Mingau de Feijão Vermelho':820825,
  'Tteok de Feijão':820849,
  'Grelhado de Cogumelo Arco-Íris com Queijo':9483,
};

const COMMON_INGREDIENT_ICON_IDS = {
  'Rosa':7319,
  'Pistache':7017,
  'Trigo':7001,
  'Cevada':7002,
  'Milho':7005,
  'Repolho':7318,
  'Massa de Teff':7206,
  'Farinha de Milho':7105,
  'Leite':9065,
  'Chá com Cheiro Forte':9292,
  'Molho Base':9018,
  'Alho':7302,
  'Aloés':7347,
  'Arroz':820117,
  'Batata':7003,
  'Camarão':6516,
  'Canela':7348,
  'Carne de Cobra':7922,
  'Carne de Escorpião':7924,
  'Coco':7026,
  'Cogumelo Corcunda':5416,
  'Cogumelo Oriole':5544,
  'Cogumelo Sanghwang':5548,
  'Delotia':5538,
  'Fermento':9005,
  'Ovo':9064,
  'Massa de Trigo':7201,
  'Massa de Milho':7105,
  'Maçã':7313,
  'Lagosta':6511,
  'Pimenta-do-Reino':7301,
  'Pimenta':7305,
  'Carne de Porco':7905,
  'Sal':9001,
  'Sal Desidratado ao Sol':9008,
  'Água Mineral':9059,
  'Manteiga':9063,
  'Tempero':9006,
  'Vinagre':9066,
  'Yuzu':7360,
  'Yuzu Especial':7362,
  'Pão de Teff Esponjoso':9299,
  'Açúcar':9002,
  'Queijo':9062,
  'Azeite de Oliva':9004,
  'Açúcar Mascavo':9009,
  'Carne de Tigre':7959,
  'Cerveja':9213,
};

const GENERIC_SUBSTITUTION_OPTIONS = {
  'Carne': [
    'Carne de Boi','Carne de Cabra','Carne de Cervo','Carne de Doninha','Carne de Gazela','Carne de Guaxinim','Carne de Lobo','Carne de Ovelha','Carne de Porco','Carne de Raposa','Carne de Rinoceronte','Carne de Urso'
  ],
  'Carne de Ave': ['Carne de Pássaro Kuku','Carne de Flamingo','Frango'],
  'Grão': ['Trigo','Cevada','Milho','Batata','Batata Doce'],
  'Farinha': ['Farinha de Trigo','Farinha de Cevada','Farinha de Milho','Farinha de Batata','Farinha de Batata Doce'],
  'Fruta': ['Maçã','Uva','Morango','Figo','Ameixa'],
  'Legume': ['Cebola','Abóbora','Repolho','Páprica','Tomate','Cenoura','Oliva'],
  'Peixe': ['Cantarilho'],
  'Frutos do Mar': ['Lula','Ostra','Camarão','Lagosta'],
};

const GENERIC_SUBSTITUTION_SOURCES = {
  'Carne':'Grupo de substituição de Carnes — use uma carne compatível do Grupo de Itens #6301 (ex.: carne de cervo, gazela, ovelha, raposa, rinoceronte, porco, boi, leão-marinho, coelho, guaxinim, doninha, urso, lobo, cabra ou elefante-rocha).',
  'Carne de Ave':'Grupo de substituição de Aves — use Frango, Carne de Pássaro Kuku, Carne de Flamingo ou Carne de Ave.',
  'Grão':'Grupo de substituição de Grãos — use um grão compatível com a receita; o jogo aplica as regras de qualidade/valor do grupo.',
  'Fruta':'Grupo de substituição de Frutas — use uma fruta compatível com a receita; o jogo aplica as regras de qualidade/valor do grupo.',
  'Legume':'Grupo de substituição de Legumes — use um legume compatível com a receita; o jogo aplica as regras de qualidade/valor do grupo.',
  'Peixe':'Grupo de substituição de Peixes — use um peixe compatível com a receita; a espécie válida depende do grupo de substituição do jogo.',
  'Frutos do Mar':'Grupo de substituição de Frutos do Mar — use um fruto do mar compatível com a receita; a espécie válida depende do grupo de substituição do jogo.',
  'Plantas':'Grupo de substituição de Plantas — use uma planta compatível com a receita e com o grupo de substituição do jogo.'
};

const CULINARY_ICON_OVERRIDES = {
  'Gukbap de Dhal-Bohl':820857,
  'Chá de Delotia':9324,
  'Tempero':9006,
  'Sanduíche Eil':9369,
  'Licor de Yuzu':9351,
  'Churrasco de Marmota':9488,
  'Sanduíche de Cogumelo Arco-Íris':9316,
  'Refeição de Iguarias de Cron':9693,
  'Salgado de Filé de Peixe':9208,
  'Sopa de Frango com Grãos':9494,
  'Ghormeh Sabzi':9486,
  'Molusco Cozido':9479,
  'Salada de Caçador':9459,
  'Vinho Fermentado de Khalk':9469,
  'Kebab de Lagarto':9406,
  'Prato Especial de Frutos do Mar de Margoria':9634,
  'Croquete de Carne':9404,
  'Sanduíche de Carne':9415,
  'Canja de Galinha de Cogumelo Sanghwang':9371,
  'Makgeolli de Cogumelo Sanghwang':9367,
  'Chá com Leite':'cha-com-leite.png',
  'Nokdujeon':820821,
  'Nurungji':9350,
  'Cebola em Conserva Yuzu':9361,
  'Peixe em Conserva':9412,
  'Arroz Frito com Pistache':9217,
  'Salada de Camarão Jumbo':9471,
  'Refeição de Cron de Frutos do Mar':9691,
  'Marisco Grelhado com Manteiga':codexIcon(9421),
  'Salada de Frutos do Mar e Cogumelo':'salada-de-frutos-do-mar-e-cogumelo.png',
  'Macarrão com Frutos do Mar':9413,
  'Chá de Cogumelo Sangjwang fermentada uma única vez':'cha-cogumelo-sangjwang-uma-unica-vez.png',
  'Espetinho de Queijo de Lhama':9490,
  'Filé de Peixe Defumado':9417,
  'Ensopado de Pasta de Soja':820819,
  'Pássaro Cozido':9405,
  'Peixe Cozido':9411,
  'Camarão Jumbo Cozido a Vapor':9473,
  'Frutos do Mar Cozidos':9411,
  'Carne de Baleia Cozida':9455,
  'Refogado de Carne de Ave':9472,
  'Samambaia Frita':9318,
  'Refogado de Carne e Samambaia':9333,
  'Legumes Refogados':9241,
  'Licor de Mel Doce':54030,
  'Chá com Aroma Fino':'cha-com-aroma-fino.png',
  'Pão de Teff':'pao-de-teff.png',
  'Sanduíche Teff':codexIcon(9218),
  'Chá de Cogumelo Sanghwang Coado Duas Vezes':codexIcon(9365),
  'Chá de Cogumelo Sanghwang bem fermentado':codexIcon(9366),
  'Salada de Carne de Baleia':9456,
  'Kimchi Branco':820801,
  'Molho Branco':9003,
  'Jjigaue de Soja':9380,
  'Carne Frita com Cogumelo Oriole':9340,
};

const VARIANT_ITEM_ICONS = {
  'Fármaco da Onda': 'https://bdocodex.com/items/new_icon/03_etc/08_potion/00767693.webp',
  'Fármaco da Onda Azul': 'https://bdocodex.com/items/new_icon/03_etc/08_potion/00767694.webp',
  'Fármaco da Onda Azul Profunda': 'https://bdocodex.com/items/new_icon/03_etc/08_potion/00767695.webp',
  'Fármaco da Raiva': codexIcon(1389), 'Fármaco da Adaptação': codexIcon(1391), 'Fármaco do Potencial': codexIcon(1393), 'Fármaco da Decadência': codexIcon(1395), 'Fármaco da Ira Descontrolada': codexIcon(1397), 'Fármaco da Harmonia': codexIcon(1399),
  'Fármaco da Harmonia - Humano': codexIcon(1401), 'Fármaco da Harmonia - Humanoide': codexIcon(1403), 'Fármaco da Harmonia - Kamasylvia': codexIcon(1405), 'Fármaco da Harmonia - Edania': codexIcon(1407),
  'Imortalidade: Fármaco da Raiva': codexIcon(1390), 'Imortalidade: Fármaco da Adaptação': codexIcon(1392), 'Imortalidade: Fármaco do Potencial': codexIcon(1394), 'Imortalidade: Fármaco da Decadência': codexIcon(1396), 'Imortalidade: Fármaco da Ira Descontrolada': codexIcon(1398), 'Imortalidade: Fármaco da Harmonia': codexIcon(1400),
  'Imortalidade: Fármaco da Harmonia - Humano': codexIcon(1402), 'Imortalidade: Fármaco da Harmonia - Humanoide': codexIcon(1404), 'Imortalidade: Fármaco da Harmonia - Kamasylvia': codexIcon(1406), 'Imortalidade: Fármaco da Harmonia - Edania': codexIcon(1408),
  'Fármaco da Fúria': codexIcon(799), 'Fármaco do Gigante': codexIcon(793), 'Fármaco da Fera': codexIcon(792), 'Fármaco de Barbaridade': codexIcon(794), 'Fármaco do Alvoroço': codexIcon(795), 'Fármaco da Armadura de Aço': codexIcon(798),
  'Imortalidade: Fármaco da Fúria': codexIcon(800), 'Imortalidade: Fármaco do Gigante': codexIcon(801), 'Imortalidade: Fármaco da Fera': codexIcon(802), 'Imortalidade: Fármaco de Barbaridade': codexIcon(803), 'Imortalidade: Fármaco do Alvoroço': codexIcon(804), 'Imortalidade: Fármaco da Armadura de Aço': codexIcon(805)
};

function renderFarmacoCards(item){
  const baseRoute = (item.routes||[]).find(r=>/^receita base$/i.test(r.label||''));
  const immortalRoute = (item.routes||[]).find(r=>/^imortalidade$/i.test(r.label||''));
  const bases = baseRoute?.variants || [];
  const immortals = immortalRoute?.variants || [];
  const immortalByBase = {};
  immortals.forEach(v=>{
    const key = v.title.replace(/^Imortalidade:\s*/i,'').trim();
    immortalByBase[key] = v;
  });

  return bases.map((base, i)=>{
    const imm = immortalByBase[base.title];
    const uid = nextUid();
    const baseInner = base.routes
      ? renderRoutes(base.routes, nextUid(), [item.name, base.title])
      : renderChildren(base.children || [], [item.name, base.title]);
    const immInner = imm
      ? (imm.routes
          ? renderRoutes(imm.routes, nextUid(), [item.name, base.title, 'Imortalidade'])
          : renderChildren(imm.children || [], [item.name, base.title, 'Imortalidade']))
      : '';
    const icon = VARIANT_ITEM_ICONS[base.title] || ROOT_ITEM_ICONS[base.title];
    return `<div class="root-item" data-idx="farmaco-${i}" data-item-name="${escapeHtml(base.title)}" data-item-group="${escapeHtml(item.group)}">
      <div class="root-head">
        <span class="chevron"></span>
        ${icon ? `<img class="root-item-icon" src="${assetIcon(icon)}" alt="" loading="eager" referrerpolicy="no-referrer" onerror="this.onerror=null;this.style.display='none'">` : ''}
        <span class="root-name">${tName(base.title)}</span>
        ${imm ? '<span class="tag">ROTAS</span>' : ''}
        <button type="button" class="export-list-btn" data-export-name="${escapeHtml(base.title)}" data-export-group="${escapeHtml(item.group)}" data-export-payload="${escapeHtml(JSON.stringify(buildExportPayload(base.title, base.effect, base.routes, base.children, imm)))}" aria-label="${SUPPORTS_NATIVE_SHARE?'Compartilhar imagem da lista de ingredientes':'Copiar imagem da lista de ingredientes'}" title="${SUPPORTS_NATIVE_SHARE?'Compartilhar imagem da lista de ingredientes':'Copiar imagem da lista de ingredientes'}">${LC_ICONS.image}</button>
        <button type="button" class="copy-link-btn" data-copy-name="${escapeHtml(base.title)}" data-copy-group="${escapeHtml(item.group)}" aria-label="${SUPPORTS_NATIVE_SHARE?'Compartilhar esta receita':'Copiar link desta receita'}" title="${SUPPORTS_NATIVE_SHARE?'Compartilhar esta receita':'Copiar link desta receita'}">${SUPPORTS_NATIVE_SHARE?LC_ICONS.share:LC_ICONS.link}</button>
      </div>
      <div class="body">
        ${base.effect ? `<div class="root-effect">✨ ${tName(base.effect)}</div>` : ''}
        ${base.note ? `<div class="sub-recipe-note root-note">${translateFreeText(base.note)}</div>` : ''}
        <div class="route-tabs farmaco-route-tabs"><button class="route-tab active" data-uid="${uid}" data-idx="0">Receita base</button>${imm ? `<button class="route-tab" data-uid="${uid}" data-idx="1">Imortalidade</button>` : ''}</div>
        <div class="route-pane active" data-uid="${uid}" data-idx="0">${baseInner}</div>
        ${imm ? `<div class="route-pane" data-uid="${uid}" data-idx="1">${immInner}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

function renderRootShell(item, idx){
  const rawRootIcon = ROOT_ITEM_ICONS[item.name] ?? CULINARY_ICON_OVERRIDES[item.name] ?? CULINARY_ICON_IDS[item.name];
  const rootIcon = rawRootIcon ? (typeof rawRootIcon === 'number' ? codexIcon(rawRootIcon) : rawRootIcon) : '';
  return `<div class="root-item" data-idx="${idx}" data-lazy-root="1" data-item-name="${escapeHtml(item.name)}" data-item-group="${escapeHtml(item.group)}">
    <div class="root-head">
      <span class="chevron"></span>
      ${rootIcon ? `<img class="root-item-icon" src="${assetIcon(rootIcon)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.onerror=null;this.style.display='none'">` : ''}
      <span class="root-name">${tName(item.name)}</span>
      ${item.routes ? `<span class="tag">${currentLang==='es'?'Rutas':'Rotas'}</span>`:''}
      <button type="button" class="export-list-btn" data-export-name="${escapeHtml(item.name)}" data-export-group="${escapeHtml(item.group)}" data-export-payload="${escapeHtml(JSON.stringify(buildExportPayload(item.name, item.effect, item.routes, item.children, null)))}" aria-label="${SUPPORTS_NATIVE_SHARE?'Compartilhar imagem da lista de ingredientes':'Copiar imagem da lista de ingredientes'}" title="${SUPPORTS_NATIVE_SHARE?'Compartilhar imagem da lista de ingredientes':'Copiar imagem da lista de ingredientes'}">${LC_ICONS.image}</button>
      <button type="button" class="copy-link-btn" data-copy-name="${escapeHtml(item.name)}" data-copy-group="${escapeHtml(item.group)}" aria-label="${SUPPORTS_NATIVE_SHARE?'Compartilhar esta receita':'Copiar link desta receita'}" title="${SUPPORTS_NATIVE_SHARE?'Compartilhar esta receita':'Copiar link desta receita'}">${SUPPORTS_NATIVE_SHARE?LC_ICONS.share:LC_ICONS.link}</button>
    </div>
    <div class="body" data-lazy-body="1"></div>
  </div>`;
}

function hydrateRoot(el){
  if(!el || el.dataset.hydrated==='1') return;
  const idx=Number(el.dataset.idx);
  const item=DATA[idx];
  if(!item || item.farmacoGroup) return;
  let inner='';
  if(item.isGroup){
    inner = item.routes ? renderVariantRoutes(item.routes, nextUid(), [item.name]) : renderVariantList(item.variants, [item.name]);
  } else if(item.routes){
    inner = renderRoutes(item.routes, idx, [item.name]);
  } else {
    inner = renderChildren(item.children, [item.name]);
  }
  const body=el.querySelector('[data-lazy-body]');
  if(!body) return;
  body.innerHTML = `${item.effect? `<div class="root-effect">✨ ${item.effect}</div>`:''}${item.note? `<div class="sub-recipe-note root-note">${translateFreeText(item.note)}</div>`:''}${item.source? `<div class="sub-recipe-note root-note">📍 ${currentLang==='es'?translateFreeText(item.source):item.source}</div>`:''}${inner}`;
  el.dataset.hydrated='1';
}

function renderRoot(item, idx){
  if(item.farmacoGroup){
    return renderFarmacoCards(item);
  }
  return renderRootShell(item, idx);
}

function itemMatches(item, q){
  if((item.name.toLowerCase().includes(q) || tName(item.name).toLowerCase().includes(q))) return true;
  if((item.group||'').toLowerCase().includes(q)) return true; // NOVO: Busca pelo nome do grupo também
  
  const scan = (children)=> (children||[]).some(c=>(c.name.toLowerCase().includes(q) || tName(c.name).toLowerCase().includes(q)) || (c.alt && (c.alt.name.toLowerCase().includes(q) || tName(c.alt.name).toLowerCase().includes(q))));
  const scanRoutes = (routes)=> (routes||[]).some(r=> scan(r.children));
  
  if(item.isGroup){
    if(item.routes) return item.routes.some(r=>(r.label||'').toLowerCase().includes(q) || (r.variants||[]).some(v=> v.title.toLowerCase().includes(q) || scan(v.children)));
    return item.variants.some(v=> v.title.toLowerCase().includes(q) || (v.routes? scanRoutes(v.routes) : scan(v.children)));
  }
  if(item.routes) return scanRoutes(item.routes);
  return scan(item.children);
}

const listEl = document.getElementById('list');
const emptyEl = document.getElementById('emptyState');

// ---- Grupos (sidebar) ----
const GROUP_ICONS = { 'Fármacos da Harmonia':'🧪', 'Fármacos Base':'🧪', 'Fármacos Tradicionais':'⚗️', 'Elixires Base':'🧴', 'Sangues':'🩸', 'Perfumes':'🌸', 'Culinária':'🍲', 'Culinária Especial':'✨', 'Rações':'🥕', 'Pergaminhos':'📜', 'Trabalhadores energia':'👷', 'Poções':'🧴', 'Itens Tesouro':'💎' };
Object.assign(GROUP_ICONS, {
  'Agitação': '🌀',
  'Alquimia Simples': '⚗️',
  'Aquecimento': '🔥',
  'Corte': '🪵',
  'Culinária Simples': '🥄',
  'Desidratação': '☀️',
  'Empacotar Alquimia Imperial': '📦',
  'Empacotar Culinária Imperial': '📦',
  'Fábrica': '🏭',
  'Filtragem': '💧',
  'Moagem': '🥣'
});
// =====================================================================
// v107 — Ícones dos itens de Processamento (IDs do BDO Codex)
// =====================================================================
Object.assign(ROOT_ITEM_ICONS, {
  'Abalone': codexIcon(6518),
  'Abalone Desidratado': codexIcon(6523),
  'Adaga Aparadora': codexIcon(10305),
  'Adaga Krea': codexIcon(10324),
  'Adaga Rosar': codexIcon(10325),
  'Adaga de Aço': codexIcon(10304),
  'Adaga de Bronze': codexIcon(10303),
  'Amuleto Anti-Humanoide': codexIcon(10406),
  'Amuleto Bares': codexIcon(10413),
  'Amuleto Kalis': codexIcon(10412),
  'Amuleto Krea': codexIcon(10456),
  'Amuleto Massacrante de Delphad Castillion': codexIcon(10482),
  'Amuleto Massacrante de Delphad Castillion Supremo': codexIcon(10485),
  'Amuleto Rosar': codexIcon(10457),
  'Amuleto Seleth': codexIcon(10407),
  'Amuleto Yuria': codexIcon(10414),
  'Anchova': codexIcon(8298),
  'Anchova Desidratada': codexIcon(8598),
  'Anchova-Azul': codexIcon(8273),
  'Anchova-Azul Desidratada': codexIcon(8573),
  'Anel Bares': codexIcon(12002),
  'Anel Elisha': codexIcon(12004),
  'Anel Hesus': codexIcon(12003),
  'Anel Kalis': codexIcon(12005),
  'Anel Nert': codexIcon(12011),
  'Anel Talis': codexIcon(12006),
  'Anel Yuria': codexIcon(12001),
  'Anel de Bandido': codexIcon(12012),
  'Anel de Bondade': codexIcon(12010),
  'Anel de Coral Azul': codexIcon(12017),
  'Anel de Coral Vermelho': codexIcon(12018),
  'Anel de Diamante Dourado de Laventia': codexIcon(16286),
  'Anel de Diamante Prateado de Laventia': codexIcon(16285),
  'Anel de Laventia': codexIcon(16279),
  'Anel de Ogro': codexIcon(11607),
  'Anel de Ouro de Laventia': codexIcon(16284),
  'Anel de Prata de Laventia': codexIcon(16283),
  'Anis-Estrelado': codexIcon(7019),
  'Arco Longo Anti-Humanoide': codexIcon(10206),
  'Arco Longo Bares': codexIcon(10213),
  'Arco Longo Kalis': codexIcon(10212),
  'Arco Longo Krea': codexIcon(10256),
  'Arco Longo Massacrante de Delphad Castillion': codexIcon(10282),
  'Arco Longo Massacrante de Delphad Castillion Supremo': codexIcon(10285),
  'Arco Longo Rosar': codexIcon(10257),
  'Arco Longo Seleth': codexIcon(10207),
  'Arco Longo Yuria': codexIcon(10214),
  'Arco de Chifre Branco': codexIcon(13104),
  'Arco de Chifre Krea': codexIcon(13124),
  'Arco de Chifre Rosar': codexIcon(13125),
  'Arco de Guerreiro de Chifre Branco': codexIcon(13105),
  'Arco de Guerreiro de Chifre Preto': codexIcon(13103),
  'Arenque': codexIcon(8262),
  'Arenque Desidratado': codexIcon(8562),
  'Arenque Redondo': codexIcon(8264),
  'Arenque Redondo Desidratado': codexIcon(8564),
  'Arenque Redondo Listrado': codexIcon(8265),
  'Arenque Redondo Listrado Desidratado': codexIcon(8565),
  'Aruanã': codexIcon(8242),
  'Aruanã Desidratado': codexIcon(8542),
  'Atka Cavala': codexIcon(8333),
  'Atka Cavala Desidratada': codexIcon(8633),
  'Atum Desidratado': codexIcon(8502),
  'Avambraço Krea': codexIcon(11324),
  'Avambraço Rosar': codexIcon(11325),
  'Avambraço de Couro': codexIcon(11303),
  'Avambraço de Escama': codexIcon(11304),
  'Avambraço de Ferro': codexIcon(11305),
  'Ayu': codexIcon(8243),
  'Ayu Desidratado': codexIcon(8543),
  'Azaleia Real Prata': codexIcon(5402),
  'Azaleia Real Prata Especial': codexIcon(5465),
  'Azaleia Real Prata de Qualidade Alta': codexIcon(5445),
  'Açúcar': codexIcon(9002),
  'Badejo': codexIcon(8266),
  'Badejo Desidratado': codexIcon(8566),
  'Bagre Amarelo': codexIcon(8293),
  'Bagre Amarelo Desidratado': codexIcon(8593),
  'Bagre Ichikawai': codexIcon(8356),
  'Bagre Ichikawai Desidratado': codexIcon(8644),
  'Bagre Listrado': codexIcon(8268),
  'Bagre Listrado Desidratado': codexIcon(8568),
  'Baiacu': codexIcon(8208),
  'Baiacu Desidratado': codexIcon(8508),
  'Baiacu Espinhoso': codexIcon(8331),
  'Baiacu Espinhoso Desidratado': codexIcon(8631),
  'Barbudo-Gigante': codexIcon(8286),
  'Barbudo-Gigante Desidratado': codexIcon(8586),
  'Barra de Acessório de Coral com Jade': codexIcon(4269),
  'Batata Doce Especial': codexIcon(7014),
  'Batata Doce de Alta Qualidade': codexIcon(7009),
  'Batata Especial': codexIcon(7013),
  'Batata de Alta Qualidade': codexIcon(7008),
  'Baú Cheiroso de Cozinha do Cozinheiro Profissional': codexIcon(9808),
  'Baú de Alquimia Precioso do Artesão': codexIcon(9830),
  'Baú de Alquimia Resistente do Especialista': codexIcon(9826),
  'Baú de Alquimia Secreta do Especialista': codexIcon(9825),
  'Baú de Alquimia de Elixir da Mentalidade do Alquimista Hábil': codexIcon(9824),
  'Baú de Alquimia de Elixir da Morte do Mestre': codexIcon(9834),
  'Baú de Alquimia de Elixir das Asas do Alquimista Aprendiz': codexIcon(9820),
  'Baú de Alquimia de Elixir de Amizade do Profissional': codexIcon(9827),
  'Baú de Alquimia de Elixir de Assassino do Artesão': codexIcon(9832),
  'Baú de Alquimia de Elixir de Assassino do Mestre': codexIcon(9841),
  'Baú de Alquimia de Elixir de Caça a Humanoide do Profissional': codexIcon(9828),
  'Baú de Alquimia de Elixir de Ceifador do Artesão': codexIcon(9829),
  'Baú de Alquimia de Elixir de Detecção do Mestre': codexIcon(9833),
  'Baú de Alquimia de Elixir de Energia do Alquimista Hábil': codexIcon(9823),
  'Baú de Alquimia de Elixir de Frenesi do Mestre': codexIcon(9836),
  'Baú de Alquimia de Elixir de Mão Dourada do Mestre': codexIcon(9835),
  'Baú de Alquimia de Elixir de Perfuração do Mestre': codexIcon(9840),
  'Baú de Alquimia de Elixir do Céu do Artesão': codexIcon(9831),
  'Baú de Alquimia de Elixir do Selo Ágil do Alquimista Hábil': codexIcon(9821),
  'Baú de Alquimia do Aprendiz': codexIcon(9819),
  'Baú de Culinária de Biscoito de Colmeia do Artesão': codexIcon(9816),
  'Baú de Culinária de Bolinho Deserto do Artesão': codexIcon(9813),
  'Baú de Culinária de Carne do Cozinheiro Profisional': codexIcon(9815),
  'Baú de Culinária de Chá Mate do Mestre': codexIcon(9817),
  'Baú de Culinária de Chá com Leite do Mestre': codexIcon(9838),
  'Baú de Culinária de Croquete de Carne do Artesão': codexIcon(9811),
  'Baú de Culinária de Filé de Peixe do Cozinheiro Hábil': codexIcon(9805),
  'Baú de Culinária de Licor de Mel do Artesão': codexIcon(9814),
  'Baú de Culinária de Macarrão de Frutos do Mar de Artesão': codexIcon(9809),
  'Baú de Culinária de Omelete do Cozinheiro Profissional': codexIcon(9810),
  'Baú de Culinária de Ovo Cozido de Pássaro do Cozinheiro Aprendiz': codexIcon(9803),
  'Baú de Culinária de Peixe Frito do Cozinheiro Aprendiz': codexIcon(9801),
  'Baú de Culinária de Pudim Escuro do Mestre': codexIcon(9818),
  'Baú de Culinária de Pudim de Frutas do Cozinheiro Hábil': codexIcon(9806),
  'Baú de Culinária de Pão Macio do Cozinheiro Hábil': codexIcon(9804),
  'Baú de Culinária de Queijo Gratinado do Artesão': codexIcon(9812),
  'Baú de Culinária de Sanduíche de Carne do Mestre': codexIcon(9837),
  'Baú de Culinária de Sanduíche de Presunto do Mestre': codexIcon(9839),
  'Baú de Culinária de Sopa de Carne do Cozinheiro Hábil': codexIcon(9802),
  'Baú de Culinária de Torta de Carne do Cozinheiro Profissional': codexIcon(9807),
  'Baú de Laventia Brilhante': codexIcon(16289),
  'Baú de Laventia Chique': codexIcon(16288),
  'Baú de Laventia Resplandecente': codexIcon(16287),
  'Baú de Tamareira Bem Desidratada': codexIcon(55877),
  'Benevolente de Margoria': codexIcon(4084),
  'Berloque Krea': codexIcon(13024),
  'Berloque Rosar': codexIcon(13025),
  'Berloque de Agulha': codexIcon(13004),
  'Berloque de Incenso': codexIcon(13003),
  'Berloque de Lâmina': codexIcon(13005),
  'Bife': codexIcon(9401),
  'Biscoito de Colmeia': codexIcon(9266),
  'Bleeker': codexIcon(8254),
  'Bleeker Desidratado': codexIcon(8554),
  'Bodião-Xadrez': codexIcon(8304),
  'Bodião-Xadrez Desidratado': codexIcon(8604),
  'Bonito': codexIcon(8230),
  'Bonito Desidratado': codexIcon(8530),
  'Bramidae': codexIcon(8305),
  'Bramidae Desidratado': codexIcon(8605),
  'Brilhante Listrado': codexIcon(8288),
  'Brilhante Listrado Desidratado': codexIcon(8588),
  'Brinco Bares': codexIcon(11802),
  'Brinco Elisha': codexIcon(11804),
  'Brinco Hesus': codexIcon(11803),
  'Brinco Kalis': codexIcon(11805),
  'Brinco Mesto': codexIcon(11810),
  'Brinco Ridell': codexIcon(11811),
  'Brinco Talis': codexIcon(11806),
  'Brinco Yuria': codexIcon(11801),
  'Brinco de Bruxa': codexIcon(11808),
  'Brinco de Coral Azul': codexIcon(11816),
  'Brinco de Coral Vermelho': codexIcon(11817),
  'Bótia Cara-de-Cavalo': codexIcon(8352),
  'Bótia Cara-de-Cavalo Desidratado': codexIcon(8640),
  'Cabeça-de-Cobra Desidratado': codexIcon(8521),
  'Caixa de Presente de Feriado': codexIcon(9842),
  'Cajado Anti-Humanoide': codexIcon(14406),
  'Cajado Bares': codexIcon(14413),
  'Cajado Kalis': codexIcon(14412),
  'Cajado Krea': codexIcon(14456),
  'Cajado Massacrante de Delphad Castillion': codexIcon(14482),
  'Cajado Massacrante de Delphad Castillion Supremo': codexIcon(14485),
  'Cajado Rosar': codexIcon(14457),
  'Cajado Seleth': codexIcon(14407),
  'Cajado Yuria': codexIcon(14414),
  'Calamar Desidratado': codexIcon(8511),
  'Cantarilho Desidratado': codexIcon(8510),
  'Caranguejo Desidratado': codexIcon(8513),
  'Cardume': codexIcon(8253),
  'Cardume Desidratado': codexIcon(8553),
  'Carne-Seca Bem Seca': codexIcon(7919),
  'Carne-Seca Perfumada': codexIcon(7918),
  'Carne-Seca Rara': codexIcon(7920),
  'Carpa Couro': codexIcon(8287),
  'Carpa Couro Desidratada': codexIcon(8587),
  'Carpa Cruciana': codexIcon(8217),
  'Carpa Rosada': codexIcon(8295),
  'Carpa Rosada Desidratada': codexIcon(8595),
  'Cavalinha': codexIcon(8228),
  'Cavalinha Desidratada': codexIcon(8528),
  'Cavalo Marinho Desidratado': codexIcon(8532),
  'Cavalo-Marinho': codexIcon(8232),
  'Cero': codexIcon(8256),
  'Cero Desidratado': codexIcon(8556),
  'Cevada Especial': codexIcon(7012),
  'Cevada de Alta Qualidade': codexIcon(7007),
  'Charuteiro Desidratado': codexIcon(8506),
  'Chá Sute': codexIcon(9207),
  'Chá de Anis-Estrelado': codexIcon(9306),
  'Cinto Bares': codexIcon(12202),
  'Cinto Elisha': codexIcon(12204),
  'Cinto Gartner': codexIcon(12212),
  'Cinto Hesus': codexIcon(12203),
  'Cinto Kalis': codexIcon(12205),
  'Cinto Talis': codexIcon(12206),
  'Cinto Yuria': codexIcon(12201),
  'Cinto de Elite de Rhutum': codexIcon(12208),
  'Cinto de Gladiador Shultz': codexIcon(12211),
  'Cinto de Rhutum': codexIcon(12207),
  'Cinto do Espírito da Árvore': codexIcon(12210),
  'Cogumelo Ganoderma': codexIcon(5514),
  'Colar Bares': codexIcon(11602),
  'Colar Elisha': codexIcon(11604),
  'Colar Hesus': codexIcon(11603),
  'Colar Kalis': codexIcon(11605),
  'Colar Scarla': codexIcon(11610),
  'Colar Talis': codexIcon(11606),
  'Colar Yuria': codexIcon(11601),
  'Colar de Bensho': codexIcon(11611),
  'Colar de Bondade': codexIcon(11609),
  'Coral Azul Aurora': codexIcon(4479),
  'Coral Branco': codexIcon(6506),
  'Coral Branco Ventoso': codexIcon(6526),
  'Coral Dourado': codexIcon(6505),
  'Coral Dourado Solar': codexIcon(6525),
  'Coral Verde': codexIcon(6504),
  'Coral Verde de Pradaria': codexIcon(6524),
  'Coral Vermelho-Crepúsculo': codexIcon(4478),
  'Coração de Vell': codexIcon(45332),
  'Corcel Desidratado': codexIcon(8589),
  'Corvina': codexIcon(8258),
  'Corvina Amarela': codexIcon(8456),
  'Corvina Desidratada': codexIcon(8558),
  'Corça': codexIcon(8300),
  'Corça Desidratada': codexIcon(8600),
  'Couro de Cervo': codexIcon(6001),
  'Couro de Cobra': codexIcon(6019),
  'Couro de Dinossauro': codexIcon(6007),
  'Couro de Doninha': codexIcon(6012),
  'Couro de Dragão Guepardo': codexIcon(6016),
  'Couro de Elefante': codexIcon(6026),
  'Couro de Gazela': codexIcon(6023),
  'Couro de Guaxinim': codexIcon(6010),
  'Couro de Lagarto': codexIcon(6008),
  'Couro de Leão': codexIcon(6020),
  'Couro de Lobo': codexIcon(6014),
  'Couro de Lobo Plumado': codexIcon(6021),
  'Couro de Macaco': codexIcon(6011),
  'Couro de Minhoca': codexIcon(6009),
  'Couro de Ovelha': codexIcon(6002),
  'Couro de Pantera Negra': codexIcon(6022),
  'Couro de Porco': codexIcon(6005),
  'Couro de Raposa': codexIcon(6003),
  'Couro de Rinoceronte': codexIcon(6004),
  'Couro de Waragon': codexIcon(6015),
  'Cristal Mágico Ancestral - Addis': codexIcon(15649),
  'Cristal Mágico Ancestral - Carmae': codexIcon(768801),
  'Cristal Mágico Ancestral - Cobelinus': codexIcon(768798),
  'Cristal Mágico Ancestral - Harpia': codexIcon(768797),
  'Cristal Mágico Ancestral - Hystria': codexIcon(768800),
  'Cristal Mágico Ancestral - Víbora': codexIcon(768799),
  'Cristal Mágico Ancestral da Chama Carmesim - Poder': codexIcon(768802),
  'Cristal Mágico Negro - Adamantina': codexIcon(15212),
  'Cristal Mágico Negro - Addis': codexIcon(15650),
  'Cristal Mágico Negro - Agilidade': codexIcon(15224),
  'Cristal Mágico Negro - Armadura': codexIcon(15206),
  'Cristal Mágico Negro - Ascensão': codexIcon(15213),
  'Cristal Mágico Negro - Assalto': codexIcon(15216),
  'Cristal Mágico Negro - Carmae': codexIcon(768814),
  'Cristal Mágico Negro - Cobelinus': codexIcon(15629),
  'Cristal Mágico Negro - Cura': codexIcon(15209),
  'Cristal Mágico Negro - Energia': codexIcon(15215),
  'Cristal Mágico Negro - Harpia': codexIcon(15628),
  'Cristal Mágico Negro - Hystria': codexIcon(15631),
  'Cristal Mágico Negro - Intimidação': codexIcon(15222),
  'Cristal Mágico Negro - Memória': codexIcon(15221),
  'Cristal Mágico Negro - Mira': codexIcon(15219),
  'Cristal Mágico Negro - Paciência': codexIcon(15208),
  'Cristal Mágico Negro - Potência': codexIcon(15202),
  'Cristal Mágico Negro - Precisão': codexIcon(15201),
  'Cristal Mágico Negro - Queda': codexIcon(15214),
  'Cristal Mágico Negro - Rapidez': codexIcon(15211),
  'Cristal Mágico Negro - Ressonância': codexIcon(15210),
  'Cristal Mágico Negro - Robustez': codexIcon(15217),
  'Cristal Mágico Negro - Valor': codexIcon(15218),
  'Cristal Mágico Negro - Vigor': codexIcon(15207),
  'Cristal Mágico Negro - Víbora': codexIcon(15630),
  'Cristal de Espírito Ancestral - Rapidez': codexIcon(15641),
  'Cristal de Espírito Ancestral - Valor': codexIcon(15652),
  'Cristal de Espírito Ancestral - Víbora': codexIcon(15653),
  'Cristal de Espírito Negro': codexIcon(15626),
  'Cristal do Campo de Batalha Vermelho: Addis': codexIcon(15651),
  'Cristal do Campo de Batalha Vermelho: Carmae': codexIcon(15638),
  'Cristal do Campo de Batalha Vermelho: Cobelinus': codexIcon(15635),
  'Cristal do Campo de Batalha Vermelho: Harpia': codexIcon(15634),
  'Cristal do Campo de Batalha Vermelho: Hystria': codexIcon(15637),
  'Cristal do Campo de Batalha Vermelho: Potência': codexIcon(15639),
  'Cristal do Campo de Batalha Vermelho: Víbora': codexIcon(15636),
  'Cristal do Espírito Desperto': codexIcon(15627),
  'Cristal do Espírito Red': codexIcon(15633),
  'Croquete de Carne': codexIcon(9404),
  'Cágado': codexIcon(8244),
  'Diamante Grande de Laventia': codexIcon(16282),
  'Dourado-do-Mar': codexIcon(8267),
  'Dourado-do-Mar Desidratado': codexIcon(8567),
  'Elmo Crewhorn': codexIcon(11523),
  'Elmo do Devorador': codexIcon(11527),
  'Embiotocidae': codexIcon(8274),
  'Embiotocidae Desidratado': codexIcon(8574),
  'Enfeito de Cristal do Vento': codexIcon(40427),
  'Enguia de Água Doce': codexIcon(8220),
  'Enguia de Água Doce Desidratada': codexIcon(8520),
  'Enguia do Mar': codexIcon(8257),
  'Enguia do Mar Desidratada': codexIcon(8557),
  'Ensopado de Carne': codexIcon(9414),
  'Erva Aurora Especial': codexIcon(5464),
  'Erva Aurora de Alta Qualidade': codexIcon(5444),
  'Erva Daninha': codexIcon(5600),
  'Erva Eterna': codexIcon(5406),
  'Erva Eterna Especial': codexIcon(5469),
  'Erva Eterna de Qualidade Alta': codexIcon(5449),
  'Escudo Axion': codexIcon(10103),
  'Escudo Kite': codexIcon(10105),
  'Escudo Krea': codexIcon(10124),
  'Escudo Vangertz': codexIcon(10102),
  'Espada Curta Anti-Humanoide': codexIcon(13206),
  'Espada Curta Bares': codexIcon(13213),
  'Espada Curta Kalis': codexIcon(13212),
  'Espada Curta Krea': codexIcon(13256),
  'Espada Curta Massacrante de Delphad Castillion': codexIcon(13282),
  'Espada Curta Massacrante de Delphad Castillion Suprema': codexIcon(13285),
  'Espada Curta Rosar': codexIcon(13257),
  'Espada Curta Seleth': codexIcon(13207),
  'Espada Curta Yuria': codexIcon(13214),
  'Espada Longa Anti-Humanoide': codexIcon(10006),
  'Espada Longa Bares': codexIcon(10013),
  'Espada Longa Kalis': codexIcon(10012),
  'Espada Longa Krea': codexIcon(10056),
  'Espada Longa Massacrante de Delphad Castillion': codexIcon(10082),
  'Espada Longa Massacrante de Delphad Castillion Suprema': codexIcon(10085),
  'Espada Longa Rosar': codexIcon(10057),
  'Espada Longa Seleth': codexIcon(10007),
  'Espada Longa Yuria': codexIcon(10014),
  'Esparideo Desidratado': codexIcon(8507),
  'Esperlano Desidratado': codexIcon(8594),
  'Essência Espiritual da Terra': codexIcon(9314),
  'Essência Espiritual da Água': codexIcon(9315),
  'Essência Espiritual do Vento': codexIcon(9313),
  'Essência Negra': codexIcon(4996),
  'Essência Negra - Addis': codexIcon(4988),
  'Essência Negra - Carmae': codexIcon(4995),
  'Essência Negra - Cobelinus': codexIcon(4992),
  'Essência Negra - Cristal de Espírito Negro': codexIcon(4990),
  'Essência Negra - Harpia': codexIcon(4991),
  'Essência Negra - Hystria': codexIcon(4994),
  'Essência Negra - Víbora': codexIcon(4993),
  'Essência Vermelha': codexIcon(4989),
  'Estelano': codexIcon(8294),
  'Estrala do Mar de Diamante': codexIcon(6514),
  'Estrela do Mar': codexIcon(55933),
  'Estrela do Mar Desidratadas': codexIcon(8533),
  'Esturjão Desidratado': codexIcon(8538),
  'Feno Cauda de Pedra': codexIcon(50804),
  'Ferramenta de Reparo de Couro': codexIcon(40426),
  'Fio Dourado': codexIcon(8270),
  'Flor Escama de Fogo Especial': codexIcon(5466),
  'Flor Escama de Fogo de Qualidade Alta': codexIcon(5446),
  'Fragmento da Pedra Espiritual da Terra': codexIcon(44305),
  'Fragmento da Pedra Espiritual da Água': codexIcon(44306),
  'Fragmento da Pedra Espiritual da Árvore': codexIcon(44311),
  'Fragmento da Pedra Espiritual do Vento': codexIcon(44304),
  'Fragmento de Aço Derretido de Saunil': codexIcon(40428),
  'Fragmento de Aço de Targark': codexIcon(40434),
  'Fragmento de Coral': codexIcon(6501),
  'Fragmento de Magia': codexIcon(4918),
  'Fruta Imatura': codexIcon(9720),
  'Fruta Incomum': codexIcon(9723),
  'Fura-Vasos': codexIcon(8285),
  'Fura-Vasos Desidratado': codexIcon(8585),
  'Galeota': codexIcon(8338),
  'Galeota Desidratada': codexIcon(8638),
  'Garoupa': codexIcon(8284),
  'Garoupa Desidratada': codexIcon(8584),
  'Gobião Desidratado': codexIcon(8501),
  'Grama Mel de Seda Especial': codexIcon(5468),
  'Grama Mel de Seda de Qualidade Alta': codexIcon(5448),
  'Grama Selvagem': codexIcon(5439),
  'Guaravira': codexIcon(8203),
  'Guaravira Desidratado': codexIcon(8503),
  'Gunnel': codexIcon(8269),
  'Gunnel Desidratado': codexIcon(8569),
  'Hifa Misteriosa de Cogumelo Amanita': codexIcon(6891),
  'Hifa Misteriosa de Cogumelo Ancestral': codexIcon(6890),
  'Hifa Misteriosa de Cogumelo Anão': codexIcon(6881),
  'Hifa Misteriosa de Cogumelo Blefista': codexIcon(6889),
  'Hifa Misteriosa de Cogumelo Corcunda': codexIcon(6888),
  'Hifa Misteriosa de Cogumelo Céu': codexIcon(6883),
  'Hifa Misteriosa de Cogumelo Fantasma': codexIcon(6886),
  'Hifa Misteriosa de Cogumelo Flecha': codexIcon(6880),
  'Hifa Misteriosa de Cogumelo Imperador': codexIcon(6885),
  'Hifa Misteriosa de Cogumelo Nevoeiro': codexIcon(6887),
  'Hifa Misteriosa de Cogumelo Nuvem': codexIcon(6882),
  'Hifa Misteriosa de Cogumelo Ramalhete': codexIcon(6896),
  'Hifa Misteriosa de Cogumelo Roxo': codexIcon(6898),
  'Hifa Misteriosa de Cogumelo Tigre': codexIcon(6884),
  'Hifa Misteriosa de Cogumelo Torta': codexIcon(6899),
  'Hifa Misteriosa de Cogumelo Vidente': codexIcon(6879),
  'Hifa Misteriosa de Leccinum': codexIcon(6897),
  'Hifa Misteriosa de Trufa': codexIcon(6892),
  'Hifa de Cogumelo Amanita Especial': codexIcon(6990),
  'Hifa de Cogumelo Ancestral Especial': codexIcon(6989),
  'Hifa de Cogumelo Anão Especial': codexIcon(6980),
  'Hifa de Cogumelo Blefista Especial': codexIcon(6988),
  'Hifa de Cogumelo Corcunda Especial': codexIcon(6987),
  'Hifa de Cogumelo Céu Especial': codexIcon(6982),
  'Hifa de Cogumelo Fantasma Especial': codexIcon(6985),
  'Hifa de Cogumelo Flecha Especial': codexIcon(6979),
  'Hifa de Cogumelo Imperador Especial': codexIcon(6984),
  'Hifa de Cogumelo Nuvem Especial': codexIcon(6981),
  'Hifa de Cogumelo Névoa Especial': codexIcon(6986),
  'Hifa de Cogumelo Ramalhete Especial': codexIcon(6995),
  'Hifa de Cogumelo Roxo Especial': codexIcon(6997),
  'Hifa de Cogumelo Tigre Especial': codexIcon(6983),
  'Hifa de Cogumelo Torta Especial': codexIcon(6998),
  'Hifa de Cogumelo Vidente Especial': codexIcon(6978),
  'Hifa de Leccinum Especial': codexIcon(6996),
  'Hifa deTrufa Especial': codexIcon(6991),
  'Hwando Anti-Humanoide': codexIcon(13306),
  'Hwando Bares': codexIcon(13313),
  'Hwando Kalis': codexIcon(13312),
  'Hwando Krea': codexIcon(13356),
  'Hwando Massacrante de Delphad Castillion': codexIcon(13382),
  'Hwando Massacrante de Delphad Castillion Supremo': codexIcon(13385),
  'Hwando Rosar': codexIcon(13357),
  'Hwando Seleth': codexIcon(13307),
  'Hwando Yuria': codexIcon(13314),
  'Kriegsmesser Anti-Humanoide': codexIcon(11356),
  'Kriegsmesser Bares': codexIcon(11363),
  'Kriegsmesser Kalis': codexIcon(11362),
  'Kriegsmesser Krea': codexIcon(11370),
  'Kriegsmesser Massacrate de Delphad Castillion': codexIcon(11432),
  'Kriegsmesser Massacrate de Delphad Castillion Supremo': codexIcon(11435),
  'Kriegsmesser Rosar': codexIcon(11371),
  'Kriegsmesser Seleth': codexIcon(11357),
  'Kriegsmesser Yuria': codexIcon(11364),
  'Kuhlia Marginata': codexIcon(8299),
  'Kuhlia Marginata Desidratada': codexIcon(8599),
  'Kunai Estique': codexIcon(14504),
  'Kunai Krea': codexIcon(14524),
  'Kunai Quitar': codexIcon(14503),
  'Kunai Rosar': codexIcon(14525),
  'Kunai Tadd': codexIcon(14505),
  'Lagosta Desidratada': codexIcon(6521),
  'Lagostim': codexIcon(8246),
  'Lagostim Desidratado': codexIcon(8546),
  'Lenok': codexIcon(8241),
  'Lenok Desidratado': codexIcon(8541),
  'Licor de Mel': codexIcon(9206),
  'Linguado': codexIcon(8204),
  'Linguado Desidratado': codexIcon(8504),
  'Lorcha': codexIcon(8259),
  'Lorcha Desidratada': codexIcon(8559),
  'Lula Desidratada': codexIcon(8634),
  'Luva de Cristal do Vento': codexIcon(11528),
  'Luvas de Ceasar': codexIcon(11525),
  'Línguado Desidratado': codexIcon(8504),
  'Macarrão com Frutos do Mar': codexIcon(9413),
  'Machado Anti-Humanoide': codexIcon(10606),
  'Machado Bares': codexIcon(10613),
  'Machado Kalis': codexIcon(10612),
  'Machado Krea': codexIcon(10656),
  'Machado Massacrante de Delphad Castillion': codexIcon(10682),
  'Machado Massacrante de Delphad Castillion Supremo': codexIcon(10685),
  'Machado Rosar': codexIcon(10657),
  'Machado Seleth': codexIcon(10607),
  'Machado Yuria': codexIcon(10614),
  'Madeira Compensada Revestida de Pinheiro': codexIcon(4691),
  'Manopla Anti-Humanoide': codexIcon(11206),
  'Manopla Bares': codexIcon(11251),
  'Manopla Kalis': codexIcon(11212),
  'Manopla Krea': codexIcon(11220),
  'Manopla Massacrante de Delphad Castillion': codexIcon(11282),
  'Manopla Massacrante de Delphad Castillion Supremo': codexIcon(11286),
  'Manopla Rosar': codexIcon(11221),
  'Manopla Seleth': codexIcon(11207),
  'Manopla Yuria': codexIcon(11214),
  'Maomao': codexIcon(8277),
  'Maomao Desidratado': codexIcon(8577),
  'Marca da Sombra': codexIcon(12007),
  'Marisco Desidratado': codexIcon(8515),
  'Marisco de Pérola Desidratado': codexIcon(6520),
  'Material de Reparo de Navio': codexIcon(4688),
  'Milho Especial': codexIcon(7015),
  'Milho de Alta Qualidade': codexIcon(7010),
  'Minério de Chumbo': codexIcon(4002),
  'Minério de Cobre': codexIcon(4003),
  'Minério de Estanho': codexIcon(4004),
  'Minério de Ferro': codexIcon(4001),
  'Minério de Ferrugem': codexIcon(4011),
  'Minério de Ouro': codexIcon(4202),
  'Minério de Platina': codexIcon(4203),
  'Minério de Prata': codexIcon(4201),
  'Minério de Titânio': codexIcon(4009),
  'Minério de Vanádio': codexIcon(4008),
  'Minério de Zinco': codexIcon(4005),
  'Molusco Rei de Pérola': codexIcon(6509),
  'Moréia': codexIcon(8329),
  'Moréia Desidratada': codexIcon(8629),
  'Nó Ornamental Krea': codexIcon(10724),
  'Nó Ornamental Rosar': codexIcon(10725),
  'Nó Ornamental Saiyer': codexIcon(10703),
  'Nó Ornamental Theos': codexIcon(10705),
  'Nó Ornamental de Oros': codexIcon(10704),
  'Núcleo do Guardião Ancestral': codexIcon(12220),
  'Olho de Boi': codexIcon(8206),
  'Omelete': codexIcon(9269),
  'Ouro Aluvial': codexIcon(4902),
  'Pacu': codexIcon(8292),
  'Pacu Desidratado': codexIcon(8592),
  'Palheiro': codexIcon(7023),
  'Pedra de Refinamento de Arma Nível 3': codexIcon(4910),
  'Pedra de Refinamento de Armadura Nível 3': codexIcon(4911),
  'Peixe Branco': codexIcon(8261),
  'Peixe Branco Desidratado': codexIcon(8561),
  'Peixe Chato': codexIcon(8260),
  'Peixe Chato Desidratado': codexIcon(8560),
  'Peixe Chifre': codexIcon(8336),
  'Peixe Chifre Desidratado': codexIcon(8636),
  'Peixe Dace': codexIcon(8247),
  'Peixe Dace Desidratado': codexIcon(8547),
  'Peixe Dourado Desidratado': codexIcon(8570),
  'Peixe Encarnado Desidratado': codexIcon(8516),
  'Peixe Eoreumchi': codexIcon(8351),
  'Peixe Eoreumchi Desidratado': codexIcon(8639),
  'Peixe Frito': codexIcon(9407),
  'Peixe Kumgang-Mochi': codexIcon(8353),
  'Peixe Kumgang-Mochi Desidratado': codexIcon(8641),
  'Peixe Olho de Bolha': codexIcon(8291),
  'Peixe Olho de Bolha Desidratado': codexIcon(8591),
  'Peixe Phoxinus': codexIcon(8355),
  'Peixe Phoxinus Desidratado': codexIcon(8643),
  'Peixe Saury': codexIcon(8335),
  'Peixe Saury Desidratado': codexIcon(8635),
  'Peixe Tartaruga Desidratado': codexIcon(8544),
  'Peixe Vermelho Desidratado': codexIcon(8583),
  'Peixe Voador': codexIcon(8229),
  'Peixe Voador Desidratado': codexIcon(8529),
  'Peixe de Cauda Redonda': codexIcon(8296),
  'Peixe de Cauda Redonda Desidratado': codexIcon(8596),
  'Peixe-Amargor': codexIcon(8290),
  'Peixe-Amargor Desidratado': codexIcon(8590),
  'Peixe-Aranha': codexIcon(8279),
  'Peixe-Aranha Desidratado': codexIcon(8579),
  'Peixe-Azul': codexIcon(8248),
  'Peixe-Azul Desidratado': codexIcon(8548),
  'Peixe-Borboleta': codexIcon(8301),
  'Peixe-Borboleta Desidratado': codexIcon(8601),
  'Peixe-Donzela': codexIcon(8223),
  'Peixe-Donzela Amarelo Defumado': codexIcon(8276),
  'Peixe-Donzela Amarelo Defumado Desidratado': codexIcon(8576),
  'Peixe-Donzela Desidratado': codexIcon(8523),
  'Peixe-Escorpião': codexIcon(8235),
  'Peixe-Espada': codexIcon(8227),
  'Peixe-Espada Desidratado': codexIcon(8527),
  'Peixe-Espada Preto': codexIcon(8275),
  'Peixe-Espada Preto Desidratado': codexIcon(8575),
  'Peixe-Galo': codexIcon(8281),
  'Peixe-Galo Desidratado': codexIcon(8581),
  'Peixe-Gato': codexIcon(8219),
  'Peixe-Lama': codexIcon(8251),
  'Peixe-Lama Desidratado': codexIcon(8551),
  'Peixe-Lua': codexIcon(8224),
  'Peixe-Lua Desidratado': codexIcon(8524),
  'Peixe-Mandarim': codexIcon(8240),
  'Peixe-Mandarim Desidratado': codexIcon(8540),
  'Peixe-Mandíbula': codexIcon(8250),
  'Peixe-Mandíbula Desidratado': codexIcon(8550),
  'Peixe-Palhaço': codexIcon(8302),
  'Peixe-Palhaço Desidratado': codexIcon(8602),
  'Peixe-Porco': codexIcon(8234),
  'Peixe-Porco Desidratado': codexIcon(8534),
  'Peixe-Prata': codexIcon(8337),
  'Peixe-Prata Desidratado': codexIcon(8637),
  'Peixe-Telha': codexIcon(8330),
  'Peixe-Telha Desidratado': codexIcon(8630),
  'Pena Suave de Pássaro Kuku': codexIcon(6017),
  'Pena de Flamingo': codexIcon(6018),
  'Penas de Grifo': codexIcon(6024),
  'Piranha': codexIcon(8239),
  'Piranha Desidratada': codexIcon(8539),
  'Planta Juba de Leão Especial': codexIcon(5467),
  'Planta Juba de Leão de Alta Qualidade': codexIcon(5447),
  'Planta Mutante': codexIcon(9719),
  'Planta com Raiz Apodrecida': codexIcon(9722),
  'Pluma Suave de Ferri': codexIcon(6025),
  'Poder Mágico Concentrado de Vell': codexIcon(44335),
  'Polegar-de-Moleiro': codexIcon(8255),
  'Polegar-de-Moleiro Desidratado': codexIcon(8555),
  'Poleiro': codexIcon(8249),
  'Poleiro Desidratado': codexIcon(8549),
  'Polvo Desidratado': codexIcon(8512),
  'Promessa de Amizade': codexIcon(11807),
  'Pudim de Fruta': codexIcon(9259),
  'Pão Macio': codexIcon(9260),
  'Pérola Ancestral': codexIcon(16290),
  'Pó de Ouro de Laventia': codexIcon(16281),
  'Pó de Prata de Laventia': codexIcon(16280),
  'Queijo Gratinado': codexIcon(9203),
  'Raia Desidratada': codexIcon(8531),
  'Rascasso Desidratado': codexIcon(8535),
  'Ração de Galinha': codexIcon(7028),
  'Robalo Desidratado': codexIcon(8545),
  'Robalo do Mar': codexIcon(8225),
  'Robalo do Mar Desidratado': codexIcon(8525),
  'Roedora': codexIcon(8271),
  'Roedora Desidratada': codexIcon(8571),
  'Roupa Resgatada': codexIcon(42370),
  'Salmon Desidratado': codexIcon(8505),
  'Salmão Cereja': codexIcon(8222),
  'Salmão Cereja Desidratado': codexIcon(8522),
  'Sanduíche de Carne': codexIcon(9415),
  'Sanduíche de Presunto': codexIcon(9267),
  'Sangue Pegajoso': codexIcon(40424),
  'Sapato de Amerigo': codexIcon(11526),
  'Sapato de Aventureiro Habilidoso': codexIcon(11529),
  'Sardinha': codexIcon(8263),
  'Sardinha Desidratada': codexIcon(8563),
  'Sargentinho': codexIcon(8278),
  'Sargentinho Desidratado': codexIcon(8578),
  'Saurel Desidratado': codexIcon(8509),
  'Scincus': codexIcon(8282),
  'Scincus Desidratado': codexIcon(8582),
  'Sebastes': codexIcon(8283),
  'Selo de Guardião Ancestral': codexIcon(11613),
  'Semente Comida por Pássaro': codexIcon(9721),
  'Semente Especial de Batata Doce': codexIcon(6830),
  'Semente Misteriosa de Abóbora': codexIcon(6855),
  'Semente Misteriosa de Acácia': codexIcon(6900),
  'Semente Misteriosa de Alho': codexIcon(6852),
  'Semente Misteriosa de Azaleia Real Prata': codexIcon(6874),
  'Semente Misteriosa de Azeitona': codexIcon(6860),
  'Semente Misteriosa de Batata': codexIcon(6863),
  'Semente Misteriosa de Batata Doce': codexIcon(6867),
  'Semente Misteriosa de Cebola': codexIcon(6853),
  'Semente Misteriosa de Cenoura': codexIcon(6856),
  'Semente Misteriosa de Cevada': codexIcon(6864),
  'Semente Misteriosa de Dalvenia Alrea': codexIcon(6895),
  'Semente Misteriosa de Erva Aurora': codexIcon(6873),
  'Semente Misteriosa de Erva Eterna': codexIcon(6878),
  'Semente Misteriosa de Flor de Escama de Fogo': codexIcon(6875),
  'Semente Misteriosa de Girassol': codexIcon(6859),
  'Semente Misteriosa de Grama Mel de Seda': codexIcon(6877),
  'Semente Misteriosa de Milho': codexIcon(6866),
  'Semente Misteriosa de Morango': codexIcon(6857),
  'Semente Misteriosa de Nolina': codexIcon(6893),
  'Semente Misteriosa de Penestraria': codexIcon(6894),
  'Semente Misteriosa de Pimenta': codexIcon(6854),
  'Semente Misteriosa de Pimenta-do-Reino': codexIcon(6851),
  'Semente Misteriosa de Pimentão': codexIcon(6862),
  'Semente Misteriosa de Planta Juba de Leão': codexIcon(6876),
  'Semente Misteriosa de Tomate': codexIcon(6861),
  'Semente Misteriosa de Trigo': codexIcon(6865),
  'Semente Misteriosa de Uva': codexIcon(6858),
  'Semente de Abóbora Especial': codexIcon(6722),
  'Semente de Acácia Especial': codexIcon(7000),
  'Semente de Alho Especial': codexIcon(6718),
  'Semente de Azaleia Real Prata Especial': codexIcon(6973),
  'Semente de Azeitona Especial': codexIcon(6823),
  'Semente de Batata Especial': codexIcon(6826),
  'Semente de Cebola Especial': codexIcon(6719),
  'Semente de Cenoura Especial': codexIcon(6723),
  'Semente de Cevada Especial': codexIcon(6827),
  'Semente de Dalvenia Alrea Especial': codexIcon(6994),
  'Semente de Erva Aurora Especial': codexIcon(6972),
  'Semente de Erva Eterna Especial': codexIcon(6977),
  'Semente de Flor Escama de Fogo Especial': codexIcon(6974),
  'Semente de Girassol Especial': codexIcon(6822),
  'Semente de Grama Mel de Seda Especial': codexIcon(6976),
  'Semente de Milho Especial': codexIcon(6829),
  'Semente de Morango Especial': codexIcon(6709),
  'Semente de Nolina Especial': codexIcon(6992),
  'Semente de Penestraria Especial': codexIcon(6993),
  'Semente de Pimenta Especial': codexIcon(6721),
  'Semente de Pimenta-do-Reino Especial': codexIcon(6717),
  'Semente de Pimentão Especial': codexIcon(6825),
  'Semente de Planta Juba de Leão Especial': codexIcon(6975),
  'Semente de Tomate Especial': codexIcon(6824),
  'Semente de Trigo Especial': codexIcon(6828),
  'Semente de Uva Especial': codexIcon(6821),
  'Shuriken Estique': codexIcon(14604),
  'Shuriken Krea': codexIcon(14624),
  'Shuriken Quitar': codexIcon(14603),
  'Shuriken Rosar': codexIcon(14625),
  'Shuriken Tadd': codexIcon(14605),
  'Siganid': codexIcon(8272),
  'Siganid Desidratado': codexIcon(8572),
  'Suspiro de Floresta Pura': codexIcon(50807),
  'Swiri': codexIcon(8237),
  'Swiri Desidratado': codexIcon(8537),
  'Símbolo de Guardião de Santuário': codexIcon(12008),
  'Tainha': codexIcon(8236),
  'Tainha Desidratada': codexIcon(8536),
  'Talismã Helrick': codexIcon(10503),
  'Talismã Jubre': codexIcon(10504),
  'Talismã Krea': codexIcon(10524),
  'Talismã Rhik': codexIcon(10505),
  'Talismã Rosar': codexIcon(10525),
  'Tamboril Desidratado': codexIcon(8526),
  'Tang Azul': codexIcon(8303),
  'Tang Azul Desidratado': codexIcon(8603),
  'Tecido Desgastado': codexIcon(42431),
  'Torta de Carne': codexIcon(9265),
  'Traço de Ascensão': codexIcon(5955),
  'Traço de Batalha': codexIcon(5958),
  'Traço de Desespero': codexIcon(5952),
  'Traço de Memória': codexIcon(5963),
  'Traço de Morte': codexIcon(5962),
  'Traço de Origem': codexIcon(5957),
  'Traço de Selvageria': codexIcon(5956),
  'Traço de Violência': codexIcon(5961),
  'Trigo Especial': codexIcon(7011),
  'Trigo de Alta Qualidade': codexIcon(7006),
  'Truta Desidratada': codexIcon(8518),
  'Tímalo': codexIcon(8297),
  'Tímalo Desidratado': codexIcon(8597),
  'Vairão': codexIcon(8252),
  'Vairão Desidratado': codexIcon(8552),
  'Vairão Dourado': codexIcon(8354),
  'Vairão Dourado Desidratado': codexIcon(8642),
  'Vestígio da Natureza': codexIcon(5960),
  'WON Cristal Mágico - Addis': codexIcon(768884),
  'WON Cristal Mágico - Carmae': codexIcon(768881),
  'WON Cristal Mágico - Cobelinus': codexIcon(768872),
  'WON Cristal Mágico - Harpia': codexIcon(768869),
  'WON Cristal Mágico - Hystria': codexIcon(768878),
  'WON Cristal Mágico - Víbora': codexIcon(768875),
  '[Grupo] Elixir Perfeito de Caça ao Humano': codexIcon(608),
  '[Grupo] Elixir de Assassino': codexIcon(633),
  '[Grupo] Elixir de Caça ao Humano': codexIcon(607),
  '[Grupo] Elixir de Ceifador': codexIcon(649),
  '[Grupo] Elixir de Concentração': codexIcon(637),
  '[Grupo] Elixir de Defesa': codexIcon(653),
  '[Grupo] Elixir de Energia': codexIcon(619),
  '[Grupo] Elixir de Espinho': codexIcon(603),
  '[Grupo] Elixir de Experiência Esplendida': codexIcon(652),
  '[Grupo] Elixir de Fúria Infinita': codexIcon(642),
  '[Grupo] Elixir de Morte': codexIcon(623),
  '[Grupo] Elixir de Morte Bruta': codexIcon(624),
  '[Grupo] Elixir de Rapidez Intrépida': codexIcon(628),
  '[Grupo] Elixir de Tempo': codexIcon(751),
  '[Guilda] Espigão de Hekaru': codexIcon(9978),
  'Água Mineral': codexIcon(9059),
  'Água-Viva': codexIcon(8214),
  'Água-Viva Desidratada': codexIcon(8514)
});
const GROUP_ORDER = ['Fármacos da Harmonia','Fármacos Base','Elixires Base','Sangues','Fármacos Tradicionais','Perfumes','Culinária','Rações','Culinária Especial','Pergaminhos','Trabalhadores energia','Poções','Itens Tesouro'];
const GROUP_LABELS = {
  pt: {'Fármacos da Harmonia':'Fármacos da Harmonia','Fármacos Base':'Fármacos Base','Elixires Base':'Elixires Base','Sangues':'Sangues','Fármacos Tradicionais':'Fármacos Tradicionais','Perfumes':'Perfumes','Culinária':'Culinária','Rações':'Rações','Culinária Especial':'Culinária Especial','Pergaminhos':'Pergaminhos','Trabalhadores energia':'Trabalhadores energia','Poções':'Poções','Itens Tesouro':'Itens Tesouro','Agitação':'Agitação','Alquimia Simples':'Alquimia Simples','Aquecimento':'Aquecimento','Corte':'Corte','Culinária Simples':'Culinária Simples','Desidratação':'Desidratação','Empacotar Alquimia Imperial':'Empacotar Alquimia Imperial','Empacotar Culinária Imperial':'Empacotar Culinária Imperial','Fábrica':'Fábrica','Filtragem':'Filtragem','Moagem':'Moagem'},
  es: {'Fármacos da Harmonia':'Fármacos de la Armonía','Fármacos Base':'Fármacos Base','Elixires Base':'Elixires Base','Sangues':'Sangres','Fármacos Tradicionais':'Fármacos Tradicionales','Perfumes':'Perfumes','Culinária':'Cocina','Rações':'Alimentos de montarias e mascotes','Culinária Especial':'Cocina Especial','Pergaminhos':'Pergaminos','Trabalhadores energia':'Energía de trabajadores','Poções':'Pociones','Itens Tesouro':'Tesoros','Agitação':'Agitación','Alquimia Simples':'Alquimia Simple','Aquecimento':'Calentamiento','Corte':'Corte','Culinária Simples':'Cocina Simple','Desidratação':'Deshidratación','Empacotar Alquimia Imperial':'Empaquetar Alquimia Imperial','Empacotar Culinária Imperial':'Empaquetar Cocina Imperial','Fábrica':'Fábrica','Filtragem':'Filtración','Moagem':'Molienda'}
};
let activeGroup = '';
let categoryRequestToken = 0;

window.applyRecipeData = function(nextData, group){
  DATA = Array.isArray(nextData) ? nextData : [];
  window.DATA = DATA;
  activeGroup = group || activeGroup;
  rebuildExpandIndex();
  buildSidebar();
  draw(document.getElementById('search')?.value || '');
};

function buildSidebar(){
  const sidebar = document.getElementById('groupSidebar');
  if(!sidebar) return;
  const counts = window.RECIPE_GROUP_COUNTS || {};
  const groups = window.RECIPE_GROUPS || GROUP_ORDER;
  sidebar.innerHTML = `<div class="sidebar-label" data-i18n="groups">Grupos</div>` + groups.map(g=> `
    <button type="button" class="group-btn ${activeGroup===g?'active':''}" data-group="${g}" aria-pressed="${activeGroup===g?'true':'false'}">
      <span class="g-icon">${GROUP_ICONS[g]||'•'}</span><span class="g-name">${(GROUP_LABELS[currentLang]||GROUP_LABELS.pt)[g]||g}</span><span class="g-count">${counts[g] ?? 0}</span>
    </button>`).join('');
}


document.getElementById('groupSidebar')?.addEventListener('click', (e)=>{
  const btn = e.target.closest('.group-btn');
  if(!btn) return;
  e.preventDefault();
  e.stopPropagation();
  const group = btn.dataset.group;
  if(!group) return;
  const token = ++categoryRequestToken;
  activeGroup = group;
  buildSidebar();
  closeGroupSidebarMobile();
  document.getElementById('groupSidebar')?.setAttribute('aria-busy','true');
  window.loadRecipeCategory?.(group).then(data=>{
    if(token === categoryRequestToken && activeGroup === group){
      window.applyRecipeData?.(data, group);
    }
  }).catch(err=>{
    if(token !== categoryRequestToken || activeGroup !== group) return;
    if(listEl){ listEl.innerHTML=''; }
    if(emptyEl){ emptyEl.style.display='block'; emptyEl.textContent='Não foi possível carregar esta categoria.'; }
    console.error('[Receitas]',err);
  }).finally(()=>{
    if(token === categoryRequestToken) document.getElementById('groupSidebar')?.removeAttribute('aria-busy');
  });
});

function openGroupSidebarMobile(){
  document.getElementById('groupSidebar')?.classList.add('mobile-open');
  document.body.classList.add('group-sidebar-open');
  document.getElementById('groupSidebarToggle')?.setAttribute('aria-expanded','true');
}
function closeGroupSidebarMobile(){
  document.getElementById('groupSidebar')?.classList.remove('mobile-open');
  document.body.classList.remove('group-sidebar-open');
  document.getElementById('groupSidebarToggle')?.setAttribute('aria-expanded','false');
}
document.getElementById('groupSidebarToggle')?.addEventListener('click',()=>{
  const sidebar=document.getElementById('groupSidebar');
  if(sidebar?.classList.contains('mobile-open')) closeGroupSidebarMobile();
  else openGroupSidebarMobile();
});
document.getElementById('groupSidebarBackdrop')?.addEventListener('click', closeGroupSidebarMobile);
document.addEventListener('keydown', e=>{
  if(e.key==='Escape' && document.getElementById('groupSidebar')?.classList.contains('mobile-open')) closeGroupSidebarMobile();
});

function draw(filter){
  if(!listEl || typeof DATA==='undefined') return;
  const q = (filter||'').trim().toLowerCase();
  
  let items = DATA.map((item,i)=>({item,i}));
  
  if (q) {
    // Se tem algo digitado na busca, procura em TODAS as receitas da página
    items = items.filter(({item}) => itemMatches(item, q));
  } else {
    // Se a busca estiver vazia, filtra apenas pelo grupo selecionado na lateral
    items = items.filter(({item}) => item.group === activeGroup);
  }

  listEl.innerHTML = items.map(({item,i})=> renderRoot(item,i)).join('');
  emptyEl.style.display = items.length ? 'none' : 'block';
  
  if(q){
    document.querySelectorAll('.root-item').forEach(el=> { hydrateRoot(el); el.classList.add('open'); });
  }
}

function buildRecipeLink(name, group){
  const qs = new URLSearchParams();
  if(group) qs.set('group', group);
  qs.set('item', name);
  return location.origin + '/receitas.html?' + qs.toString();
}

function buildExportPayload(name, effect, routes, children, imm){
  const toPairs = (list)=> (list||[]).filter(c=>c && c.name).map(c=>({name:c.name, qty: c.qty ?? null}));
  const result = { name, effect: effect || null, routes: [] };
  if(routes && routes.length){
    result.routes = routes.map(r=>({ label: r.label || null, children: toPairs(r.children) }));
  } else {
    result.routes = [{ label: null, children: toPairs(children) }];
  }
  if(imm){
    result.routes.push({
      label: 'Imortalidade',
      children: toPairs(imm.routes ? imm.routes[0]?.children : imm.children)
    });
  }
  return result;
}

function slugify(name){
  return String(name)
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-+|-+$/g,'')
    .toLowerCase() || 'receita';
}

function renderIngredientListImage(name, routeLabel, effect, items){
  const width = 640;
  const padX = 28;
  const titleSize = 24;
  const effectSize = 14;
  const itemSize = 16;
  const lineHeight = 28;

  const measure = document.createElement('canvas').getContext('2d');
  function wrapText(text, maxWidth, font){
    measure.font = font;
    const words = String(text).split(' ');
    const lines = [];
    let current = '';
    words.forEach(w=>{
      const test = current ? `${current} ${w}` : w;
      if(measure.measureText(test).width > maxWidth && current){ lines.push(current); current = w; }
      else current = test;
    });
    if(current) lines.push(current);
    return lines;
  }

  const titleText = name + (routeLabel ? ` (${routeLabel})` : '');
  const effectLines = effect ? wrapText(effect, width - padX*2, `italic ${effectSize}px Arial`) : [];
  const effectBlockHeight = effectLines.length ? effectLines.length*(effectSize+8) + 16 : 0;
  const height = padX + titleSize + 16 + effectBlockHeight + 24 + itemSize + 14 + items.length*lineHeight + 24 + 13 + padX;

  const scale = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(width*scale);
  canvas.height = Math.ceil(height*scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  ctx.fillStyle = '#15171d';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#c9a24b';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width-2, height-2);

  let y = padX;
  ctx.fillStyle = '#c9a24b';
  ctx.font = `bold ${titleSize}px Georgia, serif`;
  ctx.fillText(titleText, padX, y + titleSize);
  y += titleSize + 16;

  if(effectLines.length){
    ctx.fillStyle = '#9b968a';
    ctx.font = `italic ${effectSize}px Arial`;
    effectLines.forEach((line, i)=>{ ctx.fillText(i===0 ? `✨ ${line}` : `   ${line}`, padX, y + effectSize); y += effectSize + 8; });
    y += 8;
  }

  ctx.strokeStyle = '#272b35';
  ctx.beginPath(); ctx.moveTo(padX, y); ctx.lineTo(width-padX, y); ctx.stroke();
  y += 24;

  ctx.fillStyle = '#e8e3d5';
  ctx.font = `bold ${itemSize}px Arial`;
  ctx.fillText('Ingredientes:', padX, y + itemSize);
  y += itemSize + 14;

  ctx.font = `${itemSize}px Arial`;
  items.forEach(it=>{
    const qtyPart = it.qty!=null ? `${it.qty}x  ` : '';
    ctx.fillStyle = '#c9a24b';
    ctx.fillText('•', padX, y + itemSize);
    ctx.fillStyle = '#e8e3d5';
    ctx.fillText(`${qtyPart}${it.name}`, padX+18, y + itemSize);
    y += lineHeight;
  });

  y += 10;
  ctx.strokeStyle = '#272b35';
  ctx.beginPath(); ctx.moveTo(padX, y); ctx.lineTo(width-padX, y); ctx.stroke();
  y += 24;

  ctx.fillStyle = '#8a7139';
  ctx.font = '13px Arial';
  ctx.fillText('🌙 Lua Crescente — Santuário da Guilda', padX, y + 13);

  return canvas;
}

const SUPPORTS_NATIVE_SHARE = typeof navigator!=='undefined' && typeof navigator.share==='function';

listEl?.addEventListener('click', (e)=>{
  const exportBtn = e.target.closest('.export-list-btn');
  if(exportBtn){
    e.preventDefault();
    e.stopPropagation();
    let payload;
    try{ payload = JSON.parse(exportBtn.dataset.exportPayload || '{}'); }catch{ payload = {}; }
    const routes = Array.isArray(payload.routes) && payload.routes.length ? payload.routes : [{label:null, children:[]}];
    let routeIdx = 0;
    const rootEl = exportBtn.closest('.root-item');
    const activeTab = rootEl?.querySelector('[data-lazy-body] > .route-tabs > .route-tab.active, .body > .route-tabs.farmaco-route-tabs > .route-tab.active');
    if(activeTab && activeTab.dataset.idx != null){
      const parsedIdx = Number(activeTab.dataset.idx);
      if(Number.isFinite(parsedIdx) && routes[parsedIdx]) routeIdx = parsedIdx;
    }
    const route = routes[routeIdx] || routes[0];
    const name = payload.name || exportBtn.dataset.exportName;
    const items = (route.children && route.children.length) ? route.children : [{name:'(sem ingredientes cadastrados)', qty:null}];
    const showFeedback=(icon)=>{
      const old = exportBtn.innerHTML;
      exportBtn.innerHTML = icon || LC_ICONS.check;
      exportBtn.classList.add('is-copied');
      setTimeout(()=>{ exportBtn.innerHTML = old; exportBtn.classList.remove('is-copied'); }, 1300);
    };
    const canvas = renderIngredientListImage(name, route.label, payload.effect, items);
    canvas.toBlob(async (blob)=>{
      if(!blob){
        const text = `${name}${route.label?` (${route.label})`:''}\n` + items.map(c=>`• ${c.qty!=null?`${c.qty}x `:''}${c.name}`).join('\n');
        window.prompt('Copie a lista abaixo:', text);
        return;
      }
      const filename = `receita-${slugify(name)}.png`;
      if(SUPPORTS_NATIVE_SHARE && navigator.canShare){
        try{
          const file = new File([blob], filename, {type:'image/png'});
          if(navigator.canShare({files:[file]})){
            await navigator.share({files:[file], title:name});
            showFeedback(LC_ICONS.check);
            return;
          }
        }catch(err){
          if(err && err.name === 'AbortError') return;
        }
      }
      if(navigator.clipboard && window.ClipboardItem){
        try{
          await navigator.clipboard.write([new window.ClipboardItem({'image/png': blob})]);
          showFeedback(LC_ICONS.check);
          return;
        }catch(err){ }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(url), 4000);
      showFeedback(LC_ICONS.download);
    }, 'image/png');
    return;
  }
  const copyBtn = e.target.closest('.copy-link-btn');
  if(copyBtn){
    e.preventDefault();
    e.stopPropagation();
    const name = copyBtn.dataset.copyName;
    const link = buildRecipeLink(name, copyBtn.dataset.copyGroup);
    const showFeedback=()=>{
      const old = copyBtn.innerHTML;
      copyBtn.innerHTML = LC_ICONS.check;
      copyBtn.classList.add('is-copied');
      setTimeout(()=>{ copyBtn.innerHTML = old; copyBtn.classList.remove('is-copied'); }, 1300);
    };
    const copyToClipboard=()=>{
      if(navigator.clipboard?.writeText){
        navigator.clipboard.writeText(link).then(showFeedback).catch(()=>{ window.prompt('Copie o link abaixo:', link); });
      } else {
        window.prompt('Copie o link abaixo:', link);
      }
    };
    if(SUPPORTS_NATIVE_SHARE){
      navigator.share({ title: `${name} — Lua Crescente`, url: link })
        .then(showFeedback)
        .catch(err=>{
          if(err && err.name === 'AbortError') return;
          copyToClipboard();
        });
    } else {
      copyToClipboard();
    }
    return;
  }
  const farmacoHead = e.target.closest('.farmaco-card-head');
  if(farmacoHead){
    if(e.target.closest('.tag')) return;
    farmacoHead.closest('.farmaco-card').classList.toggle('open');
    return;
  }
  const tab = e.target.closest('.route-tab');
  if(tab){
    const uid = tab.dataset.uid, idx = tab.dataset.idx;
    const scope = tab.closest('.root-item');
    scope.querySelectorAll(`.route-tab[data-uid="${uid}"]`).forEach(t=>t.classList.remove('active'));
    scope.querySelectorAll(`.route-pane[data-uid="${uid}"]`).forEach(p=>p.classList.remove('active'));
    tab.classList.add('active');
    scope.querySelector(`.route-pane[data-uid="${uid}"][data-idx="${idx}"]`).classList.add('active');
    return;
  }
  const head = e.target.closest('.root-head');
  if(head){
    const root=head.closest('.root-item');
    hydrateRoot(root);
    root.classList.toggle('open');
    return;
  }
  const row = e.target.closest('.ingredient-row');
  if(row){
    row.closest('li.has-sub').classList.toggle('sub-open');
  }
});

// =====================================================================
// BUSCA COM SUGESTÕES (AUTOCOMPLETE)
// =====================================================================
const searchInput = document.getElementById('search');
const suggestionsBox = document.getElementById('searchSuggestions');

if (searchInput && suggestionsBox) {
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    
    // Se estiver vazio, esconde as sugestões e volta a lista normal do grupo
    if (!q) {
      suggestionsBox.style.display = 'none';
      draw(''); 
      return;
    }

    // Filtra os itens que batem com a busca
    const matches = DATA.filter(item => itemMatches(item, q)).slice(0, 8); // Limita a 8 sugestões para não lotar

    if (matches.length === 0) {
      suggestionsBox.innerHTML = '<div class="suggestion-item"><span class="suggestion-title" style="color:var(--text-dim)">Nenhuma receita encontrada</span></div>';
      suggestionsBox.style.display = 'block';
      return;
    }

    // Monta o HTML das sugestões
    suggestionsBox.innerHTML = matches.map(item => `
      <div class="suggestion-item" data-name="${item.name}">
        <span class="suggestion-title">${tName(item.name)}</span>
        <span class="suggestion-group">${item.group}</span>
      </div>
    `).join('');
    
    suggestionsBox.style.display = 'block';

    // Adiciona o evento de clique em cada sugestão
    suggestionsBox.querySelectorAll('.suggestion-item').forEach(el => {
      el.addEventListener('click', () => {
        const name = el.dataset.name;
        searchInput.value = name; // Coloca o nome no input
        suggestionsBox.style.display = 'none'; // Fecha o dropdown
        draw(name); // Filtra e expande a receita na tela principal
      });
    });
  });

  // Esconde o dropdown se clicar fora dele
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.style.display = 'none';
    }
  });
}
document.getElementById('expandAll')?.addEventListener('click', ()=>{
  document.querySelectorAll('.root-item').forEach(el=>{ hydrateRoot(el); el.classList.add('open'); });
  document.querySelectorAll('.farmaco-card').forEach(el=>el.classList.add('open'));
  document.querySelectorAll('li.has-sub').forEach(el=>el.classList.add('sub-open'));
});
document.getElementById('collapseAll')?.addEventListener('click', ()=>{
  document.querySelectorAll('.root-item, .farmaco-card').forEach(el=>el.classList.remove('open'));
  document.querySelectorAll('li.has-sub').forEach(el=>el.classList.remove('sub-open'));
});

if(listEl){
  const params=new URLSearchParams(location.search);
  const initialSearch=params.get('search')||'';
  const initialGroup=params.get('group') || document.body.dataset.defaultGroup || '';
  activeGroup = window.RECIPE_GROUP_COUNTS?.[initialGroup] != null ? initialGroup : (window.RECIPE_GROUPS?.[0] || GROUP_ORDER[0]);
  buildSidebar();
// document.getElementById('search')?.addEventListener('input', (e)=> draw(e.target.value));
  window.__LC_AFTER_CATEGORY_LOAD = function(){
    const initialItem=params.get('item');
    if(initialItem){
      requestAnimationFrame(()=>{
        let el;
        try{ el = document.querySelector(`.root-item[data-item-name="${CSS.escape(initialItem)}"]`); }catch{ el = null; }
        if(!el){ const idx=DATA.findIndex(i=>i.name===initialItem); el=document.querySelector(`.root-item[data-idx="${idx}"]`); }
        if(el){ hydrateRoot(el); el.classList.add('open'); el.scrollIntoView({block:'start'}); }
      });
    }
  };
  if(window.loadRecipeCategory){
    window.loadRecipeCategory(activeGroup).then(data=>{
      window.applyRecipeData?.(data, activeGroup);
      window.__LC_AFTER_CATEGORY_LOAD?.();
    }).catch(err=>{ console.error('[Receitas]',err); if(emptyEl){ emptyEl.style.display='block'; emptyEl.textContent='Não foi possível carregar a categoria.'; } });
  }
}

// ---- Seletor de idioma ----
const langSwitch = document.getElementById('langSwitch');
const langBtn = document.getElementById('langBtn');
const langMenu = document.getElementById('langMenu');

langBtn?.addEventListener('click', (e)=>{
  e.stopPropagation();
  langSwitch.classList.toggle('open');
});

langMenu?.addEventListener('click', (e)=>{
  const option = e.target.closest('.lang-option');
  if(!option) return;
  const lang = option.dataset.lang;
  setLanguage(lang);
  langSwitch.classList.remove('open');
});

document.addEventListener('click', ()=> langSwitch.classList.remove('open'));
// ---- Menus suspensos (Receitas, Mapas, ...) ----
(function(){
  var dropdowns = document.querySelectorAll('.site-tab-dropdown');
  if(!dropdowns.length) return;

  function fecharTodos(){
    dropdowns.forEach(function(d){ d.classList.remove('open'); });
  }

  dropdowns.forEach(function(dropdown){
    var trigger = dropdown.querySelector(':scope > .site-tab');
    if(!trigger) return;

    trigger.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      var vaiAbrir = !dropdown.classList.contains('open');
      fecharTodos();
      if(vaiAbrir) dropdown.classList.add('open');
    });

    dropdown.querySelectorAll('.site-tab-dropdown-menu .site-tab').forEach(function(link){
      link.addEventListener('click', function(){ dropdown.classList.remove('open'); });
    });
  });

  document.addEventListener('click', function(e){
    var clicouDentro = Array.prototype.some.call(dropdowns, function(d){
      return d.contains(e.target);
    });
    if(!clicouDentro) fecharTodos();
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') fecharTodos();
  });
})();

// ---- Navegação principal do site ----
const nav = document.querySelector('.site-nav');
const menuToggle = document.getElementById('menuToggle');
const guildModal = document.getElementById('guildModal');
let lastFocusedElement = null;

function closeMobileMenu(){
  nav?.classList.remove('menu-open');
  menuToggle?.setAttribute('aria-expanded','false');
  menuToggle?.setAttribute('aria-label',tr('menu_open'));
}
menuToggle?.addEventListener('click', ()=>{
  const open = nav.classList.toggle('menu-open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', tr(open?'menu_close':'menu_open'));
});

function hideGuildModal(restoreFocus=true){
  if(!guildModal) return;
  guildModal.classList.remove('open');
  guildModal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
  if(restoreFocus && lastFocusedElement && typeof lastFocusedElement.focus==='function') lastFocusedElement.focus();
}
function openGuildModal(){
  if(!guildModal) return;
  lastFocusedElement=document.activeElement;
  guildModal.classList.add('open');
  guildModal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  closeMobileMenu();
  requestAnimationFrame(()=>guildModal.querySelector('.guild-modal-close')?.focus());
}
function closeGuildModal(e){
  e?.preventDefault?.();
  e?.stopPropagation?.();
  hideGuildModal();
}

function setPage(page){
  const urls={home:'/',culinaria:'/receitas.html','sala-de-aula':'/sala-de-aula.html',combos:'/combos.html',processamento:'/processamento.html','itens-tesouro':'/itens-tesouro.html',mapa:'/mapa.html'};
  const target=urls[page]||urls.home;
  if(location.pathname.endsWith('/'+target) || (target==='index.html' && (location.pathname.endsWith('/') || location.pathname.endsWith('index.html')))) return;
  location.href=target;
}

if (typeof syncActiveNav === 'function') syncActiveNav();

document.querySelectorAll('[data-modal="guild"]').forEach(el=>el.addEventListener('click',(e)=>{e.preventDefault();e.stopPropagation();openGuildModal();}));
guildModal?.querySelectorAll('[data-guild-modal-close]').forEach(el=>el.addEventListener('click',closeGuildModal));
guildModal?.querySelector('.guild-modal-dialog')?.addEventListener('click',(e)=>e.stopPropagation());
const backToTop=document.getElementById('backToTop');
if(backToTop){
  const updateBackToTop=()=>backToTop.classList.toggle('is-visible',window.scrollY>420);
  window.addEventListener('scroll',updateBackToTop,{passive:true});
  updateBackToTop();
  backToTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&guildModal?.classList.contains('open'))closeGuildModal()});

document.getElementById('homeSearchForm')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const q = document.getElementById('homeSearchInput').value.trim();
  location.href = '/receitas.html' + (q ? '?search='+encodeURIComponent(q) : '');
});

function openItemFromHome(name, group){
  const qs = new URLSearchParams();
  if(group) qs.set('group', group);
  qs.set('item', name);
  location.href='/receitas.html?'+qs.toString();
}

function buildHomePopular(){
  const picks = [
    { name:'Fármaco da Harmonia', group:'Fármacos da Harmonia', icon:'🧪', type:'Alquimia' },
    { name:'Perfume de Coragem', group:'Perfumes', icon:'🌸', type:'Alquimia' },
    { name:'Refeição Simples de Cron', group:'Culinária', icon:'🍲', type:'Culinária' },
    { name:'Bênção de Criatura Mística - PA Total', group:'Pergaminhos', icon:'✨', type:'Alquimia' },
    { name:'Perfume da Perseverança', group:'Perfumes', icon:'🌸', type:'Alquimia' },
    { name:'Fármaco da Armadura de Aço', group:'Fármacos Tradicionais', icon:'🧪', type:'Alquimia' }
  ];
  const homeGrid=document.getElementById('homePopularGrid');
  if(!homeGrid) return;
  document.getElementById('homePopularGrid').innerHTML = picks.map(p=>`
    <button class="home-pop-item" data-name="${p.name}" data-group="${p.group}">
      <span class="hp-icon">${p.icon}</span><span class="hp-meta"><span class="hp-name">${tName(p.name)}</span><span class="hp-type">${currentLang==='es'?(p.type==='Culinária'?'Cocina':p.type):p.type}</span></span>
    </button>
  `).join('');
  document.querySelectorAll('.home-pop-item').forEach(btn=>{
    btn.addEventListener('click', ()=> openItemFromHome(btn.dataset.name, btn.dataset.group));
  });
}

function rewardIconFallback(name){
  const ids={
    'High-quality Food Box':757423,
    'Perfume of Tenacity':1413,
    'Perfume of Envy':1411,
    '[Party] Harmony Draught - Human':1401,
    '[Party] Harmony Draught - Demihuman':1403,
    '[Party] Harmony Draught - Kamasylvia':1405,
    '[Party] Harmony Draught - Edania':1407
  };
  const id=ids[String(name||'').trim()];
  return id ? `/.netlify/functions/garmoth-coupons?icon=${encodeURIComponent(id)}` : '';
}

let lastCouponsPayload=null;
const couponsModal=document.getElementById('couponsModal');
const couponsModalList=document.getElementById('couponsModalList');

function renderCouponsModal(payload){
  if(!couponsModalList) return;
  const coupons=Array.isArray(payload?.coupons)?payload.coupons:[];
  if(!coupons.length){
    couponsModalList.innerHTML='<div class="coupons-status coupons-error">Os cupons estão temporariamente indisponíveis.</div>';
    return;
  }
  couponsModalList.innerHTML=coupons.slice(0,10).map(c=>{
    const code=String(c.code||'').trim();
    const expiry=String(c.expiry||'Cupom ativo');
    const items=Array.isArray(c.items)?c.items:[];
    const fallbackItems=items.length?items:['Recompensas do cupom'];
    const itemsHtml=fallbackItems.map(item=>{
      const raw=typeof item==='string'?item:(item?.name||'Recompensa');
      const m=String(raw).match(/^(\d+)x\s*(.*)$/i);
      const qty=(typeof item==='object' && item?.qty!==undefined && String(item.qty)!=='') ? String(item.qty) : (m?m[1]:'');
      const name=(typeof item==='object' && item?.name) ? String(item.name) : (m?m[2]:String(raw));
      const img=(typeof item==='object' && item?.image) ? String(item.image) : rewardIconFallback(name);
      return `<div class="lc-item" title="${escapeHtml(name)}">${img?`<img src="${escapeHtml(img)}" alt="${escapeHtml(name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:''}<span class="lc-item-fallback" style="${img?'display:none':''}">${escapeHtml(name.slice(0,2).toUpperCase())}</span>${qty?`<span class="lc-item-qty">${escapeHtml(qty)}</span>`:''}<span class="lc-item-name">${escapeHtml(name)}</span></div>`;
    }).join('');
    const postedLine=c.postedAt?`${escapeHtml(c.postedAt)} · `:'';
    return `<article class="lc-coupon-card">
      <div class="lc-coupon-top">
        <span class="lc-coupon-tag">🎟️ Cupom da guilda</span>
        <span class="lc-coupon-expiry">⏳ ${escapeHtml(expiry)}</span>
      </div>
      <div class="lc-coupon-code-row">
        <span class="lc-coupon-code">${escapeHtml(code)}</span>
        <button class="lc-coupon-copy" type="button" data-coupon="${escapeHtml(code)}" aria-label="Copiar código">Copiar</button>
      </div>
      <div class="lc-coupon-items">${itemsHtml}</div>
      <div class="lc-coupon-foot">${postedLine}Provided by Lua Crescente</div>
    </article>`;
  }).join('');
  couponsModalList.querySelectorAll('.lc-coupon-copy').forEach(btn=>btn.addEventListener('click',async()=>{
    try{
      await navigator.clipboard.writeText(btn.dataset.coupon);
      const old=btn.textContent;
      btn.textContent='Copiado!';
      btn.classList.add('is-copied');
      setTimeout(()=>{btn.textContent=old;btn.classList.remove('is-copied');},1300);
    }catch{}
  }));
}
function hideCouponsModal(restoreFocus=true){
  if(!couponsModal) return;
  couponsModal.classList.remove('open');
  couponsModal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
  if(restoreFocus && lastFocusedElement && typeof lastFocusedElement.focus==='function') lastFocusedElement.focus();
}
function openCouponsModal(){
  if(!couponsModal) return;
  lastFocusedElement=document.activeElement;
  if(lastCouponsPayload) renderCouponsModal(lastCouponsPayload);
  couponsModal.classList.add('open');
  couponsModal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  closeMobileMenu();
  requestAnimationFrame(()=>couponsModal.querySelector('.guild-modal-close')?.focus());
}
document.getElementById('openCouponsModalBtn')?.addEventListener('click',openCouponsModal);
document.getElementById('footerCouponsLink')?.addEventListener('click',(e)=>{
  if(!couponsModal) return;
  e.preventDefault();
  openCouponsModal();
});
couponsModal?.querySelectorAll('[data-coupons-modal-close]').forEach(el=>el.addEventListener('click',()=>hideCouponsModal()));
couponsModal?.querySelector('.coupons-modal-dialog')?.addEventListener('click',(e)=>e.stopPropagation());
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&couponsModal?.classList.contains('open'))hideCouponsModal()});

const FOOTER_PRIVACY_HTML = `
  <p>O Santuário Lua Crescente é um projeto feito por fãs, mantido voluntariamente pela guilda, sem fins lucrativos e sem qualquer vínculo com a Pearl Abyss ou o Black Desert Online.</p>
  <h3>O que não coletamos</h3>
  <p>O site não tem cadastro, login ou formulários, então não pedimos nem armazenamos nome, e-mail, senha ou qualquer dado pessoal.</p>
  <h3>Preferência de idioma</h3>
  <p>A escolha de idioma (Português/Espanhol) fica salva só no seu navegador (armazenamento local), pra lembrar sua preferência na próxima visita. Essa informação não é enviada a nenhum servidor.</p>
  <h3>Hospedagem</h3>
  <p>O site é hospedado pela Netlify, que pode registrar logs técnicos básicos de acesso (como endereço IP e navegador) por motivos de segurança e operação da própria hospedagem, fora do nosso controle direto.</p>
  <h3>Cupons</h3>
  <p>Os cupons exibidos são lidos automaticamente do canal de cupons da guilda no Discord através de uma função própria do site. Nenhum dado seu é enviado ao Discord nesse processo.</p>
  <h3>Terceiros</h3>
  <p>Alguns ícones de itens são carregados de servidores de imagem de terceiros (como o CDN do Discord) apenas para exibição visual.</p>
  <h3>Sem anúncios e sem rastreamento</h3>
  <p>Não exibimos anúncios, não vendemos dados e não usamos ferramentas de rastreamento de terceiros.</p>
  <p>Dúvidas sobre esta política podem ser tiradas com a administração da guilda no Discord.</p>
`;
const FOOTER_TERMS_HTML = `
  <p>O Santuário Lua Crescente é mantido por voluntários da guilda Lua Crescente, sem fins lucrativos, e não é afiliado à Pearl Abyss nem ao Black Desert Online. Todas as marcas, nomes e conteúdos do jogo pertencem aos seus respectivos donos.</p>
  <h3>Uso do conteúdo</h3>
  <p>Receitas, cronogramas, cupons e demais informações são fornecidos gratuitamente, "como estão", como referência para a comunidade. Podem conter imprecisões ou ficar desatualizados, já que o jogo muda com o tempo.</p>
  <h3>Cupons</h3>
  <p>Os cupons são exibidos como cortesia, extraídos automaticamente do canal de cupons da guilda no Discord. A validade, disponibilidade e regras de resgate de cada cupom são de responsabilidade da Pearl Abyss, não do site.</p>
  <h3>Isenção de responsabilidade</h3>
  <p>O site não se responsabiliza por eventuais perdas, prejuízos ou decisões tomadas com base nas informações aqui apresentadas. Sempre confira dados importantes em fontes oficiais do jogo.</p>
  <h3>Alterações</h3>
  <p>O conteúdo e o funcionamento do site podem mudar a qualquer momento, sem aviso prévio, conforme a guilda achar necessário.</p>
  <p>Dúvidas sobre estes termos podem ser tiradas com a administração da guilda no Discord.</p>
`;
const CURRENT_CHANGELOG_VERSION = 140;
// [v106] FOOTER_CHANGELOG_HTML (v90) e FOOTER_MODAL_CONTENT removidos:
// o HTML v90 era injetado e imediatamente sobrescrito por
// renderChangelogTimeline(), que usa CHANGELOG_DATA. Código morto.
document.getElementById('footerPrivacyContent')?.insertAdjacentHTML('beforeend', FOOTER_PRIVACY_HTML);
document.getElementById('footerTermsContent')?.insertAdjacentHTML('beforeend', FOOTER_TERMS_HTML);

const LAST_SEEN_CHANGELOG_KEY = 'luaCrescenteLastSeenChangelog';
function updateChangelogBadge(){
  let lastSeen = 0;
  try{ lastSeen = parseInt(localStorage.getItem(LAST_SEEN_CHANGELOG_KEY), 10) || 0; }catch{}
  const hasNews = lastSeen < CURRENT_CHANGELOG_VERSION;
  document.querySelectorAll('.changelog-badge').forEach(el=>{ el.style.display = hasNews ? 'inline-flex' : 'none'; });
}
function markChangelogAsSeen(){
  try{ localStorage.setItem(LAST_SEEN_CHANGELOG_KEY, String(CURRENT_CHANGELOG_VERSION)); }catch{}
  updateChangelogBadge();
}
updateChangelogBadge();

const GUILD_FOUNDING_DATE = new Date(2025, 11, 4);
function daysSinceFounding(){
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfFounding = new Date(GUILD_FOUNDING_DATE.getFullYear(), GUILD_FOUNDING_DATE.getMonth(), GUILD_FOUNDING_DATE.getDate());
  return Math.max(0, Math.round((startOfToday - startOfFounding) / 86400000));
}
function updateFoundingCounter(){
  const el = document.getElementById('footerFoundingCounter');
  if(!el) return;
  const days = daysSinceFounding();
  el.textContent = currentLang==='es'
    ? `🌙 Caminando juntos hace ${days} día${days===1?'':'s'}`
    : `🌙 Caminhando juntos há ${days} dia${days===1?'':'s'}`;
}
updateFoundingCounter();

const ANNIVERSARY_DISMISS_KEY = 'luaCrescenteAnniversaryBannerDismissed';
function daysUntilNextAnniversary(){
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let anniversary = new Date(today.getFullYear(), GUILD_FOUNDING_DATE.getMonth(), GUILD_FOUNDING_DATE.getDate());
  if(anniversary < startOfToday){
    anniversary = new Date(today.getFullYear()+1, GUILD_FOUNDING_DATE.getMonth(), GUILD_FOUNDING_DATE.getDate());
  }
  return Math.round((anniversary - startOfToday) / 86400000);
}
function updateAnniversaryBanner(){
  const banner = document.getElementById('anniversaryBanner');
  const textEl = document.getElementById('anniversaryBannerText');
  if(!banner || !textEl) return;
  let dismissed = false;
  try{ dismissed = sessionStorage.getItem(ANNIVERSARY_DISMISS_KEY) === '1'; }catch{}
  const days = daysUntilNextAnniversary();
  if(dismissed || days < 0 || days > 5){ banner.hidden = true; return; }
  if(days === 0){
    textEl.textContent = currentLang==='es'
      ? '🎉 ¡Hoy es el aniversario de Lua Crescente! 🎂'
      : '🎉 Hoje é o aniversário da Lua Crescente! 🎂';
  } else {
    textEl.textContent = currentLang==='es'
      ? `🎉 Faltan ${days} día${days===1?'':'s'} para el aniversario de Lua Crescente!`
      : `🎉 Faltam ${days} dia${days===1?'':'s'} pro aniversário da Lua Crescente!`;
  }
  banner.hidden = false;
}
document.getElementById('anniversaryBannerClose')?.addEventListener('click', ()=>{
  const banner = document.getElementById('anniversaryBanner');
  if(banner) banner.hidden = true;
  try{ sessionStorage.setItem(ANNIVERSARY_DISMISS_KEY, '1'); }catch{}
});
updateAnniversaryBanner();

function getActiveSeasonalTheme(){
  const today = new Date();
  const m = today.getMonth();
  const d = today.getDate();
  if(m === GUILD_FOUNDING_DATE.getMonth() && d === GUILD_FOUNDING_DATE.getDate()) return 'anniversary';
  if(m === 9 && d >= 25 && d <= 31) return 'halloween';
  if(m === 11 && d >= 20 && d <= 26) return 'christmas';
  return null;
}
function applySeasonalTheme(){
  const theme = getActiveSeasonalTheme();
  if(theme){ document.body.dataset.season = theme; } else { delete document.body.dataset.season; }
  const badge = document.getElementById('seasonalBadge');
  if(!badge) return;
  const icons = { anniversary:'🎉', halloween:'🎃', christmas:'🎄' };
  badge.textContent = theme ? icons[theme] : '';
}
applySeasonalTheme();

function hideFooterModal(modal, restoreFocus=true){
  if(!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
  if(restoreFocus && lastFocusedElement && typeof lastFocusedElement.focus==='function') lastFocusedElement.focus();
}
function openFooterModal(key){
  const idMap={privacy:'footerPrivacyModal',terms:'footerTermsModal',changelog:'footerChangelogModal'};
  const modal=document.getElementById(idMap[key]);
  if(!modal) return;
  lastFocusedElement=document.activeElement;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  closeMobileMenu();
  requestAnimationFrame(()=>modal.querySelector('.guild-modal-close')?.focus());
}
document.querySelectorAll('[data-footer-modal]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    openFooterModal(btn.dataset.footerModal);
    if(btn.dataset.footerModal === 'changelog') markChangelogAsSeen();
  });
});
document.querySelectorAll('.footer-modal').forEach(modal=>{
  modal.querySelectorAll('[data-footer-modal-close]').forEach(el=>el.addEventListener('click',()=>hideFooterModal(modal)));
  modal.querySelector('.footer-modal-dialog')?.addEventListener('click',(e)=>e.stopPropagation());
});
document.addEventListener('keydown', e=>{
  if(e.key!=='Escape') return;
  document.querySelectorAll('.footer-modal.open').forEach(modal=>hideFooterModal(modal));
});

async function loadBdoCoupons(){
  const track=document.getElementById('couponTrack');
  if(!track) return;

  const timeoutId = setTimeout(() => {
      if (track.innerHTML.includes('Carregando')) {
          track.innerHTML = '<div class="coupons-status">Nenhum cupom ativo no momento.</div>';
      }
  }, 5000);

  try{
    const r=await fetch('/.netlify/functions/garmoth-coupons?ts='+Date.now(),{cache:'no-store'});
    clearTimeout(timeoutId);
    if(!r.ok) throw new Error('HTTP ' + r.status);
    const payload=await r.json();
    const coupons=Array.isArray(payload.coupons)?payload.coupons:[];
    
    if(!coupons.length) {
       track.innerHTML = '<div class="coupons-status">Nenhum cupom ativo no momento.</div>';
       return;
    }
    
    lastCouponsPayload=payload;
    renderCouponsModal(payload);
    if(location.hash==='#bdoCoupons') openCouponsModal();

    // Puxa 3 cupons com a formatação correta (Bento)
    track.innerHTML=coupons.slice(0, 3).map(c => {
      const code=String(c.code||'').trim();
      const expiry=String(c.expiry||'Cupom ativo').replace('⏳ ', ''); 
      const items = Array.isArray(c.items) ? c.items : [];
      
      const itemsHtml = items.slice(0, 2).map(item => {
        const name = (typeof item === 'object' && item?.name) ? String(item.name) : (typeof item === 'string' ? item : 'Recompensa');
        const img = (typeof item === 'object' && item?.image) ? String(item.image) : rewardIconFallback(name);
        return img ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(name)}" title="${escapeHtml(name)}" class="bento-coupon-icon" onerror="this.style.display='none'">` : '';
      }).join('');

      return `<div class="bento-coupon-card">
        <div class="bento-coupon-info">
          <div class="bento-coupon-code">${escapeHtml(code)}</div>
          <div class="bento-coupon-expiry">${escapeHtml(expiry)}</div>
        </div>
        <div class="bento-coupon-icons">${itemsHtml}</div>
        <button class="bento-coupon-copy" type="button" data-coupon="${escapeHtml(code)}">Copiar</button>
      </div>`;
    }).join('');

    track.querySelectorAll('.bento-coupon-copy').forEach(btn=>btn.addEventListener('click',async()=>{
      try{
        await navigator.clipboard.writeText(btn.dataset.coupon);
        const old=btn.textContent;
        btn.textContent='Copiado!';
        btn.style.background = '#5BD58A';
        btn.style.color = '#0B0E17';
        setTimeout(()=>{ btn.textContent=old; btn.style.background=''; btn.style.color=''; },1300);
      }catch{}
    }));
  }catch(err){
    clearTimeout(timeoutId);
    console.warn('[Cupons] Falha na API:', err);
    track.innerHTML='<div class="coupons-status">Os cupons estão temporariamente indisponíveis.</div>';
  }
}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
window.addEventListener('DOMContentLoaded',loadBdoCoupons);

// [v106] guardas para os globais de tradução: se ui-translations.js um dia
// carregar depois deste arquivo, o boot não quebra silenciosamente.
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>{
    if(typeof applyLanguage==='function') applyLanguage();
    if(typeof syncActiveNav==='function') syncActiveNav();
  });
}else{
  if(typeof applyLanguage==='function') applyLanguage();
  if(typeof syncActiveNav==='function') syncActiveNav();
}

// =====================================================================
// v97 — Ícones dos itens novos (IDs verificados no BDOCodex)
// =====================================================================

// --- Culinária ---
Object.assign(CULINARY_ICON_IDS, {
  'Pote de Mel Especial': 54032,
  'Frutos do Mar Frito': 9420,
  'Holmick': 9486,
});

// --- Reagentes + Elixires + Poções ---
Object.assign(ROOT_ITEM_ICONS, {
  // --- Reagentes de Alquimia (21) ---
  'Reagente em pó Puro':        codexIcon(5302),
  'Reagente Líquido Limpo':     codexIcon(5301),
  'Reagente de Marcação':       codexIcon(761),
  'Essência da Abundância':     codexIcon(5204),
  'Essência da Destruição':     codexIcon(5216),
  'Essência da Natureza':       codexIcon(5206),
  'Essência de Chama Carmesim': codexIcon(5202),
  'Essência de Encantamento':   codexIcon(5210),
  'Essência do Liquor':         codexIcon(9057),
  'Essência do Poder Mágico':   codexIcon(5212),
  'Óleo da Corrupção':          codexIcon(6604),
  'Óleo da Tempestade':         codexIcon(6602),
  'Óleo de Coragem':            codexIcon(6603),
  'Óleo de Regeneração':        codexIcon(6601),
  'Óleo de Tranquilidade':      codexIcon(6605),
  'Endurecedor de Madeira':     codexIcon(4684),
  'Erva Venenosa':              codexIcon(5603),
  'Esmalte de Couro':           codexIcon(6183),
  'Polidor de Gema':            codexIcon(4481),
  'Pólvora Vegetal':            codexIcon(5604),
  'Solvente de Metal':          codexIcon(4076),

  // --- Elixires Base (completos) ---
  'Elixir de Antídoto':           codexIcon(729),
  'Elixir de Espírito Looney':    codexIcon(777),
  'Elixir de Espírito Looney Poderoso': codexIcon(778),
  'Elixir de Pescador':           codexIcon(726),
  'Elixir da Vontade':            codexIcon(702),
  'Elixir das Asas':              codexIcon(684),
  'Elixir de Amizade':            codexIcon(664),
  'Elixir de Grifo':              codexIcon(740),
  'Elixir de Mão Dourada':        codexIcon(674),
  'Elixir de Resistência':        codexIcon(706),
  'Elixir de Ressurreição':       codexIcon(668),
  'Elixir do Tempo':              codexIcon(749),
  'Elixir de Trabalhador':        codexIcon(724),
  'Elixir de Treinamento':        codexIcon(753),
  'Elixir de Experiência':        codexIcon(714),
  'Elixir de Espinhos':           codexIcon(666),
  'Elixir de Espírito Weenie':    codexIcon(773),
  'Elixir da Energia':            codexIcon(682),
  'Elixir do Selo':               codexIcon(631),
  'Elixir de Hemostasia':         codexIcon(730),
  'Elixir de Caça a Humano':      codexIcon(670),
  'Elixir de Caça a Humanoide':   codexIcon(678),
  'Elixir de Boas Lembranças':    codexIcon(42413),

  // --- Elixires Base Superior (38) ---
  'Elixir da Fúria Infinita':              codexIcon(705),
  'Elixir do Frenesi Infinito':            codexIcon(673),
  'Elixir de Concentração Avançada':       codexIcon(701),
  'Elixir de Defesa de Aço':               codexIcon(717),
  'Elixir Poderoso de Vida':               codexIcon(709),
  'Elixir de Estamina Esmagadora':         codexIcon(723),
  'Elixir do Vento Fluente':               codexIcon(689),
  'Elixir da Rapidez Intrépida':           codexIcon(691),
  'Elixir de Feitiço Ágil':                codexIcon(693),
  'Elixir de Choque Poderoso':             codexIcon(763),
  'Elixir de Ceifador de Alma':            codexIcon(713),
  'Elixir de Morte Brutal':                codexIcon(687),
  'Elixir de Perfuração Brutal':           codexIcon(681),
  'Elixir de Pilhagem Forte':              codexIcon(677),
  'Elixir de Assassino Letal':             codexIcon(697),
  'Elixir de Detecção Afiada':             codexIcon(699),
  'Elixir de Carnificina Brutal':          codexIcon(719),
  'Elixir do Céu Impiedoso':               codexIcon(721),
  'Elixir Perfeito de Caça a Humano':      codexIcon(671),
  'Elixir da Vontade Extraordinária':      codexIcon(703),
  'Elixir das Asas Ascendentes':           codexIcon(685),
  'Elixir de Melhoria de Amizade':         codexIcon(665),
  'Elixir de Caça a Humanoide Feroz':      codexIcon(679),
  'Elixir de Grifo Poderoso':              codexIcon(741),
  'Elixir de Gloriosa Mão Dourada':        codexIcon(675),
  'Elixir de Mentalidade Limpa':           codexIcon(711),
  'Elixir de Resistência Afiada':          codexIcon(707),
  'Elixir de Ressurreição Poderosa':       codexIcon(669),
  'Elixir de Tempo Fluente':               codexIcon(750),
  'Elixir de Trabalhador Habilidoso':      codexIcon(725),
  'Elixir de Treinamento de Especialistas': codexIcon(754),
  'Elixir de Experiência Esplêndida':      codexIcon(715),
  'Elixir de Espinho Afiado':              codexIcon(667),
  'Elixir de Espírito Weenie Afluente':    codexIcon(774),
  'Elixir de Energia Afluente':            codexIcon(683),
  'Elixir do Selo Ágil':                   codexIcon(695),
  'Elixir de Espiral Brilhante':           codexIcon(783),
  'Elixir de Pescador Habilidoso':         codexIcon(727),

  // --- Poções ---
  'Poção de WP (M)':   codexIcon(828),
  'Poção de WP (G)':   codexIcon(829),
  'Poção de WP (XG)':  codexIcon(594),
  'Poção de HP (XG)':  codexIcon(56093),
  'Poção de MP (XG)':  codexIcon(56094),
  'Poção de SP (M)':   codexIcon(832),
  'Poção de SP (G)':   codexIcon(833),
  'Poção de SP (XG)':  codexIcon(598),
});
// v97 — ícones da sidebar pra categorias novas + limpeza das removidas
Object.assign(GROUP_ICONS, {
  'Reagentes de Alquimia': '⚗️',
  'Elixires Base Superior': '✨',
});
// v97.1 — corrige o ícone do grupo renomeado
Object.assign(GROUP_ICONS, {
  'Fármacos Base da Harmonia': '🧪',
});
// =====================================================================
// v108 — Auto-registro de ícones de Processamento
// =====================================================================
// 1. Todo item Culinária também vale como ícone global (Processamento etc.)
Object.keys(CULINARY_ICON_IDS).forEach(function(k){
  if(!ROOT_ITEM_ICONS[k]) ROOT_ITEM_ICONS[k] = CULINARY_ICON_IDS[k];
});
Object.keys(CULINARY_ICON_OVERRIDES).forEach(function(k){
  if(!ROOT_ITEM_ICONS[k]) ROOT_ITEM_ICONS[k] = CULINARY_ICON_OVERRIDES[k];
});

// 2. [Grupo] Elixir X herda o ícone de Elixir X
Object.keys(ROOT_ITEM_ICONS).slice().forEach(function(k){
  if(k.indexOf('[Grupo] ') === 0) return;
  var grupoKey = '[Grupo] ' + k;
  if(!ROOT_ITEM_ICONS[grupoKey]) ROOT_ITEM_ICONS[grupoKey] = ROOT_ITEM_ICONS[k];
});

// 3. Ajustes de nomes específicos (apelidos que variam)
Object.assign(ROOT_ITEM_ICONS, {
  '[Grupo] Elixir de Caça ao Humano': ROOT_ITEM_ICONS['Elixir de Caça a Humano'],
  '[Grupo] Elixir Perfeito de Caça ao Humano': ROOT_ITEM_ICONS['Elixir Perfeito de Caça a Humano'] || ROOT_ITEM_ICONS['Elixir de Caça a Humano'],
  '[Grupo] Elixir de Caça a Humanoide': ROOT_ITEM_ICONS['Elixir de Caça a Humanoide'],
  '[Grupo] Elixir de Caça a Humanoide Feroz': ROOT_ITEM_ICONS['Elixir de Caça a Humanoide Feroz'] || ROOT_ITEM_ICONS['Elixir de Caça a Humanoide'],
  '[Grupo] Elixir de Carnificina': ROOT_ITEM_ICONS['Elixir de Carnificina'],
  '[Grupo] Elixir de Carnificina Brutal': ROOT_ITEM_ICONS['Elixir de Carnificina Brutal'] || ROOT_ITEM_ICONS['Elixir de Carnificina'],
  '[Grupo] Elixir de Detecção': ROOT_ITEM_ICONS['Elixir de Detecção'],
  '[Grupo] Elixir de Detecção Afiada': ROOT_ITEM_ICONS['Elixir de Detecção Afiada'] || ROOT_ITEM_ICONS['Elixir de Detecção'],
  '[Grupo] Elixir de Espinho': ROOT_ITEM_ICONS['Elixir de Espinhos'],
  '[Grupo] Elixir de Espinho Afiado': ROOT_ITEM_ICONS['Elixir de Espinho Afiado'] || ROOT_ITEM_ICONS['Elixir de Espinhos'],
  '[Grupo] Elixir de Espírito Weenie': ROOT_ITEM_ICONS['Elixir de Espírito Weenie'],
  '[Grupo] Elixir de Espírito Looney': ROOT_ITEM_ICONS['Elixir de Espírito Looney'],
  '[Grupo] Elixir de Fúria': ROOT_ITEM_ICONS['Elixir de Fúria'],
  '[Grupo] Elixir de Fúria Infinita': ROOT_ITEM_ICONS['Elixir da Fúria Infinita'] || ROOT_ITEM_ICONS['Elixir de Fúria'],
  '[Grupo] Elixir de Grifo': ROOT_ITEM_ICONS['Elixir de Grifo'],
  '[Grupo] Elixir de Grifo Poderoso': ROOT_ITEM_ICONS['Elixir de Grifo Poderoso'] || ROOT_ITEM_ICONS['Elixir de Grifo'],
  '[Grupo] Elixir de Morte': ROOT_ITEM_ICONS['Elixir da Morte'],
  '[Grupo] Elixir de Morte Bruta': ROOT_ITEM_ICONS['Elixir de Morte Brutal'] || ROOT_ITEM_ICONS['Elixir da Morte'],
  '[Grupo] Elixir de Resistência': ROOT_ITEM_ICONS['Elixir de Resistência'],
  '[Grupo] Elixir de Resistência Afiada': ROOT_ITEM_ICONS['Elixir de Resistência Afiada'] || ROOT_ITEM_ICONS['Elixir de Resistência'],
  '[Grupo] Elixir de Treinamento': ROOT_ITEM_ICONS['Elixir de Treinamento'],
  '[Grupo] Elixir de Treinamento de Especialistas': ROOT_ITEM_ICONS['Elixir de Treinamento de Especialistas'] || ROOT_ITEM_ICONS['Elixir de Treinamento'],
  '[Grupo] Elixir do Céu': ROOT_ITEM_ICONS['Elixir do Céu'],
  '[Grupo] Elixir do Céu Impiedoso': ROOT_ITEM_ICONS['Elixir do Céu Impiedoso'] || ROOT_ITEM_ICONS['Elixir do Céu'],
  '[Grupo] Elixir do Frenesi': ROOT_ITEM_ICONS['Elixir do Frenesi'],
  '[Grupo] Elixir do Frenesi Infinito': ROOT_ITEM_ICONS['Elixir do Frenesi Infinito'] || ROOT_ITEM_ICONS['Elixir do Frenesi'],
  '[Grupo] Elixir do Vento': ROOT_ITEM_ICONS['Elixir do Vento'],
  '[Grupo] Elixir do Vento Afluente': ROOT_ITEM_ICONS['Elixir do Vento Fluente'] || ROOT_ITEM_ICONS['Elixir do Vento'],
  '[Grupo] Elixir Selo Ágil': ROOT_ITEM_ICONS['Elixir do Selo Ágil'],
  '[Grupo] Elixir de Vida': ROOT_ITEM_ICONS['Elixir de Vida'],
  '[Grupo] Elixir de Tempo': ROOT_ITEM_ICONS['Elixir do Tempo'],
  '[Grupo] Elixir de Tempo Afluente': ROOT_ITEM_ICONS['Elixir de Tempo Fluente'] || ROOT_ITEM_ICONS['Elixir do Tempo'],
  '[Grupo] Elixir de Trabalhador': ROOT_ITEM_ICONS['Elixir de Trabalhador'],
  '[Grupo] Elixir de Trabalhador Habilidoso': ROOT_ITEM_ICONS['Elixir de Trabalhador Habilidoso'] || ROOT_ITEM_ICONS['Elixir de Trabalhador'],
  '[Grupo] Elixir de Pescador': ROOT_ITEM_ICONS['Elixir de Pescador'],
  '[Grupo] Elixir de Pescador Habilidoso': ROOT_ITEM_ICONS['Elixir de Pescador Habilidoso'] || ROOT_ITEM_ICONS['Elixir de Pescador'],
  '[Grupo] Elixir de Pilhagem': ROOT_ITEM_ICONS['Elixir de Pilhagem'],
  '[Grupo] Elixir de Pilhagem Forte': ROOT_ITEM_ICONS['Elixir de Pilhagem Forte'] || ROOT_ITEM_ICONS['Elixir de Pilhagem'],
  '[Grupo] Elixir de Rapidez': ROOT_ITEM_ICONS['Elixir de Rapidez'],
  '[Grupo] Elixir de Rapidez Intrépida': ROOT_ITEM_ICONS['Elixir da Rapidez Intrépida'] || ROOT_ITEM_ICONS['Elixir de Rapidez'],
  '[Grupo] Elixir de Feitiço': ROOT_ITEM_ICONS['Elixir de Feitiço'],
  '[Grupo] Elixir de Feitiço Ágil': ROOT_ITEM_ICONS['Elixir de Feitiço Ágil'] || ROOT_ITEM_ICONS['Elixir de Feitiço'],
  '[Grupo] Elixir de Concentração': ROOT_ITEM_ICONS['Elixir da Concentração'],
  '[Grupo] Elixir de Concentração Avançada': ROOT_ITEM_ICONS['Elixir de Concentração Avançada'] || ROOT_ITEM_ICONS['Elixir da Concentração'],
  '[Grupo] Elixir de Defesa': ROOT_ITEM_ICONS['Elixir da Defesa'],
  '[Grupo] Elixir de Defesa de Aço': ROOT_ITEM_ICONS['Elixir de Defesa de Aço'] || ROOT_ITEM_ICONS['Elixir da Defesa'],
  '[Grupo] Elixir de Energia': ROOT_ITEM_ICONS['Elixir da Energia'],
  '[Grupo] Elixir de Energia Afluente': ROOT_ITEM_ICONS['Elixir de Energia Afluente'] || ROOT_ITEM_ICONS['Elixir da Energia'],
  '[Grupo] Elixir de Estamina': ROOT_ITEM_ICONS['Elixir de Estamina'],
  '[Grupo] Elixir de Estamina Esmagadora': ROOT_ITEM_ICONS['Elixir de Estamina Esmagadora'] || ROOT_ITEM_ICONS['Elixir de Estamina'],
  '[Grupo] Elixir de Experiência': ROOT_ITEM_ICONS['Elixir de Experiência'],
  '[Grupo] Elixir de Experiência Esplendida': ROOT_ITEM_ICONS['Elixir de Experiência Esplêndida'] || ROOT_ITEM_ICONS['Elixir de Experiência'],
  '[Grupo] Elixir de Choque': ROOT_ITEM_ICONS['Elixir de Choque'],
  '[Grupo] Elixir de Choque Poderoso': ROOT_ITEM_ICONS['Elixir de Choque Poderoso'] || ROOT_ITEM_ICONS['Elixir de Choque'],
  '[Grupo] Elixir de Amizade': ROOT_ITEM_ICONS['Elixir de Amizade'],
  '[Grupo] Elixir de Melhoria de Amizade': ROOT_ITEM_ICONS['Elixir de Melhoria de Amizade'] || ROOT_ITEM_ICONS['Elixir de Amizade'],
  '[Grupo] Elixir de Antídoto': ROOT_ITEM_ICONS['Elixir de Antídoto'],
  '[Grupo] Elixir de Assassino': ROOT_ITEM_ICONS['Elixir de Assassinato'],
  '[Grupo] Elixir de Assassino Letal': ROOT_ITEM_ICONS['Elixir de Assassino Letal'] || ROOT_ITEM_ICONS['Elixir de Assassinato'],
  '[Grupo] Elixir de Ceifador': ROOT_ITEM_ICONS['Elixir do Ceifador'],
  '[Grupo] Elixir de Ceifador de Alma': ROOT_ITEM_ICONS['Elixir de Ceifador de Alma'] || ROOT_ITEM_ICONS['Elixir do Ceifador'],
  '[Grupo] Elixir de Hemostasia': ROOT_ITEM_ICONS['Elixir de Hemostasia'],
  '[Grupo] Elixir de Mentalidade': ROOT_ITEM_ICONS['Elixir de Mentalidade'],
  '[Grupo] Elixir de Mentalidade Limpa': ROOT_ITEM_ICONS['Elixir de Mentalidade Limpa'] || ROOT_ITEM_ICONS['Elixir de Mentalidade'],
  '[Grupo] Elixir de Perfuração': ROOT_ITEM_ICONS['Elixir de Perfuração'],
  '[Grupo] Elixir de Perfuração Brutal': ROOT_ITEM_ICONS['Elixir de Perfuração Brutal'] || ROOT_ITEM_ICONS['Elixir de Perfuração'],
  '[Grupo] Elixir de Remoção de Queimadura': ROOT_ITEM_ICONS['Elixir de Remoção de Queimadura'],
  '[Grupo] Elixir de Ressurreição': ROOT_ITEM_ICONS['Elixir de Ressurreição'],
  '[Grupo] Elixir de Ressurreição Poderosa': ROOT_ITEM_ICONS['Elixir de Ressurreição Poderosa'] || ROOT_ITEM_ICONS['Elixir de Ressurreição'],
  '[Grupo] Elixir de Mão Dourada': ROOT_ITEM_ICONS['Elixir de Mão Dourada'],
  '[Grupo] Elixir de Gloriosa Mão Dourada': ROOT_ITEM_ICONS['Elixir de Gloriosa Mão Dourada'] || ROOT_ITEM_ICONS['Elixir de Mão Dourada'],
  '[Grupo] Elixir das Asas': ROOT_ITEM_ICONS['Elixir das Asas'],
  '[Grupo] Elixir das Asas Ascendentes': ROOT_ITEM_ICONS['Elixir das Asas Ascendentes'] || ROOT_ITEM_ICONS['Elixir das Asas'],
  '[Grupo] Elixir da Vontade': ROOT_ITEM_ICONS['Elixir da Vontade'],
  '[Grupo] Elixir da Vontade Extraordinária': ROOT_ITEM_ICONS['Elixir da Vontade Extraordinária'] || ROOT_ITEM_ICONS['Elixir da Vontade'],
  '[Grupo] Elixir Poderoso de Vida': ROOT_ITEM_ICONS['Elixir Poderoso de Vida'] || ROOT_ITEM_ICONS['Elixir de Vida']
});
// =====================================================================
// v102 — Timeline do Registro de Alterações (10 versões)
// =====================================================================

const CHANGELOG_DATA = [
  {
    version: 140, date: '2026-10-21', tag: 'site',
    added: [
      'Novo layout "Bento Grid" na página inicial',
      'Card da Sala de Aula integrado na Home puxando posts do Blogger',
      'Busca global com sugestões em tempo real (autocomplete)',
      'Botão de "Voltar ao topo" flutuante e discreto',
      'Barra de rolagem personalizada (fina e dourada)',
      'Rodapé reformulado com 5 colunas e QR Code do LivePix clicável',
      'Contador de membros online do Discord no rodapé',
      'Tela cheia nativa nas páginas de Mapa de Edania e Mapa de Pesca'
    ],
    changed: [
      'Nova identidade visual: fundo com imagem do templo e degradê aplicado em todas as páginas',
      'Timers do topo redesenhados (ícones de 20px e layout fixo)',
      'Menus e páginas internas de Receitas, Processamento, Itens Tesouro e Combos totalmente reformulados',
      'Menu principal agora conta com a aba "Artefatos" (Combos)'
    ],
    fixed: [
      'Correção do ícone e nome da página "Bancada" no menu',
      'Textos dos Avisos do Discord agora são limpos (sem os "#" e "*")',
      'O nome de quem postou os avisos foi ocultado para preservar a privacidade',
      'Layout dos botões da Árvore de Receitas e das abas (Imortalidade/Receita Base)',
      'Responsividade mobile aprimorada em todo o site'
    ]
  },
  {
    version: 102, date: '2026-10-16', tag: 'site',
    added: [
      'Mapa de Edania / Dokebi',
      'Mapa de Pesca — zonas com cores e bordas de fácil interpretação, filtros de camadas (zonas/hotspots/nomes), busca com autocomplete, painel da zona com tempo de mordida e lista de peixes, e card detalhado do peixe no hover (peso, vida útil, preço, descrição e guia)',
      'Nova página "Processamento" com as receitas de refino',
      'Página própria de "Itens Tesouro" (antes ficava dentro de Receitas)',
      'Seção "Apoie" com link do Discord e QR Code do LivePix',
      'Barra de pesquisa do site agora exibe os resultados em tempo real enquanto você digita'
    ],
    changed: [
      'Aba "Receitas" renomeada para "Bancada" e reorganizada como Combinações de Artefatos'
    ],
    fixed: [
      'Tags dos canais "Tutoriais" e "Lore" estavam invertidas',
      'Problema de exibição na aba de Eventos',
      'Problema de abertura/fechamento no modal de Agenda de Boss'
    ]
  },
  {
    version: 101, date: '2026-10-09', tag: 'site',
    changed: [
      'Rodapé padronizado nas 4 páginas (link do Discord + QR Code do LivePix na coluna "Apoie")',
      'CSS consolidado: removidas duplicações em site.css e coupons.css',
      'Versões de cache dos assets alinhadas entre as 4 páginas'
    ],
    fixed: [
      'Seção "Receitas mais vistas" da Home voltou a aparecer',
      'Rótulos dos vídeos na Home corrigidos (Lore/Tutorial estavam trocados)',
      '"Seivas" removida dos fallbacks de categoria (já não existia no menu)',
      'Scroll da página agora trava quando qualquer modal abre',
      'README.md reescrito em UTF-8'
    ]
  },
  {
    version: 100, date: '2026-09-30', tag: 'site',
    added: [
      'Ícones da sidebar pra "Reagentes de Alquimia" e "Elixires Base Superior"',
      'Ícone do Discord no rodapé com contador de membros online',
      'Seção "Últimos Vídeos" do YouTube na Home',
      'Seção "Avisos da Guilda" na Home, puxando do Discord',
      'Timeline de changelog com as 10 últimas versões'
    ],
    changed: ['Home agora mostra 5 cards de guia (era 3)'],
    fixed: [
      'Ícones de ~80 itens novos (elixires, reagentes, poções) que estavam quebrados',
      'Ícone do grupo "Fármacos Base da Harmonia"'
    ]
  },
  {
    version: 99, date: '2026-09-29', tag: 'site',
    added: [
      'Categoria "Elixires Base Superior" com 38 itens',
      'Categoria "Reagentes de Alquimia" com 23 itens',
      'Poção de HP (XG), MP (XG), SP (M/G/XG)'
    ],
    changed: [
      'Elixires Base expandidos de 20 pra 44 itens',
      'Fármacos Base renomeados pra "Fármacos Base da Harmonia"'
    ]
  },
  {
    version: 98, date: '2026-09-29', tag: 'site',
    added: ['Culinária: "Frutos do Mar Frito", "Holmick", "Pote de Mel Especial"'],
    changed: [
      'Culinária passou de 150 pra 153 itens',
      'Culinária Especial: 10 itens agora mostram aviso de "Oficina Real"'
    ]
  },
  {
    version: 97, date: '2026-09-28', tag: 'site',
    changed: [
      'Sangues reduzidos de 35 pra 5 (só os craftáveis)',
      'Trabalhadores energia reduzidos de 8 pra 2',
      'Poções atualizadas (8 → 15)',
      'Ração Orgânica ganhou 2ª rota (com Saurel Desidratado)'
    ],
    fixed: ['Seivas removida do menu (não tinha receita craftável)']
  },
  {
    version: 96, date: '2026-09-27', tag: 'site',
    fixed: ['Barra de rolagem lateral da sidebar de grupos agora segue o tema']
  },
  {
    version: 95, date: '2026-09-25', tag: 'site',
    added: [
      'Página "Artefatos" (Combos de Pedras da Luz)',
      'Filtros de categoria e busca nos Combos',
      'Exportar combo como imagem'
    ]
  },
  {
    version: 94, date: '2026-09-22', tag: 'site',
    added: [
      'Sala de Aula integrada com Blogger',
      'Cards de guia na Home puxando os mais recentes'
    ],
    changed: ['Sala de Aula deixou de ser placeholder']
  },
  {
    version: 93, date: '2026-09-18', tag: 'site',
    added: [
      'Sistema de idiomas PT / Espanhol LATAM',
      'Traduções de nomes de item (BDO Codex /sp/)'
    ]
  },
  {
    version: 92, date: '2026-09-15', tag: 'site',
    changed: ['Sistema de Receitas refeito: categorias carregam sob demanda'],
    fixed: [
      'Árvores de receita mostram sub-receitas em cascata',
      'Substituições de grupo listadas como opções individuais'
    ]
  },
  {
    version: 90, date: '2026-09-12', tag: 'site',
    added: [
      'Seção "Eventos" na Home (linha do tempo automática)',
      'Abas Temporários / Permanentes',
      'Seção de Cupons do BDO'
    ]
  }
];

function changelogRelativeDate(isoDate){
  const now = new Date();
  const then = new Date(isoDate + 'T12:00:00');
  const diffDays = Math.floor((now - then) / 86400000);
  if(diffDays <= 0) return 'hoje';
  if(diffDays === 1) return 'há 1 dia';
  if(diffDays < 30) return `há ${diffDays} dias`;
  const months = Math.floor(diffDays / 30);
  return months === 1 ? 'há 1 mês' : `há ${months} meses`;
}

function renderChangelogTimeline(){
  const el = document.getElementById('footerChangelogContent');
  if(!el) return;

  const summaryOf = (v)=>{
    const parts = [];
    if(v.added?.length) parts.push(`${v.added.length} Adicionado`);
    if(v.changed?.length) parts.push(`${v.changed.length} Alterado`);
    if(v.fixed?.length) parts.push(`${v.fixed.length} Corrigido`);
    return parts.join(' · ');
  };

  const renderGroup = (label, items, icon)=>{
    if(!items?.length) return '';
    return `<div class="cl-group">
      <div class="cl-group-label">${label}</div>
      ${items.map(i=>`<div class="cl-item"><span class="cl-item-icon">${icon}</span><span>${i}</span></div>`).join('')}
    </div>`;
  };

  el.innerHTML = `<div class="cl-timeline">${
    CHANGELOG_DATA.map(v=>`
      <article class="cl-entry">
        <header class="cl-entry-head">
          <span class="cl-tag cl-tag-${v.tag}">${v.tag === 'site' ? '🌐 Site' : '📱 App'}</span>
          <span class="cl-version">v${v.version}</span>
          <span class="cl-date">${v.date}</span>
          <span class="cl-relative">${changelogRelativeDate(v.date)}</span>
          <span class="cl-summary">${summaryOf(v)}</span>
        </header>
        ${renderGroup('ADICIONADO', v.added, '➕')}
        ${renderGroup('ALTERADO', v.changed, '✏️')}
        ${renderGroup('CORRIGIDO', v.fixed, '✓')}
      </article>
    `).join('')
  }</div>`;
}

renderChangelogTimeline();
// =====================================================================
// v103 — Vídeos do YouTube, Avisos do Discord e Contador de membros
// =====================================================================

async function loadYouTubeVideos(){
  const grid = document.getElementById('videoGrid');
  if(!grid) return;
  try{
    const r = await fetch('/.netlify/functions/youtube-videos?ts=' + Date.now(), {cache:'no-store'});
    if(!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    const videos = Array.isArray(data.videos) ? data.videos : [];
    if(!videos.length) throw new Error('sem vídeos');

    grid.innerHTML = videos.slice(0, 4).map(v => `
      <button type="button" class="video-card" data-video-id="${escapeHtml(v.id)}" data-video-title="${escapeHtml(v.title)}">
        <div class="video-thumb-wrap">
          <img class="video-thumb" src="${escapeHtml(v.thumbnail)}" alt="" loading="lazy" referrerpolicy="no-referrer">
          <span class="video-play" aria-hidden="true">▶</span>
        </div>
        <div class="video-info">
          <span class="video-title">${escapeHtml(v.title)}</span>
          <span class="video-meta">${relativeDate(v.published)}${v.source==='lore' ? ' · 🌙 Lore' : ' · 📚 Tutorial'}</span>
        </div>
      </button>
    `).join('');

    grid.querySelectorAll('.video-card').forEach(btn => {
      btn.addEventListener('click', () => openVideoModal(btn.dataset.videoId, btn.dataset.videoTitle));
    });
  }catch(err){
    console.warn('[Vídeos]', err);
    grid.innerHTML = '<div class="video-status" style="grid-column: 1/-1; text-align: center; color: var(--text-dim); padding: 40px;">Não foi possível carregar os vídeos agora.</div>';
  }
}

async function loadDiscordAnnouncements(){
  const grid = document.getElementById('announcementGrid');
  if(!grid) return;
  try{
    const r = await fetch('/.netlify/functions/discord-announcements?ts=' + Date.now(), {cache:'no-store'});
    if(!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    const posts = Array.isArray(data.announcements) ? data.announcements : [];
    if(!posts.length) throw new Error('sem avisos');

    grid.innerHTML = posts.slice(0, 5).map((p, i) => {
      // Remove os "#" e "*" do começo e fim do título
      const tituloLimpo = p.title.replace(/^[#*\s]+/, '').replace(/[#*\s]+$/, '');
      
      return `
      <button type="button" class="announcement-card" data-idx="${i}">
        ${p.image ? `<div class="announcement-thumb-wrap"><img class="announcement-thumb" src="${escapeHtml(p.image)}" alt="" loading="lazy" referrerpolicy="no-referrer"></div>` : ''}
        <div class="announcement-info">
          <span class="announcement-meta">${relativeDate(p.timestamp)}</span>
          <span class="announcement-title">${escapeHtml(tituloLimpo)}</span>
        </div>
      </button>
    `}).join('');

    grid.querySelectorAll('.announcement-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = posts[Number(btn.dataset.idx)];
        if(p) openAnnouncementModal(p);
      });
    });
  }catch(err){
    console.warn('[Avisos]', err);
    grid.innerHTML = '<div class="announcement-status">Não foi possível carregar os avisos agora.</div>';
  }
}

async function loadDiscordCounter(){
  const el = document.getElementById('discordOnlineCount');
  if(!el) return;
  try{
    const r = await fetch('/.netlify/functions/discord-guild?ts=' + Date.now(), {cache:'no-store'});
    if(!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    if(typeof data.online === 'number'){
      el.textContent = `${data.online} On`;
    } else {
      el.textContent = 'Discord';
    }
  }catch(err){
    el.textContent = 'Discord';
  }
}

function openVideoModal(id, title){
  const modal = document.getElementById('homeModal');
  const content = document.getElementById('homeModalContent');
  if(!modal || !content) return;
  content.innerHTML = `
    <h2 id="homeModalTitle" class="home-modal-title">${escapeHtml(title || 'Vídeo')}</h2>
    <div class="video-embed">
      <iframe
        src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0"
        title="${escapeHtml(title || 'Vídeo')}"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>
    </div>
  `;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function openAnnouncementModal(post){
  const modal = document.getElementById('homeModal');
  const content = document.getElementById('homeModalContent');
  if(!modal || !content) return;
  
  // 1. Limpa o título
  const tituloLimpo = post.title.replace(/^[#*\s]+/, '').replace(/[#*\s]+$/, '');
  
  // 2. Limpa o corpo do texto (remove os "#" e "*" do Discord)
  let corpoLimpo = post.body || '';
  corpoLimpo = corpoLimpo.replace(/^[#*>\s]+/gm, ''); // Tira # e > do começo das linhas
  corpoLimpo = corpoLimpo.replace(/\*\*(.*?)\*\*/g, '$1'); // Tira **negrito**
  corpoLimpo = corpoLimpo.replace(/\*(.*?)\*/g, '$1'); // Tira *itálico*
  corpoLimpo = corpoLimpo.replace(/__(.*?)__/g, '$1'); // Tira __sublinhado__
  corpoLimpo = corpoLimpo.replace(/~~(.*?)~~/g, '$1'); // Tira ~~riscado~~

  content.innerHTML = `
    <h2 id="homeModalTitle" class="home-modal-title">${escapeHtml(tituloLimpo)}</h2>
    <div class="home-modal-meta">${relativeDate(post.timestamp)} · ${escapeHtml(post.author)}</div>
    ${post.image ? `<img class="home-modal-image" src="${escapeHtml(post.image)}" alt="" referrerpolicy="no-referrer">` : ''}
    <div class="home-modal-body">${escapeHtml(corpoLimpo).replace(/\n/g, '<br>')}</div>
  `;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeHomeModal(){
  const modal = document.getElementById('homeModal');
  const content = document.getElementById('homeModalContent');
  if(!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  // Pra parar o vídeo quando fechar
  if(content) content.innerHTML = '';
}

document.querySelectorAll('[data-home-modal-close]').forEach(el => {
  el.addEventListener('click', closeHomeModal);
});
document.addEventListener('keydown', e => {
  if(e.key === 'Escape') closeHomeModal();
});

function relativeDate(iso){
  if(!iso) return '';
  const then = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - then) / 1000);
  if(diff < 60) return 'agora';
  if(diff < 3600) return `há ${Math.floor(diff/60)} min`;
  if(diff < 86400) return `há ${Math.floor(diff/3600)} h`;
  const days = Math.floor(diff / 86400);
  if(days === 1) return 'há 1 dia';
  if(days < 30) return `há ${days} dias`;
  const months = Math.floor(days / 30);
  return months === 1 ? 'há 1 mês' : `há ${months} meses`;
}

window.addEventListener('DOMContentLoaded', () => {
  if(document.body.getAttribute('data-page') === 'home'){
    buildHomePopular();
    loadYouTubeVideos();
    loadDiscordAnnouncements();
  }
  loadDiscordCounter();
});

// =====================================================================
// BUSCA COM SUGESTÕES (AUTOCOMPLETE) - v3 (via search-index.json)
// =====================================================================
(function() {
  const searchInput = document.getElementById('search');
  const suggestionsBox = document.getElementById('searchSuggestions');
  
  if (!searchInput || !suggestionsBox) return;

  let SEARCH_INDEX = [];

  fetch('/assets/data/search-index.json')
    .then(r => r.ok ? r.json() : [])
    .then(data => {
      // Define qual tipo de dado buscar de acordo com a página
let pageType = 'recipe';
if (document.body.dataset.page === 'processamento') pageType = 'process';
if (document.body.dataset.page === 'itens-tesouro') pageType = 'treasure';

SEARCH_INDEX = (data || []).filter(e => e.t === pageType);
      console.log('[Busca] Índice carregado:', SEARCH_INDEX.length, 'receitas');
    })
    .catch(err => console.warn('[Busca] Falha ao carregar índice:', err));

  function normSearch(s){
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function openRecipeItem(name){
    requestAnimationFrame(() => {
      let el = null;
      try { el = document.querySelector(`.root-item[data-item-name="${CSS.escape(name)}"]`); } catch(e) {}
      if (!el) {
        const idx = DATA.findIndex(i => i.name === name);
        if (idx >= 0) el = document.querySelector(`.root-item[data-idx="${idx}"]`);
      }
      if (el) {
        if (typeof hydrateRoot === 'function') hydrateRoot(el);
        el.classList.add('open');
        el.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    });
  }

  searchInput.addEventListener('input', (e) => {
    const raw = e.target.value.trim();
    const q = normSearch(raw);
    
    if (!q) {
      suggestionsBox.style.display = 'none';
      if (typeof draw === 'function') draw('');
      return;
    }

    const source = SEARCH_INDEX.length > 0 
      ? SEARCH_INDEX.map(i => ({ n: i.n, g: i.g }))
      : DATA.map(i => ({ n: i.name, g: i.group }));

    const seen = new Set();
    const unique = [];
    for (const item of source) {
      if (!item.n) continue;
      const key = item.g + '::' + item.n;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(item);
    }

    const matches = unique
      .filter(item => normSearch(item.n).includes(q) || normSearch(item.g).includes(q))
      .slice(0, 10);

    if (!matches.length) {
      suggestionsBox.innerHTML = '<div class="suggestion-item"><span class="suggestion-title" style="color:var(--text-dim)">Nenhuma receita encontrada</span></div>';
      suggestionsBox.style.display = 'block';
      return;
    }

    suggestionsBox.innerHTML = matches.map(item => `
      <div class="suggestion-item" data-name="${item.n.replace(/"/g, '&quot;')}" data-group="${item.g.replace(/"/g, '&quot;')}">
        <span class="suggestion-title">${item.n}</span>
        <span class="suggestion-group">${item.g}</span>
      </div>
    `).join('');
    
    suggestionsBox.style.display = 'block';

    suggestionsBox.querySelectorAll('.suggestion-item').forEach(el => {
      el.addEventListener('click', () => {
        const name = el.dataset.name;
        const group = el.dataset.group;
        
        suggestionsBox.style.display = 'none';
        searchInput.value = name;

        if (group && group !== activeGroup) {
          if (typeof categoryRequestToken !== 'undefined') categoryRequestToken++;
          const token = typeof categoryRequestToken !== 'undefined' ? categoryRequestToken : 1;
          activeGroup = group;
          if (typeof buildSidebar === 'function') buildSidebar();
          
          if (window.loadRecipeCategory) {
            window.loadRecipeCategory(group).then(data => {
              if (token !== categoryRequestToken) return;
              if (window.applyRecipeData) window.applyRecipeData(data, group);
              if (typeof draw === 'function') draw(name);
              openRecipeItem(name);
            }).catch(err => {
              console.error('[Busca] Erro ao carregar grupo:', err);
            });
          }
        } else {
          if (typeof draw === 'function') draw(name);
          openRecipeItem(name);
        }
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.style.display = 'none';
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      suggestionsBox.style.display = 'none';
      if (typeof draw === 'function') draw('');
    }
  });
})();