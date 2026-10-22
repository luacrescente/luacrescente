const UI_TRANSLATIONS = {
  pt: {
    page_title:'Lua Crescente · Santuário', tagline:'Santuário da guilda',
    menu_open:'Abrir menu', menu_close:'Fechar menu',
    nav_home:'Início', nav_culinaria:'Receitas', nav_receitas_root:'Receitas', nav_itens_tesouro:'Itens Tesouro',
    nav_sala:'Sala de Aula', nav_combos:'Artefatos', nav_processamento:'Processamento',
    nav_mapa:"Mapa de Edania", nav_pesca:'Mapa de Pesca', nav_mapas_root:'Mapas',
    lang_pt:'Português', lang_es:'Español (LATAM)',
    home_eyebrow:'CONHECIMENTO DA GUILDA',
    home_title:'Um lugar para voltar sempre.',
    home_sub:'Receitas, timers, guias e tudo o que a guilda precisa — reunido num só lugar.',
    home_search_placeholder:'Buscar receitas, guias, itens...',
    popular_recipes:'Receitas mais vistas', popular_sub:'As mais acessadas pelos membros.',
    view_tree:'Ver árvore ↗',
    bento_coupons:'Cupons ativos', bento_coupons_sub:'Atualizados pelo canal de cupons da guilda.',
    bento_view_all_coupons:'Ver todos os cupons ↗',
    bento_featured:'Em destaque', bento_alchemy_guide:'Guia de Alquimia', bento_alchemy_guide_sub:'Dos primeiros passos às combinações mais avançadas.',
    bento_events:'Eventos', bento_events_sub:'Direto do site oficial da Pearl Abyss.',
    bento_temp:'Temporários', bento_perm:'Permanentes',
    bento_announcements:'Avisos', bento_announcements_sub:'Da liderança.',
    bento_videos:'Últimos vídeos', bento_videos_sub:'Tutoriais e lore no canal da guilda.',
    cta_title:'Juntos somos mais fortes.', cta_text:'A guilda Lua Crescente está de portas abertas para quem quer aprender, ajudar e crescer.',
    bento_cta_btn:'Conhecer a guilda'
  },
  es: {
    page_title:'Lua Crescente · Santuario', tagline:'Santuario del gremio',
    menu_open:'Abrir menú', menu_close:'Cerrar menú',
    nav_home:'Inicio', nav_culinaria:'Recetas', nav_receitas_root:'Recetas', nav_itens_tesouro:'Tesoros',
    nav_sala:'Aula', nav_combos:'Artefactos', nav_processamento:'Procesamiento',
    nav_mapa:"Mapa de Edania", nav_pesca:'Mapa de Pesca', nav_mapas_root:'Mapas',
    lang_pt:'Português', lang_es:'Español (LATAM)',
    home_eyebrow:'CONOCIMIENTO DEL GREMIO',
    home_title:'Un lugar para volver siempre.',
    home_sub:'Recetas, timers, guías y todo lo que el gremio necesita — reunido en un solo lugar.',
    home_search_placeholder:'Buscar recetas, guías, objetos...',
    popular_recipes:'Recetas más vistas', popular_sub:'Las más consultadas por los miembros.',
    view_tree:'Ver árbol ↗',
    bento_coupons:'Cupones activos', bento_coupons_sub:'Actualizados por el canal de cupones del gremio.',
    bento_view_all_coupons:'Ver todos los cupones ↗',
    bento_featured:'Destacado', bento_alchemy_guide:'Guía de Alquimia', bento_alchemy_guide_sub:'Desde los primeros pasos hasta las combinaciones más avanzadas.',
    bento_events:'Eventos', bento_events_sub:'Directo del sitio oficial de Pearl Abyss.',
    bento_temp:'Temporales', bento_perm:'Permanentes',
    bento_announcements:'Avisos', bento_announcements_sub:'De la liderazgo.',
    bento_videos:'Últimos videos', bento_videos_sub:'Tutoriales y lore en el canal del gremio.',
    cta_title:'Juntos somos más fuertes.', cta_text:'El gremio Lua Crescente tiene las puertas abiertas para quien quiere aprender, ayudar y crecer.',
    bento_cta_btn:'Conocer el gremio'
  }
};
let currentLang = localStorage.getItem('luaCrescenteLang') || 'pt';
const NAME_ES = window.ES_LATAM_TRANSLATIONS || {};
function tr(key){ return (UI_TRANSLATIONS[currentLang]&&UI_TRANSLATIONS[currentLang][key]) || UI_TRANSLATIONS.pt[key] || key; }
function tName(name){ return currentLang==='es' ? (NAME_ES[name] || name) : name; }
function applyLanguage(){
  document.documentElement.lang = currentLang==='es' ? 'es' : 'pt-BR';
  document.title = tr('page_title');
  document.querySelectorAll('[data-i18n]').forEach(el=>{ el.innerHTML = tr(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-attr]').forEach(el=>{ el.dataset.i18nAttr.split(';').forEach(pair=>{const [attr,key]=pair.split(':'); if(attr&&key) el.setAttribute(attr,tr(key));}); });
  const langBtn=document.getElementById('langBtn'); if(langBtn) langBtn.textContent = tr(currentLang==='es'?'lang_es':'lang_pt') + ' ▾';
  if(typeof buildSidebar==='function') buildSidebar();
  if(typeof draw==='function') draw(document.getElementById('search')?.value || '');
  if(typeof buildHomePopular==='function') buildHomePopular();
  if(typeof updateFoundingCounter==='function') updateFoundingCounter();
}
function setLanguage(lang){ currentLang = lang==='es'?'es':'pt'; localStorage.setItem('luaCrescenteLang',currentLang); applyLanguage(); }
function syncActiveNav(){
  const page=document.body?.dataset?.page||'home';
  document.querySelectorAll('.site-tab').forEach(a=>a.classList.toggle('active',a.dataset.page===page));
  document.querySelectorAll('.site-tab-dropdown').forEach(dropdown=>{
    const trigger = dropdown.querySelector(':scope > .site-tab');
    if(!trigger) return;
    const childPages = Array.from(dropdown.querySelectorAll('.site-tab-dropdown-menu .site-tab')).map(a => a.dataset.page);
    trigger.classList.toggle('active', childPages.indexOf(page) !== -1);
  });
}