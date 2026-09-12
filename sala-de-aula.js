/**
 * sala-de-aula.js
 * Monta a página /sala-de-aula.html a partir dos posts do Blogger:
 * - menu lateral em cascata por categoria (label)
 * - grid de guias com miniatura
 * - busca por palavra-chave/tag
 * - leitura de um guia específico via ?post=<id>, com índice (TOC)
 * Nenhuma escrita acontece aqui — é uma página 100% de leitura.
 */
(function () {
  'use strict';

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  // ---------- Grid de cards ----------

  function cardMarkup(post) {
    var bg = post.thumbnail || '/assets/img/santuario-bg.webp';
    var label = post.labels[0] || 'Guia';
    var desc = window.LuaCrescenteBlog.excerptFromHtml(post.content, 130);
    var date = window.LuaCrescenteBlog.formatDate(post.published);
    var href = '?post=' + encodeURIComponent(post.id);

    return '' +
      '<a class="guide-card" style="--guide-image:url(\'' + bg + '\')" href="' + href + '">' +
        '<div class="guide-content">' +
          '<span class="guide-tag">' + escapeHtml(label) + '</span>' +
          '<h3 class="guide-title">' + escapeHtml(post.title) + '</h3>' +
          '<p class="guide-desc">' + escapeHtml(desc) + '</p>' +
          '<span class="guide-read">' + escapeHtml(date) + '</span>' +
        '</div>' +
      '</a>';
  }

  function renderGrid(posts) {
    var grid = document.getElementById('blogGrid');
    var empty = document.getElementById('blogEmptyState');
    if (!grid) return;
    if (!posts.length) {
      grid.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    grid.innerHTML = posts.map(cardMarkup).join('');
  }

  // ---------- Menu lateral em cascata ----------

  function renderSidebar(allPosts) {
    var nav = document.getElementById('blogCategoryNav');
    if (!nav) return;
    var groups = window.LuaCrescenteBlog.groupByLabel(allPosts);
    var labels = Object.keys(groups).sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });

    var html = '<button type="button" class="blog-cat-toggle blog-cat-all" data-filter-all>Todos os guias</button>';

    labels.forEach(function (label) {
      var posts = groups[label];
      html += '' +
        '<div class="blog-cat-group">' +
          '<button type="button" class="blog-cat-toggle" data-label="' + escapeHtml(label) + '">' +
            '<span>' + escapeHtml(label) + '</span>' +
            '<span class="blog-cat-count">' + posts.length + '</span>' +
          '</button>' +
          '<div class="blog-cat-items">' +
            posts.map(function (post) {
              return '<a class="blog-cat-item" href="?post=' + encodeURIComponent(post.id) + '">' + escapeHtml(post.title) + '</a>';
            }).join('') +
          '</div>' +
        '</div>';
    });

    nav.innerHTML = html;

    nav.addEventListener('click', function (ev) {
      var toggle = ev.target.closest('.blog-cat-toggle');
      if (!toggle) return;

      if (toggle.hasAttribute('data-filter-all')) {
        nav.querySelectorAll('.blog-cat-group').forEach(function (g) { g.classList.remove('open'); });
        renderGrid(allPosts);
        setActiveToggle(toggle);
        return;
      }

      var group = toggle.closest('.blog-cat-group');
      group.classList.toggle('open');

      var label = toggle.getAttribute('data-label');
      renderGrid(groups[label]);
      setActiveToggle(toggle);
    });

    function setActiveToggle(active) {
      nav.querySelectorAll('.blog-cat-toggle').forEach(function (b) { b.classList.remove('active'); });
      active.classList.add('active');
    }
  }

  // ---------- Busca ----------

  function setupSearch(allPosts) {
    var input = document.getElementById('blogSearchInput');
    if (!input) return;
    input.addEventListener('input', function () {
      var term = input.value.trim().toLowerCase();
      if (!term) { renderGrid(allPosts); return; }
      var filtered = allPosts.filter(function (post) {
        var inTitle = post.title.toLowerCase().indexOf(term) !== -1;
        var inLabels = post.labels.some(function (l) { return l.toLowerCase().indexOf(term) !== -1; });
        return inTitle || inLabels;
      });
      renderGrid(filtered);
    });
  }

  // ---------- Página de artigo individual ----------

  function buildTOC(contentEl) {
    var headings = contentEl.querySelectorAll('h1, h2, h3');
    if (!headings.length) return '';
    var items = [];
    headings.forEach(function (h, i) {
      var id = 'toc-' + i;
      h.id = id;
      items.push('<a href="#' + id + '">' + h.textContent + '</a>');
    });
    return '<nav class="blog-toc"><div class="blog-toc-title">Índice</div>' + items.join('') + '</nav>';
  }

  function renderArticle(post) {
    var listView = document.getElementById('blogListView');
    var articleView = document.getElementById('blogArticleView');
    if (!post) {
      if (articleView) articleView.hidden = true;
      if (listView) listView.hidden = false;
      return;
    }
    if (listView) listView.hidden = true;
    if (articleView) articleView.hidden = false;

    var cover = post.thumbnail
      ? '<img class="blog-article-cover" src="' + post.thumbnail + '" alt="">'
      : '';

    articleView.innerHTML = '' +
      '<a class="blog-back-link" href="/sala-de-aula.html">← Voltar para todos os guias</a>' +
      '<div class="blog-article-head">' +
        '<span class="blog-article-label">' + escapeHtml(post.labels[0] || 'Guia') + '</span>' +
        '<h1 class="blog-article-title">' + escapeHtml(post.title) + '</h1>' +
        '<span class="blog-article-date">Atualizado em ' + window.LuaCrescenteBlog.formatDate(post.updated || post.published) + '</span>' +
      '</div>' +
      cover +
      '<div class="blog-article-body-wrap">' +
        '<div class="blog-article-body">' + post.content + '</div>' +
        '<div class="blog-toc-slot"></div>' +
      '</div>';

    var body = articleView.querySelector('.blog-article-body');
    var tocSlot = articleView.querySelector('.blog-toc-slot');
    tocSlot.innerHTML = buildTOC(body);

    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  // ---------- Boot ----------

  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.getAttribute('data-page') !== 'sala-de-aula') return;
    if (!window.LuaCrescenteBlog) return;

    var loading = document.getElementById('blogLoadingState');

    window.LuaCrescenteBlog.fetchAllPosts().then(function (posts) {
      if (loading) loading.hidden = true;

      renderSidebar(posts);
      setupSearch(posts);

      var postId = getParam('post');
      var listView = document.getElementById('blogListView');
      if (postId) {
        window.LuaCrescenteBlog.fetchPostById(postId).then(renderArticle);
      } else {
        if (listView) listView.hidden = false;
        renderGrid(posts);
      }
    });
  });
})();
