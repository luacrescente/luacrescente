// Lua Crescente — carregador sob demanda das categorias de receitas (v64)
(function(){
  const groups = {
    "Fármacos da Harmonia":"farmacos-da-harmonia",
    "Fármacos Base":"farmacos-base",
    "Sangues":"sangues",
    "Seivas":"seivas",
    "Fármacos Tradicionais":"farmacos-tradicionais",
    "Elixires Base":"elixires-base",
    "Perfumes":"perfumes",
    "Culinária":"culinaria",
    "Culinária Especial":"culinaria-especial",
    "Itens Tesouro":"itens-tesouro",
    "Poções":"pocoes",
    "Trabalhadores energia":"trabalhadores-energia",
    "Pergaminhos":"pergaminhos",
    "Rações":"racoes"
  };
  const counts = {"Fármacos da Harmonia":5,"Fármacos Base":5,"Sangues":35,"Seivas":13,"Fármacos Tradicionais":9,"Elixires Base":20,"Perfumes":11,"Culinária":150,"Culinária Especial":16,"Itens Tesouro":10,"Poções":8,"Trabalhadores energia":8,"Pergaminhos":6,"Rações":5};
  const cache = Object.create(null);
  const pending = Object.create(null);

  window.RECIPE_GROUP_COUNTS = counts;
  window.RECIPE_GROUPS = Object.keys(groups);
  window.RECIPE_CATEGORY_LABELS = Object.freeze(Object.keys(groups));
  window.DATA = [];

  function loadCategory(group){
    const slug = groups[group];
    if(!slug) return Promise.reject(new Error('Categoria desconhecida: '+group));
    if(cache[group]) return Promise.resolve(cache[group]);
    if(pending[group]) return pending[group];

    const url = `/assets/data/recipes/categories/${slug}.json?v=64`;
    pending[group] = fetch(url, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    }).then(async response => {
      if(!response.ok) throw new Error(`HTTP ${response.status} ao carregar ${group}`);
      const data = await response.json();
      if(!Array.isArray(data)) throw new Error('Dados inválidos para '+group);
      cache[group] = data;
      return data;
    }).finally(()=>{ delete pending[group]; });

    return pending[group];
  }

  // O loader apenas carrega e devolve os dados. O runtime decide se a resposta
  // ainda corresponde à categoria que o usuário selecionou.
  window.loadRecipeCategory = loadCategory;
})();
