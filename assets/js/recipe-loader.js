// Lua Crescente — carregador sob demanda das categorias de receitas
(function(){
  const groups = {"Fármacos da Harmonia": "farmacos-da-harmonia", "Fármacos Base": "farmacos-base", "Sangues": "sangues", "Seivas": "seivas", "Fármacos Tradicionais": "farmacos-tradicionais", "Elixires Base": "elixires-base", "Perfumes": "perfumes", "Culinária": "culinaria", "Culinária Especial": "culinaria-especial", "Itens Tesouro": "itens-tesouro", "Poções": "pocoes", "Trabalhadores energia": "trabalhadores-energia", "Pergaminhos": "pergaminhos", "Rações": "racoes"};
  const counts = {"Fármacos da Harmonia":5,"Fármacos Base":5,"Sangues":35,"Seivas":13,"Fármacos Tradicionais":9,"Elixires Base":20,"Perfumes":11,"Culinária":150,"Culinária Especial":16,"Itens Tesouro":10,"Poções":8,"Trabalhadores energia":8,"Pergaminhos":6,"Rações":5};
  const cache = Object.create(null);
  const pending = Object.create(null);
  let sequence = 0;
  let queue = Promise.resolve();

  window.RECIPE_GROUP_COUNTS = counts;
  window.RECIPE_GROUPS = Object.keys(groups);
  window.RECIPE_CATEGORY_LABELS = Object.freeze(Object.keys(groups));
  window.DATA = [];

  // As categorias usam a variável global __LC_CATEGORY_DATA__. Por isso os
  // scripts são carregados um por vez: evita que duas respostas se sobrescrevam
  // e façam, por exemplo, um clique em Perfumes acabar exibindo Culinária.
  function loadScript(group){
    return new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src='/assets/data/recipes/categories/'+groups[group]+'.js?v=61';
      script.async=false;
      script.dataset.recipeGroup=group;
      script.onload=()=>{
        const data=window.__LC_CATEGORY_DATA__;
        delete window.__LC_CATEGORY_DATA__;
        if(!Array.isArray(data)){
          reject(new Error('Dados de receita inválidos para '+group));
          return;
        }
        cache[group]=data;
        resolve(data);
      };
      script.onerror=()=>reject(new Error('Falha ao carregar a categoria '+group));
      document.head.appendChild(script);
    });
  }

  window.loadRecipeCategory = function(group){
    if(!groups[group]) return Promise.reject(new Error('Categoria desconhecida: '+group));
    const token = ++sequence;

    if(cache[group]){
      if(token === sequence) window.applyRecipeData(cache[group],group);
      return Promise.resolve(cache[group]);
    }

    if(pending[group]){
      return pending[group].then(data=>{
        if(token === sequence) window.applyRecipeData(data,group);
        return data;
      });
    }

    const task = queue.then(()=>loadScript(group));
    queue = task.catch(()=>{});
    pending[group] = task;

    return task.then(data=>{
      delete pending[group];
      // Só a escolha de categoria mais recente pode atualizar a tela.
      if(token === sequence) window.applyRecipeData(data,group);
      return data;
    },err=>{
      delete pending[group];
      throw err;
    });
  };
})();
