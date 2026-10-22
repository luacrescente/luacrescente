// Lua Crescente — traduções PT-BR da interface do mapa de Edania.
// É carregado DEPOIS de markers.js e ANTES de mapa-edania.js.
// Faz merge das strings PT no objeto M.meta.i18n sem destruir KO/EN.
(function(){
  'use strict';

  // Traduções diretas de chave -> texto.
  // As chaves precisam bater com as que o script do korbdo procura.
  var PT = {
    // Títulos e rótulos gerais
    title:            'Edania — Interior',
    expand:           'Expandir',
    collapse:         'Recolher',
    fit:              'Ver tudo',
    save:             'Salvar',
    load:             'Carregar',
    search:           'Buscar — Legado 46 · Vestígio XLVI etc',
    results:          'Resultados',
    clearSearch:      'Limpar',
    layersTitle:      'Camadas do mapa',
    progress:         'Progresso',
    done:             'Concluir',
    undone:           'Concluído ✓',
    resetAll:         'Limpar concluídos',
    doneAll:          'Marcar tudo',
    confirmReset:     'Apagar {n} itens concluídos? Não dá pra desfazer.',
    confirmDone:      'Marcar TODOS os itens como concluídos?',
    know:             'Conhecimento',
    none:             'Nada encontrado',
    // Nomes de camada (usados na sidebar e no rodapé do progresso)
    '유산':           'Legado',
    '흔적':           'Vestígio',
    '퀘스트':         'Missão',
    '지식':           'Conhecimento',
    '거점 관리인':    'Gerente de Nó',
    '마을 NPC':       'NPC da vila',
    'questShort':     'Missão',
    'mainQ':          'Recompensas de missão principal',
    'mainQShort':     'Missão principal',
    'questProgress':  'Progresso da missão',
    'coinLabel':      'Moeda de Ouro Argés',
    'coin':           'Moeda',
    'coinN':          'Ganha {n} moedas',
    'needPre':        'Requer',
    'needTag':        '(Req. {n})',
    'needQuest':      'Missão principal',
    'video':          'Vídeo guia',
    'creditImage':    'Imagens : BDO Inven - Kanat',
    'creditVideo':    'Vídeo'
  };

  function merge(){
    if(!window.MARKERS || !window.MARKERS.meta) return;
    var meta = window.MARKERS.meta;
    meta.i18n = meta.i18n || {};
    meta.i18n.pt = Object.assign({}, meta.i18n.pt || {}, PT);
    // Mapeia os layers (relic, trace, etc) pra PT-BR também
    meta.layers = meta.layers || {};
    var layerNames = {
      'relic': 'Legado',
      'trace': 'Vestígio',
      'quest': 'Missão',
      'klore': 'Conhecimento',
      'node':  'Gerente de Nó',
      'npc':   'NPC da vila'
    };
    // guarda nomes PT num objeto separado (não mexe no original)
    meta.layers_pt = meta.layers_pt || {};
    for(var k in layerNames){ meta.layers_pt[k] = layerNames[k]; }
  }

  if(window.MARKERS){
    merge();
  } else {
    // em caso de ordem de carregamento diferente, tenta no DOMContentLoaded
    document.addEventListener('DOMContentLoaded', merge);
  }
})();