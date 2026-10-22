// Lua Crescente — busca global com autocomplete
// Lê /assets/data/search-index.json e (opcional) os posts do Blogger.
// Uso: basta ter um <input class="global-search-input"> em qualquer página.
(function(){
  'use strict';

  var INDEX_URL = '/assets/data/search-index.json';
  var MAX_RESULTS = 8;
  var index = null;
  var blogPosts = [];
  var inputEls = [];

  // ---------- Utilitários ----------
  function norm(s){
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  // Normaliza um item do índice para o formato interno unificado.
  function normalizarItem(e){
    var t = e.t;
    var url = '#';

    if(t === 'recipe'){
      url = '/receitas.html?group=' + encodeURIComponent(e.g) + '&item=' + encodeURIComponent(e.n);
    } else if(t === 'process'){
      url = '/processamento.html?group=' + encodeURIComponent(e.g) + '&item=' + encodeURIComponent(e.n);
    } else if(t === 'combo'){
      url = '/combos.html?mode=' + (e.mode || 'combate') + '&combo=' + encodeURIComponent(e.n);
    } else if(t === 'treasure'){
      url = '/itens-tesouro.html?item=' + encodeURIComponent(e.n);
    } else if(t === 'blog'){
      url = '/sala-de-aula.html?post=' + encodeURIComponent(e.id);
    }

    var tipoLabel = {
      'recipe': 'Receita',
      'process': 'Processamento',
      'combo': 'Artefato',
      'treasure': 'Tesouro',
      'blog': 'Guia'
    }[t] || 'Item';

    var tipoIcon = {
      'recipe': '🍲',
      'process': '⚗️',
      'combo': '💠',
      'treasure': '💎',
      'blog': '📖'
    }[t] || '•';

    return {
      name: e.n,
      group: e.g || '',
      type: t,
      typeLabel: tipoLabel,
      typeIcon: tipoIcon,
      url: url,
      search: norm(e.n + ' ' + (e.g || ''))
    };
  }

  // ---------- Carregamento ----------
  function carregarIndice(){
    if(index) return Promise.resolve(index);
    return fetch(INDEX_URL, { cache: 'no-store' })
      .then(function(r){
        if(!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function(data){
        index = data.map(normalizarItem);
        return index;
      })
      .catch(function(err){
        console.error('[Busca] Falha ao carregar índice:', err);
        index = [];
        return index;
      });
  }

  function carregarBlog(){
    if(!window.LuaCrescenteBlog || typeof window.LuaCrescenteBlog.fetchAllPosts !== 'function'){
      return Promise.resolve([]);
    }
    return window.LuaCrescenteBlog.fetchAllPosts().then(function(posts){
      blogPosts = (posts || []).slice(0, 100).map(function(p){
        return normalizarItem({
          n: p.title,
          g: (p.labels && p.labels[0]) || 'Guia',
          t: 'blog',
          id: p.id
        });
      });
      return blogPosts;
    }).catch(function(){
      blogPosts = [];
      return [];
    });
  }

  // ---------- Busca ----------
  function buscar(query){
    var q = norm(query).trim();
    if(!q) return [];

    var todos = (index || []).concat(blogPosts);
    var resultados = [];
    for(var i = 0; i < todos.length; i++){
      var it = todos[i];
      if(it.search.indexOf(q) !== -1){
        // Prioridade: começa com a query > contém a query
        var startsWith = it.search.indexOf(q) === 0 ? 0 : 1;
        resultados.push({ it: it, prio: startsWith, idx: i });
      }
    }
    resultados.sort(function(a, b){
      if(a.prio !== b.prio) return a.prio - b.prio;
      return a.it.name.length - b.it.name.length;
    });
    return resultados.slice(0, MAX_RESULTS).map(function(x){ return x.it; });
  }

  // ---------- UI ----------
  function montarUI(inputEl){
    // Envolve o input num container relativo
    var wrapper = inputEl.parentElement;
    if(!wrapper || !wrapper.classList.contains('global-search-wrap')){
      wrapper = document.createElement('div');
      wrapper.className = 'global-search-wrap';
      inputEl.parentNode.insertBefore(wrapper, inputEl);
      wrapper.appendChild(inputEl);
    }

    // Cria o dropdown
    var dropdown = document.createElement('div');
    dropdown.className = 'global-search-dropdown';
    dropdown.setAttribute('role', 'listbox');
    dropdown.style.display = 'none';
    wrapper.appendChild(dropdown);

    var currentItems = [];
    var activeIdx = -1;

    function fechar(){
      dropdown.style.display = 'none';
      activeIdx = -1;
    }

    function renderizar(query){
      var q = String(query || '').trim();
      if(!q){
        fechar();
        return;
      }
      var items = buscar(q);
      currentItems = items;

      if(!items.length){
        dropdown.innerHTML = '<div class="gs-empty">Nenhum resultado para "' + esc(q) + '".</div>';
        dropdown.style.display = 'block';
        return;
      }

      var html = '';
      for(var i = 0; i < items.length; i++){
        var it = items[i];
        html += '<a class="gs-item" data-idx="' + i + '" href="' + esc(it.url) + '" role="option">'
              +   '<span class="gs-icon">' + it.typeIcon + '</span>'
              +   '<span class="gs-meta">'
              +     '<span class="gs-name">' + esc(it.name) + '</span>'
              +     '<span class="gs-group">' + esc(it.group) + '</span>'
              +   '</span>'
              +   '<span class="gs-type">' + esc(it.typeLabel) + '</span>'
              + '</a>';
      }
      dropdown.innerHTML = html;
      dropdown.style.display = 'block';
      activeIdx = -1;
    }

    function setActive(newIdx){
      var itens = dropdown.querySelectorAll('.gs-item');
      if(!itens.length) return;
      if(newIdx < 0) newIdx = itens.length - 1;
      if(newIdx >= itens.length) newIdx = 0;
      itens.forEach(function(el, i){ el.classList.toggle('is-active', i === newIdx); });
      activeIdx = newIdx;
      var el = itens[newIdx];
      if(el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
    }

    inputEl.addEventListener('input', function(){ renderizar(inputEl.value); });
    inputEl.addEventListener('focus', function(){
      if(inputEl.value.trim()) renderizar(inputEl.value);
    });
    inputEl.addEventListener('keydown', function(e){
      if(dropdown.style.display === 'none') return;
      if(e.key === 'ArrowDown'){ e.preventDefault(); setActive(activeIdx + 1); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); setActive(activeIdx - 1); }
      else if(e.key === 'Enter'){
        var itens = dropdown.querySelectorAll('.gs-item');
        if(activeIdx >= 0 && itens[activeIdx]){
          e.preventDefault();
          window.location.href = itens[activeIdx].getAttribute('href');
        }
      } else if(e.key === 'Escape'){ fechar(); }
    });

    document.addEventListener('click', function(e){
      if(!wrapper.contains(e.target)) fechar();
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') fechar();
    });

    // Impede o form de submeter se existir (home tem <form>)
    var form = inputEl.closest('form');
    if(form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var itens = dropdown.querySelectorAll('.gs-item');
        if(activeIdx >= 0 && itens[activeIdx]){
          window.location.href = itens[activeIdx].getAttribute('href');
        } else if(itens[0]){
          window.location.href = itens[0].getAttribute('href');
        } else {
          window.location.href = '/receitas.html?search=' + encodeURIComponent(inputEl.value.trim());
        }
      });
    }
  }

  // ---------- Boot ----------
  function init(){
    inputEls = Array.prototype.slice.call(document.querySelectorAll('.global-search-input'));
    if(!inputEls.length) return;

    // Monta UI em cada input
    inputEls.forEach(montarUI);

    // Carrega índice + blog em paralelo
    Promise.all([carregarIndice(), carregarBlog()]).catch(function(){});
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();