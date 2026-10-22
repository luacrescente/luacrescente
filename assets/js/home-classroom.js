document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('homeClassroomGrid');
  if (!grid || !window.LuaCrescenteBlog) return;

  window.LuaCrescenteBlog.fetchAllPosts().then(posts => {
    if (!posts || !posts.length) throw new Error('sem posts');
    grid.innerHTML = posts.slice(0, 4).map(p => {
      const img = p.thumbnail || 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=600&auto=format&fit=crop';
      const label = (p.labels && p.labels[0]) || 'Guia';
      const link = 'sala-de-aula.html?post=' + p.id;
      const date = window.LuaCrescenteBlog.formatDate(p.published);
      const desc = window.LuaCrescenteBlog.excerptFromHtml(p.content, 80);
      
      return `
        <a href="${link}" class="classroom-card">
          <div class="classroom-thumb-wrap">
            <img src="${img}" alt="" class="classroom-thumb" loading="lazy" onerror="this.style.display='none'">
          </div>
          <div class="classroom-info">
            <span class="classroom-meta">${label} · ${date}</span>
            <span class="classroom-title">${p.title}</span>
            <span class="classroom-desc">${desc}</span>
          </div>
        </a>
      `;
    }).join('');
  }).catch(() => {
    grid.innerHTML = '<div class="classroom-status">Não foi possível carregar os guias.</div>';
  });
});