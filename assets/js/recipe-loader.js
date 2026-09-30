// Lua Crescente — carregador sob demanda das categorias de receitas (v67)
(function(){
  const groups = {
    "Fármacos da Harmonia":"farmacos-da-harmonia",
    "Fármacos Base da Harmonia":"farmacos-base",
    "Fármacos Tradicionais":"farmacos-tradicionais",
    "Sangues":"sangues",
    "Elixires Base":"elixires-base",
    "Elixires Base Superior":"elixires-base-superior",
    "Perfumes":"perfumes",
    "Reagentes de Alquimia":"reagentes-alquimia",
    "Culinária":"culinaria",
    "Culinária Especial":"culinaria-especial",
    "Itens Tesouro":"itens-tesouro",
    "Poções":"pocoes",
    "Trabalhadores energia":"trabalhadores-energia",
    "Pergaminhos":"pergaminhos",
    "Rações":"racoes"
  };
  const counts = {"Fármacos da Harmonia":5,"Fármacos Base da Harmonia":5,"Fármacos Tradicionais":9,"Sangues":5,"Elixires Base":44,"Elixires Base Superior":38,"Perfumes":11,"Reagentes de Alquimia":23,"Culinária":153,"Culinária Especial":16,"Itens Tesouro":10,"Poções":15,"Trabalhadores energia":2,"Pergaminhos":6,"Rações":5};
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

    const url = `/assets/data/recipes/categories/${slug}.json?v=67`;
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

  window.loadRecipeCategory = loadCategory;
})();