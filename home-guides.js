/**
 * home-guides.js
 * Substitui os 3 cards de exemplo da seção "Sala de Aula" da Home
 * pelos 3 guias mais recentes publicados no Blogger.
 * Se a API falhar ou não houver posts, os cards originais permanecem.
 */
(function () {
  'use strict';

  function cardMarkup(post) {
    var bg = post.thumbnail || '/assets/img/santuario-bg.webp';
    var label = post.labels[0] || 'Guia';
    var desc = window.LuaCrescenteBlog.excerptFromHtml(post.content, 110);
    var href = '/sala-de-aula.html?post=' + encodeURIComponent(post.id);

    return '' +
      '<a class="guide-card" style="--guide-image:url(\'' + bg + '\')" href="' + href + '">' +
        '<div class="guide-content">' +
          '<span class="guide-tag">' + escapeHtml(label) + '</span>' +
          '<h3 class="guide-title">' + escapeHtml(post.title) + '</h3>' +
          '<p class="guide-desc">' + escapeHtml(desc) + '</p>' +
          '<span class="guide-read">Ler guia →</span>' +
        '</div>' +
      '</a>';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function renderHomeCards(posts) {
    var grid = document.querySelector('.guide-grid');
    if (!grid || !posts.length) return; // mantém os cards estáticos como fallback
    var latest = posts.slice(0, 3);
    grid.innerHTML = latest.map(cardMarkup).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.getAttribute('data-page') !== 'home') return;
    if (!window.LuaCrescenteBlog) return;
    window.LuaCrescenteBlog.fetchAllPosts().then(renderHomeCards);
  });
})();
