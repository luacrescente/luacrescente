/**
 * blog-loader.js
 * Camada de acesso à API do Blogger (Sala de Aula da Lua Crescente).
 * Nenhum dado é escrito aqui — apenas leitura pública dos posts publicados.
 * Publicar/editar guias é feito inteiramente pelo painel do Blogger.
 */
(function () {
  'use strict';

  var BLOG_CONFIG = {
    blogId: '6902992025951664279',
    apiKey: 'AIzaSyCLJy6hFe1Ti3LN0Hggl1vcIhf-dAS6j-g',
    apiBase: 'https://www.googleapis.com/blogger/v3/blogs'
  };

  var cache = { posts: null, promise: null };

  function normalizePost(item) {
    var thumb = null;
    if (item.images && item.images.length) {
      thumb = item.images[0].url;
    } else {
      // Fallback: tenta achar a primeira <img> dentro do conteúdo do post.
      var match = /<img[^>]+src=["']([^"']+)["']/i.exec(item.content || '');
      if (match) thumb = match[1];
    }
    return {
      id: item.id,
      title: item.title || 'Sem título',
      content: item.content || '',
      url: item.url,
      published: item.published,
      updated: item.updated,
      labels: item.labels || [],
      thumbnail: thumb
    };
  }

  function fetchAllPosts() {
    if (cache.posts) return Promise.resolve(cache.posts);
    if (cache.promise) return cache.promise;

    var url = BLOG_CONFIG.apiBase + '/' + BLOG_CONFIG.blogId + '/posts' +
      '?key=' + encodeURIComponent(BLOG_CONFIG.apiKey) +
      '&maxResults=500&fetchImages=true&status=live';

    cache.promise = fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Blogger API respondeu ' + res.status);
        return res.json();
      })
      .then(function (data) {
        var posts = (data.items || []).map(normalizePost);
        posts.sort(function (a, b) {
          return new Date(b.published) - new Date(a.published);
        });
        cache.posts = posts;
        return posts;
      })
      .catch(function (err) {
        console.error('[Sala de Aula] Falha ao carregar guias do Blogger:', err);
        return [];
      });

    return cache.promise;
  }

  function fetchPostById(postId) {
    return fetchAllPosts().then(function (posts) {
      var found = null;
      for (var i = 0; i < posts.length; i++) {
        if (String(posts[i].id) === String(postId)) { found = posts[i]; break; }
      }
      return found;
    });
  }

  function slugify(text) {
    return (text || '')
      .toString()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
    } catch (e) {
      return '';
    }
  }

  function excerptFromHtml(html, maxLen) {
    if (!html) return '';
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    var text = (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
    return text.length > maxLen ? text.slice(0, maxLen).trim() + '…' : text;
  }

  function groupByLabel(posts) {
    var groups = {};
    posts.forEach(function (post) {
      var labels = post.labels.length ? post.labels : ['Sem categoria'];
      labels.forEach(function (label) {
        if (!groups[label]) groups[label] = [];
        groups[label].push(post);
      });
    });
    return groups;
  }

  window.LuaCrescenteBlog = {
    fetchAllPosts: fetchAllPosts,
    fetchPostById: fetchPostById,
    slugify: slugify,
    formatDate: formatDate,
    excerptFromHtml: excerptFromHtml,
    groupByLabel: groupByLabel
  };
})();
