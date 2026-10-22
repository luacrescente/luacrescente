// Lua Crescente — carregador das subcategorias de Processamento.
// Busca cada categoria sob demanda (fetch), executa o .js num <script>
// temporário, injeta o `group` em cada item e consolida itens de mesmo
// nome em um único card com abas internas (routes).
(function(){
  'use strict';

  var groups = [
    'Agitação',
    'Alquimia Simples',
    'Aquecimento',
    'Corte',
    'Culinária Simples',
    'Desidratação',
    'Empacotar Alquimia Imperial',
    'Empacotar Culinária Imperial',
    'Fábrica',
    'Filtragem',
    'Moagem'
  ];

  var slugs = {
    'Agitação': 'agitacao',
    'Alquimia Simples': 'alquimia-simples',
    'Aquecimento': 'aquecimento',
    'Corte': 'corte',
    'Culinária Simples': 'culinaria-simples',
    'Desidratação': 'desidratacao',
    'Empacotar Alquimia Imperial': 'empacotar-alquimia-imperial',
    'Empacotar Culinária Imperial': 'empacotar-culinaria-imperial',
    'Fábrica': 'fabrica',
    'Filtragem': 'filtragem',
    'Moagem': 'moagem'
  };

  // Contagens exibidas na sidebar (nomes únicos após consolidação).
  var counts = {
    'Agitação': 38,
    'Alquimia Simples': 180,
    'Aquecimento': 42,
    'Corte': 42,
    'Culinária Simples': 20,
    'Desidratação': 128,
    'Empacotar Alquimia Imperial': 19,
    'Empacotar Culinária Imperial': 21,
    'Fábrica': 390,
    'Filtragem': 3,
    'Moagem': 44
  };

  var cache = {};

  // Deriva uma label curta pra cada rota a partir do primeiro ingrediente.
  function labelFromChildren(children){
    if(!children || !children.length) return null;
    var first = children[0];
    if(!first || !first.name) return null;
    return String(first.name).trim();
  }

  // Consolida itens de mesmo nome em um único com routes.
  function consolidate(items, group){
    var byName = {};
    var order = [];

    items.forEach(function(item){
      if(!item || !item.name) return;
      var key = item.name.trim().toLowerCase();
      if(!byName[key]){
        byName[key] = [];
        order.push(key);
      }
      byName[key].push(item);
    });

    return order.map(function(key){
      var list = byName[key];
      var baseName = list[0].name;

      if(list.length === 1){
        return Object.assign({}, list[0], { group: group });
      }

      var routes = list.map(function(v, i){
        var label = labelFromChildren(v.children) || ('Rota ' + (i + 1));
        return { label: label, children: v.children || [] };
      });

      return {
        name: baseName,
        group: group,
        routes: routes
      };
    });
  }

  function loadCategory(group){
    if(cache[group]) return Promise.resolve(cache[group]);
    var slug = slugs[group];
    if(!slug) return Promise.reject(new Error('Subcategoria desconhecida: ' + group));

    return fetch('/assets/data/processamento/' + slug + '.js', { cache: 'no-store' })
      .then(function(res){
        if(!res.ok) throw new Error('HTTP ' + res.status + ' em ' + group);
        return res.text();
      })
      .then(function(code){
        var script = document.createElement('script');
        script.textContent = code;
        document.head.appendChild(script);
        document.head.removeChild(script);

        var raw = (window.__LC_PROC_DATA__ && window.__LC_PROC_DATA__[group]) || [];
        var data = consolidate(raw, group);
        cache[group] = data;
        return data;
      });
  }

  window.RECIPE_GROUPS = groups;
  window.RECIPE_GROUP_COUNTS = counts;
  window.RECIPE_CATEGORY_LABELS = groups.slice();
  window.loadRecipeCategory = loadCategory;
})();