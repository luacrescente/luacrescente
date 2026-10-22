// Lua Crescente — carregador da página "Itens Tesouro".
(function(){
  'use strict';

  var GRUPO = 'Itens Tesouro';
  var cache = null;

  function loadCategory(){
    if(cache) return Promise.resolve(cache);
    return fetch('/assets/data/itens-tesouro/itens-tesouro.json', { cache: 'no-store' })
      .then(function(res){
        if(!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(data){
        cache = data.map(function(item){
          return Object.assign({}, item, { group: GRUPO });
        });
        return cache;
      });
  }

  window.RECIPE_GROUPS = [GRUPO];
  window.RECIPE_GROUP_COUNTS = { 'Itens Tesouro': 10 };
  window.RECIPE_CATEGORY_LABELS = [GRUPO];
  window.loadRecipeCategory = loadCategory;
})();