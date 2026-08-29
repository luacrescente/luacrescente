// Lua Crescente — carregador sob demanda das categorias de receitas
(function(){
  const groups = {"Fármacos da Harmonia": "farmacos-da-harmonia", "Fármacos Base": "farmacos-base", "Sangues": "sangues", "Seivas": "seivas", "Fármacos Tradicionais": "farmacos-tradicionais", "Elixires Base": "elixires-base", "Perfumes": "perfumes", "Culinária": "culinaria", "Culinária Especial": "culinaria-especial", "Itens Tesouro": "itens-tesouro", "Poções": "pocoes", "Trabalhadores energia": "trabalhadores-energia", "Pergaminhos": "pergaminhos", "Rações": "racoes"};
  const counts = {"Fármacos da Harmonia":5,"Fármacos Base":5,"Sangues":35,"Seivas":13,"Fármacos Tradicionais":9,"Elixires Base":20,"Perfumes":11,"Culinária":150,"Culinária Especial":16,"Itens Tesouro":10,"Poções":8,"Trabalhadores energia":8,"Pergaminhos":6,"Rações":5};
  const cache = Object.create(null);
  window.RECIPE_GROUP_COUNTS = counts;
  window.RECIPE_GROUPS = Object.keys(groups);
  window.RECIPE_CATEGORY_LABELS = Object.freeze(["Fármacos da Harmonia", "Fármacos Base", "Sangues", "Seivas", "Fármacos Tradicionais", "Elixires Base", "Perfumes", "Culinária", "Culinária Especial", "Itens Tesouro", "Poções", "Trabalhadores energia", "Pergaminhos", "Rações"]);
  window.DATA = [];
  let loading = null;
  window.loadRecipeCategory = function(group) {
    if(!groups[group]) return Promise.resolve();
    if(cache[group]) { window.applyRecipeData(cache[group], group); return Promise.resolve(); }
    if(loading) loading.remove();
    return new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src='/assets/data/recipes/categories/'+groups[group]+'.js?v=60';
      s.async=true;
      s.onload=()=>{
        const data=window.__LC_CATEGORY_DATA__;
        delete window.__LC_CATEGORY_DATA__;
        if(!Array.isArray(data)){ reject(new Error('Dados de receita inválidos para '+group)); return; }
        cache[group]=data; window.applyRecipeData(data,group); loading=null; resolve();
      };
      s.onerror=()=>{ loading=null; reject(new Error('Falha ao carregar a categoria '+group)); };
      loading=s; document.head.appendChild(s);
    });
  };
})();
