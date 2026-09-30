/**
 * home-guides.js — v2
 * Substitui os cards de exemplo da seção "Sala de Aula" da Home
 * pelos 3 guias mais recentes publicados no Blogger.
 * Layout: 1 card em destaque + 2 cards menores na coluna da direita.
 * Se a API falhar ou não houver posts, os cards originais permanecem.
 */
(function () {
  'use strict';

  function esc(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function featuredMarkup(post) {
    var bg = post.thumbnail || '/assets/img/santuario-bg.webp';
    var label = (post.labels && post.labels[0]) || 'Guia';
    var desc = window.LuaCrescenteBlog.excerptFromHtml(post.content, 130);
    var href = '/sala-de-aula.html?post=' + encodeURIComponent(post.id);

    return '<a class="guide-card-featured" style="--guide-image:url(\'' + bg + '\')" href="' + href + '">' +
      '<span class="guide-badge">DESTAQUE</span>' +
      '<div class="guide-featured-content">' +
        '<span class="guide-tag">' + esc(label) + '</span>' +
        '<h3 class="guide-featured-title">' + esc(post.title) + '</h3>' +
        '<p class="guide-featured-desc">' + esc(desc) + '</p>' +
      '</div>' +
    '</a>';
  }

  function smallMarkup(post, isNew) {
    var bg = post.thumbnail || '/assets/img/santuario-bg.webp';
    var label = (post.labels && post.labels[0]) || 'Guia';
    var href = '/sala-de-aula.html?post=' + encodeURIComponent(post.id);

    return '<a class="guide-card-small" style="--guide-image:url(\'' + bg + '\')" href="' + href + '">' +
      (isNew ? '<span class="guide-badge">NOVO</span>' : '') +
      '<div class="guide-small-content">' +
        '<span class="guide-tag">' + esc(label) + '</span>' +
        '<h3 class="guide-small-title">' + esc(post.title) + '</h3>' +
      '</div>' +
    '</a>';
  }

  function render(posts) {
    var layout = document.querySelector('.guide-layout');
    if (!layout || !posts || !posts.length) return;

    var latest = posts.slice(0, 3);
    if (!latest.length) return;

    var featured = latest[0];
    var smalls = latest.slice(1);

    var html = featuredMarkup(featured);
    if (smalls.length) {
      html += '<div class="guide-side">' +
        smalls.map(function (p, i) { return smallMarkup(p, i === 0); }).join('') +
      '</div>';
    }
    layout.innerHTML = html;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.getAttribute('data-page') !== 'home') return;
    if (!window.LuaCrescenteBlog) return;
    window.LuaCrescenteBlog.fetchAllPosts().then(render).catch(function () {});
  });
})();