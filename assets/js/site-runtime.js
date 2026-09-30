// Lua Crescente — runtime compartilhado das páginas
// A lógica de dados fica em assets/data/.

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
Object.entries(SUBRECIPES).forEach(([name, info])=>{
  if(Array.isArray(info.children) && info.children.length) registerExpandDefinition(name, {children:info.children, note:info.note});
});
}

const SOURCE_INDEX = {...LEAF_SOURCES};

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
  const rawRootIcon = ROOT_ITEM_ICONS[item.name] ?? ((item.group==='Culinária' || item.group==='Rações') ? (CULINARY_ICON_OVERRIDES[item.name] ?? CULINARY_ICON_IDS[item.name]) : '');
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
const GROUP_ICONS = { 'Fármacos da Harmonia':'🧪', 'Fármacos Base':'🧪', 'Fármacos Tradicionais':'⚗️', 'Elixires Base':'🧴', 'Sangues':'🩸', 'Seivas':'🌿', 'Perfumes':'🌸', 'Culinária':'🍲', 'Culinária Especial':'✨', 'Rações':'🥕', 'Pergaminhos':'📜', 'Trabalhadores energia':'👷', 'Poções':'🧴', 'Itens Tesouro':'💎' };
const GROUP_ORDER = ['Fármacos da Harmonia','Fármacos Base','Elixires Base','Sangues','Seivas','Fármacos Tradicionais','Perfumes','Culinária','Rações','Culinária Especial','Pergaminhos','Trabalhadores energia','Poções','Itens Tesouro'];
const GROUP_LABELS = {
  pt: {'Fármacos da Harmonia':'Fármacos da Harmonia','Fármacos Base':'Fármacos Base','Elixires Base':'Elixires Base','Sangues':'Sangues','Seivas':'Seivas','Fármacos Tradicionais':'Fármacos Tradicionais','Perfumes':'Perfumes','Culinária':'Culinária','Rações':'Rações','Culinária Especial':'Culinária Especial','Pergaminhos':'Pergaminhos','Trabalhadores energia':'Trabalhadores energia','Poções':'Poções','Itens Tesouro':'Itens Tesouro'},
  es: {'Fármacos da Harmonia':'Fármacos de la Armonía','Fármacos Base':'Fármacos Base','Elixires Base':'Elixires Base','Sangues':'Sangres','Seivas':'Savia','Fármacos Tradicionais':'Fármacos Tradicionales','Perfumes':'Perfumes','Culinária':'Cocina','Rações':'Alimentos de montarias e mascotes','Culinária Especial':'Cocina Especial','Pergaminhos':'Pergaminos','Trabalhadores energia':'Energía de trabajadores','Poções':'Pociones','Itens Tesouro':'Tesoros'}
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
  const filtered = DATA.map((item,i)=>({item,i}))
    .filter(({item})=> item.group===activeGroup)
    .filter(({item})=> !q || itemMatches(item,q));
  listEl.innerHTML = filtered.map(({item,i})=> renderRoot(item,i)).join('');
  emptyEl.style.display = filtered.length? 'none':'block';
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

document.getElementById('search')?.addEventListener('input', (e)=> draw(e.target.value));
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
  const searchEl=document.getElementById('search'); if(searchEl) searchEl.value=initialSearch;
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
  const urls={home:'/',culinaria:'/receitas.html','sala-de-aula':'/sala-de-aula.html',combos:'/combos.html'};
  const target=urls[page]||urls.home;
  if(location.pathname.endsWith('/'+target) || (target==='index.html' && (location.pathname.endsWith('/') || location.pathname.endsWith('index.html')))) return;
  location.href=target;
}

syncActiveNav();
document.querySelectorAll('.site-tab').forEach(a=>{
  a.addEventListener('click',()=>closeMobileMenu());
});

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
const CURRENT_CHANGELOG_VERSION = 100;
const FOOTER_CHANGELOG_HTML = `
  <div class="changelog-version">Versão 90</div>
  <div class="changelog-date">29 de setembro de 2026</div>
  <ul>
    <li>Nova seção "Eventos" na Home, abaixo dos cupons: uma linha do tempo automática com os eventos em andamento no BDO, lida direto do site oficial da Pearl Abyss (com paginação, pra não perder nenhum evento). Clique num evento pra abrir a página dele.</li>
    <li>Cada evento ganhou uma cor sólida própria e o quadro passou a ter fundo escuro fixo, igual ao resto do site, em vez de deixar a imagem de fundo aparecer por trás.</li>
    <li>Corrigido um bug de CSS que criava uma barra de rolagem vertical desnecessária no quadro de eventos; agora ele só cresce/encolhe verticalmente sozinho, mostrando sempre todos os eventos de uma vez (a rolagem horizontal pras datas continua normal).</li>
  </ul>
`;
const FOOTER_MODAL_CONTENT = {privacy:FOOTER_PRIVACY_HTML, terms:FOOTER_TERMS_HTML, changelog:FOOTER_CHANGELOG_HTML};
document.getElementById('footerPrivacyContent')?.insertAdjacentHTML('beforeend', FOOTER_PRIVACY_HTML);
document.getElementById('footerTermsContent')?.insertAdjacentHTML('beforeend', FOOTER_TERMS_HTML);
document.getElementById('footerChangelogContent')?.insertAdjacentHTML('beforeend', FOOTER_CHANGELOG_HTML);

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
  try{
    const r=await fetch('/.netlify/functions/garmoth-coupons?ts='+Date.now(),{cache:'no-store'});
    if(!r.ok) throw new Error('endpoint indisponível');
    const payload=await r.json();
    const coupons=Array.isArray(payload.coupons)?payload.coupons:[];
    if(!coupons.length) throw new Error('nenhum cupom ativo encontrado');
    lastCouponsPayload=payload;
    renderCouponsModal(payload);
    if(location.hash==='#bdoCoupons') openCouponsModal();

    track.innerHTML=coupons.slice(0,10).map(c=>{
      const code=String(c.code||'').trim();
      const expiry=String(c.expiry||'Cupom ativo');
      const items=Array.isArray(c.items)?c.items:[];
      const fallbackItems=items.length?items:['Recompensas do cupom'];
      const visibleCount=Math.min(4,fallbackItems.length);
      const moreCount=Math.max(0,fallbackItems.length-visibleCount);
      return `<article class="coupon-card ${c.source==='fallback'?'coupon-card-fallback':''}">
        <div class="coupon-card-head">
          <div class="coupon-badge">ENCELADUS CUPONS</div>
          <span class="coupon-server">🇧🇷 SA</span>
        </div>
        <div class="coupon-code-row">
          <div class="coupon-code" title="${escapeHtml(code)}">${escapeHtml(code)}</div>
          <button class="coupon-copy" type="button" data-coupon="${escapeHtml(code)}">COPIAR</button>
        </div>
        <div class="coupon-expiry"><span>⏳</span> ${escapeHtml(expiry)}</div>
        <div class="coupon-rewards-title">🎁 RECOMPENSAS</div>
        <div class="coupon-rewards" data-more="${moreCount}">
          ${fallbackItems.slice(0,visibleCount).map((item,i)=>{
          const raw=typeof item==='string' ? item : (item?.name||item?.title||'Recompensa');
          const m=String(raw).match(/^(\d+)x\s*(.*)$/i);
          const qty=(typeof item==='object' && item?.qty!==undefined && String(item.qty)!=='') ? String(item.qty) : (m?m[1]:'');
          const name=(typeof item==='object' && item?.name) ? String(item.name) : (m?m[2]:String(raw));
          const img=(typeof item==='object' && item?.image) ? String(item.image) : rewardIconFallback(name);
          return `<div class="coupon-reward" title="${escapeHtml(name)}">${img?`<img src="${escapeHtml(img)}" alt="${escapeHtml(name)}" data-itemid="${escapeHtml((img.match(/item\/(\d+)\.png/i)||[])[1]||'')}" data-name="${escapeHtml(name)}" loading="lazy" referrerpolicy="no-referrer" onerror="if(!this.dataset.retry){this.dataset.retry='1';this.src='/.netlify/functions/garmoth-coupons?icon='+encodeURIComponent(this.dataset.itemid||'')+'&name='+encodeURIComponent(this.dataset.name||'')}else{this.onerror=null;this.style.display='none';this.parentElement.querySelector('.reward-fallback').style.display='flex'}">`:''}<span class="reward-fallback">${escapeHtml(name.slice(0,2).toUpperCase())}</span>${qty?`<span class="reward-qty">${escapeHtml(qty)}</span>`:''}<span class="reward-name">${escapeHtml(name)}</span></div>`;
        }).join('')}
        </div>
        <div class="coupon-card-foot"><span>${payload.source==='cache'?'Última atualização conhecida':(payload.source==='discord'?'Atualizado via Discord':'Atualizado automaticamente')}</span></div>
      </article>`;
    }).join('');

    track.querySelectorAll('.coupon-copy').forEach(btn=>btn.addEventListener('click',async()=>{
      try{
        await navigator.clipboard.writeText(btn.dataset.coupon);
        const old=btn.textContent;
        btn.textContent='COPIADO';
        btn.classList.add('is-copied');
        setTimeout(()=>{btn.textContent=old;btn.classList.remove('is-copied');},1300);
      }catch{}
    }));
  }catch(err){
    track.innerHTML='<div class="coupons-status coupons-error">Os cupons estão temporariamente indisponíveis. Tente novamente em instantes.</div>';
    console.warn('[Cupons]',err);
  }
}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
window.addEventListener('DOMContentLoaded',loadBdoCoupons);

if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',()=>{applyLanguage();syncActiveNav();});}else{applyLanguage();syncActiveNav();}

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
  'Elixir de Boas Lembranças':    codexIcon(42413), // ⚠️ confere, não tá aparecendo

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
  'Elixir de Espiral Brilhante':           codexIcon(783), // ⚠️ chute +1
  'Elixir de Pescador Habilidoso':         codexIcon(727), // ⚠️ confere, não tá aparecendo

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
delete GROUP_ICONS['Seivas']; // categoria removida
// v97.1 — corrige o ícone do grupo renomeado
Object.assign(GROUP_ICONS, {
  'Fármacos Base da Harmonia': '🧪',
});
// =====================================================================
// v102 — Timeline do Registro de Alterações (10 versões)
// =====================================================================

const CHANGELOG_DATA = [
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

    grid.innerHTML = videos.slice(0, 5).map(v => `
      <button type="button" class="video-card" data-video-id="${escapeHtml(v.id)}" data-video-title="${escapeHtml(v.title)}">
        <span class="video-thumb-wrap">
          <img class="video-thumb" src="${escapeHtml(v.thumbnail)}" alt="" loading="lazy" referrerpolicy="no-referrer">
          <span class="video-play" aria-hidden="true">▶</span>
        </span>
        <span class="video-info">
          <span class="video-title">${escapeHtml(v.title)}</span>
          <span class="video-meta">${relativeDate(v.published)}${v.source==='lore' ? ' · 🌙 Lore' : ' · 📚 Tutorial'}</span>
        </span>
      </button>
    `).join('');

    grid.querySelectorAll('.video-card').forEach(btn => {
      btn.addEventListener('click', () => openVideoModal(btn.dataset.videoId, btn.dataset.videoTitle));
    });
  }catch(err){
    console.warn('[Vídeos]', err);
    grid.innerHTML = '<div class="video-status">Não foi possível carregar os vídeos agora.</div>';
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

    grid.innerHTML = posts.slice(0, 5).map((p, i) => `
      <button type="button" class="announcement-card" data-idx="${i}">
        ${p.image ? `<span class="announcement-thumb-wrap"><img class="announcement-thumb" src="${escapeHtml(p.image)}" alt="" loading="lazy" referrerpolicy="no-referrer"></span>` : ''}
        <span class="announcement-info">
          <span class="announcement-title">${escapeHtml(p.title)}</span>
          <span class="announcement-meta">${relativeDate(p.timestamp)} · ${escapeHtml(p.author)}</span>
        </span>
      </button>
    `).join('');

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
  content.innerHTML = `
    <h2 id="homeModalTitle" class="home-modal-title">${escapeHtml(post.title)}</h2>
    <div class="home-modal-meta">${relativeDate(post.timestamp)} · ${escapeHtml(post.author)}</div>
    ${post.image ? `<img class="home-modal-image" src="${escapeHtml(post.image)}" alt="" referrerpolicy="no-referrer">` : ''}
    <div class="home-modal-body">${escapeHtml(post.body).replace(/\n/g, '<br>')}</div>
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
    loadYouTubeVideos();
    loadDiscordAnnouncements();
  }
  loadDiscordCounter();
});