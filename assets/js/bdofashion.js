(function(){
  'use strict';

  console.log('[bdofashion] ✅ script carregado');

  const BLOG_ID = '7467248946976772727';
  const API_KEY = 'AIzaSyB8cAnFGVMm0GxqbrjKfDTJLu9Z4uQpVUw';

  const mockTrajes = [
    { id: "1", titulo: "Vestido da Noite Eterna", classes: "Valquíria, Musa, Mística", genero: "Feminino", tipo: "Cosmético", imagemUrl: "", precoPerolas: "3.200", origem: "Loja de Pérolas", precoPrata: "4.100.000.000" },
    { id: "2", titulo: "Armadura do General", classes: "Guerreiro, Berserker", genero: "Masculino", tipo: "Cosmético", imagemUrl: "", precoPerolas: "4.100", origem: "Mercado Central", precoPrata: "15.000.000" },
    { id: "3", titulo: "Traje do Caçador", classes: "Caçadora, Domadora", genero: "Feminino", tipo: "Lifeskill", imagemUrl: "", precoPerolas: "2.500", origem: "Mercado Central", precoPrata: "" },
    { id: "4", titulo: "Conjunto do Viajante", classes: "Todas as Classes", genero: "Unissex", tipo: "Cosmético", imagemUrl: "", precoPerolas: "1.800", origem: "Caixa de Trajes", precoPrata: "" }
  ];

  var currentFashionPhotos = [];
  var currentFashionPhotoIndex = 0;
  var allTrajes = mockTrajes.slice();

  function firstValue(item, keys){
    for(var i = 0; i < keys.length; i++){
      if(item && Object.prototype.hasOwnProperty.call(item, keys[i]) && item[keys[i]] !== null && item[keys[i]] !== undefined && item[keys[i]] !== '') return item[keys[i]];
    }
    return null;
  }

  function displayValue(value){
    if(value === null || value === undefined || value === '') return '';
    if(Array.isArray(value)) return value.map(displayValue).filter(Boolean).join(', ');
    if(typeof value === 'object') return displayValue(value.value ?? value.valor ?? value.text ?? value.texto ?? '');
    return String(value);
  }

  function escapeHtml(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }

  function titleOf(traje){
    return displayValue(firstValue(traje, ['titulo', 'title', 'name'])) || 'Traje';
  }

  function imageList(traje){
    var raw = firstValue(traje, ['imagens', 'images', 'fotos', 'imageUrls', 'imageURLs']);
    if(!Array.isArray(raw)) raw = raw ? [raw] : [];
    if(!raw.length){
      var single = firstValue(traje, ['imagemUrl', 'imageUrl', 'image', 'thumbnail']);
      if(single) raw = [single];
    }
    return raw.map(function(photo){
      if(typeof photo === 'string') return { url: photo, alt: titleOf(traje) };
      if(!photo || typeof photo !== 'object') return null;
      var url = firstValue(photo, ['url', 'src', 'imageUrl', 'imagemUrl']);
      return url ? { url: String(url), alt: displayValue(firstValue(photo, ['alt', 'textoAlternativo'])) || titleOf(traje) } : null;
    }).filter(Boolean);
  }

  function mapBloggerPostToTraje(post){
    var doc = new DOMParser().parseFromString(post.content || '', 'text/html');
    var dataDiv = doc.querySelector('.fashion-data');
    var descEl = doc.querySelector('.fashion-description');
    var imgs = Array.from(doc.querySelectorAll('img')).map(function(img){ return img.src; }).filter(Boolean);
    
    var labelGeneros = ['feminino', 'masculino'];
    var labelTipos = ['lifeskill', 'cosmético', 'cosmetico'];
    
    var generos = [];
    var tipos = [];
    var classes = [];

    (post.labels || []).forEach(function(l) {
        var lower = l.toLowerCase().trim();
        var formatted = l.charAt(0).toUpperCase() + l.slice(1).toLowerCase();

        if (labelGeneros.includes(lower)) {
            generos.push(formatted);
        } else if (labelTipos.includes(lower)) {
            tipos.push(formatted);
        } else {
            classes.push(formatted);
        }
    });

    var classesFallback = dataDiv ? (dataDiv.getAttribute('data-classes') || '') : '';
    if (classes.length === 0 && classesFallback) {
        classes.push(classesFallback);
    }

    var precoPerolas = dataDiv ? (dataDiv.getAttribute('data-price') || '') : '';
    var precoPrata = dataDiv ? (dataDiv.getAttribute('data-market') || '') : '';

    if (precoPerolas.toLowerCase() === 'não disponível' || precoPerolas.toLowerCase() === 'nao disponivel') precoPerolas = '';
    if (precoPrata.toLowerCase() === 'não disponível' || precoPrata.toLowerCase() === 'nao disponivel') precoPrata = '';

    return {
      id: post.id, 
      titulo: post.title || 'Traje', 
      genero: generos.join(' · '),
      tipo: tipos.join(' · '),
      classes: classes.join(', '),
      labels: post.labels || [],
      imagens: imgs, 
      imagemUrl: imgs[0] || '',
      precoPerolas: precoPerolas,
      origem: dataDiv ? (dataDiv.getAttribute('data-source') || '') : '',
      precoPrata: precoPrata,
      descricao: descEl ? descEl.textContent : (post.snippet || '')
    };
  }

  function loadTrajesFromBlogger(){
    var url = 'https://www.googleapis.com/blogger/v3/blogs/' + BLOG_ID +
              '/posts?key=' + API_KEY + '&maxResults=100';
    return fetch(url).then(function(response){
      if(!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    }).then(function(data){
      if(!data.items || !data.items.length) return null;
      return data.items.map(mapBloggerPostToTraje);
    });
  }

  function renderFashionGrid(trajes){
    var grid = document.getElementById('fashion-grid');
    if(!grid) return;
    grid.replaceChildren();
    if(!trajes.length){
      var empty = document.createElement('div');
      empty.className = 'fashion-empty';
      empty.textContent = 'Nenhum traje encontrado para essa busca.';
      grid.appendChild(empty);
      return;
    }
    
    trajes.forEach(function(traje){
      var card = document.createElement('article');
      var photos = imageList(traje);
      var firstPhoto = photos[0];
      
      var cardSubtitle = [traje.genero, traje.tipo].filter(Boolean).join(' · ');
      if (!cardSubtitle && traje.classes) {
          cardSubtitle = traje.classes.split(',')[0]; 
      }

      card.className = 'fashion-card';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'Ver ' + titleOf(traje));
      card.innerHTML = '<div class="fashion-card-img">' +
        (firstPhoto ? '<img src="' + escapeHtml(firstPhoto.url) + '" alt="' + escapeHtml(firstPhoto.alt) + '" loading="lazy">' : '<div class="fashion-card-placeholder">Foto indisponível</div>') +
        '<button class="fashion-btn-fav" type="button" aria-label="Favoritar ' + escapeHtml(titleOf(traje)) + '">♡</button>' +
        '</div><div class="fashion-card-info"><div class="fashion-card-name">' + escapeHtml(titleOf(traje)) + '</div>' +
        '<div class="fashion-card-classes">' + escapeHtml(cardSubtitle) + '</div></div>';
      
      card.addEventListener('click', function(event){
        if(event.target.closest('.fashion-btn-fav')) return;
        openFashionModal(traje);
      });
      card.addEventListener('keydown', function(event){
        if((event.key === 'Enter' || event.key === ' ') && event.target === card){
          event.preventDefault();
          openFashionModal(traje);
        }
      });
      var favorite = card.querySelector('.fashion-btn-fav');
      favorite.addEventListener('click', function(event){
        event.stopPropagation();
        var active = favorite.classList.toggle('active');
        favorite.textContent = active ? '♥' : '♡';
        favorite.setAttribute('aria-pressed', String(active));
      });
      grid.appendChild(card);
    });
  }

  function setOptionalPanel(panelId, valueId, value){
    var panel = document.getElementById(panelId);
    var node = document.getElementById(valueId);
    var text = displayValue(value);
    panel.hidden = !text;
    node.textContent = text;
  }

  function createPanel(labelText, valueText) {
      var panel = document.createElement('div');
      panel.className = 'fashion-panel';
      var label = document.createElement('div');
      label.className = 'fashion-panel-label';
      label.textContent = labelText;
      var value = document.createElement('div');
      value.className = 'fashion-panel-value';
      value.textContent = valueText;
      panel.append(label, value);
      return panel;
  }

  function renderDynamicFields(traje){
    var container = document.getElementById('fashion-dynamic-fields');
    container.replaceChildren();
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '16px';
    container.style.marginTop = '16px';

    if (traje.genero) container.appendChild(createPanel('Gênero', traje.genero));
    if (traje.tipo) container.appendChild(createPanel('Tipo', traje.tipo));
  }

  function renderGalleryPhoto(){
    var container = document.getElementById('fashion-modal-img');
    var previous = document.getElementById('fashion-gallery-prev');
    var next = document.getElementById('fashion-gallery-next');
    container.replaceChildren();
    var hasMultiple = currentFashionPhotos.length > 1;
    previous.hidden = !hasMultiple;
    next.hidden = !hasMultiple;
    if(!currentFashionPhotos.length){
      container.removeAttribute('aria-label');
      return;
    }
    var photo = currentFashionPhotos[currentFashionPhotoIndex];
    var image = document.createElement('img');
    image.src = photo.url;
    image.alt = photo.alt;
    container.appendChild(image);
  }

  function moveFashionPhoto(direction){
    if(currentFashionPhotos.length < 2) return;
    currentFashionPhotoIndex = (currentFashionPhotoIndex + direction + currentFashionPhotos.length) % currentFashionPhotos.length;
    renderGalleryPhoto();
  }

  function openFashionModal(traje){
    var title = titleOf(traje);
    document.getElementById('fashion-modal-title').textContent = title;
    
    var eyebrow = document.getElementById('fashion-modal-class');
    eyebrow.textContent = ''; 
    eyebrow.hidden = true;

    setOptionalPanel('fashion-panel-classes', 'fashion-modal-classes', traje.classes);
    setOptionalPanel('fashion-panel-source', 'fashion-modal-source', traje.origem);
    setOptionalPanel('fashion-panel-description', 'fashion-modal-description', traje.descricao);
    
    var priceText = displayValue(traje.precoPerolas);
    var marketText = displayValue(traje.precoPrata);
    
    var priceField = document.getElementById('fashion-field-price');
    var marketField = document.getElementById('fashion-field-market');
    
    if (priceText) {
        priceField.hidden = false;
        document.getElementById('fashion-modal-price').textContent = priceText;
    } else {
        priceField.hidden = true;
    }

    if (marketText) {
        marketField.hidden = false;
        document.getElementById('fashion-modal-market').textContent = marketText;
    } else {
        marketField.hidden = true;
    }

    document.getElementById('fashion-panel-market-price').hidden = !priceText && !marketText;
    
    renderDynamicFields(traje);
    
    currentFashionPhotos = imageList(traje);
    currentFashionPhotoIndex = 0;
    renderGalleryPhoto();
    var modal = document.getElementById('fashion-modal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeFashionModal(){
    var modal = document.getElementById('fashion-modal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  window.openFashionModal = openFashionModal;
  window.closeFashionModal = closeFashionModal;

  function updateGlobalSearch(trajes){
    window.LuaCrescenteSearchItems = (window.LuaCrescenteSearchItems || []).concat(
      trajes.map(function(traje){
        return {
          n: firstValue(traje, ['titulo', 'title', 'name']) || '',
          g: traje.genero + ' ' + traje.tipo,
          t: 'fashion',
          id: traje.id,
          s: traje.classes
        };
      })
    );
  }

  function setupSearch() {
    var searchInput = document.getElementById('fashion-search-input');
    var searchForm = document.getElementById('fashionSearchForm');

    if (!searchInput || !searchForm) return;

    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
    });

    searchInput.addEventListener('input', function(e) {
      var termo = e.target.value.toLowerCase().trim();

      if (!termo) {
        renderFashionGrid(allTrajes);
        return;
      }

      var filtrados = allTrajes.filter(function(traje) {
        var searchString = [
          traje.titulo,
          traje.genero,
          traje.tipo,
          traje.classes,
          traje.origem,
          traje.descricao,
          (traje.labels || []).join(' ')
        ].join(' ').toLowerCase();

        return searchString.includes(termo);
      });

      renderFashionGrid(filtrados);
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    var grid = document.getElementById('fashion-grid');
    if(!grid) return;

    setupSearch();
    renderFashionGrid(allTrajes);
    updateGlobalSearch(allTrajes);

    loadTrajesFromBlogger().then(function(fromBlogger){
      if(fromBlogger && fromBlogger.length){
        console.log('[bdofashion] ✅ Blogger retornou', fromBlogger.length, 'trajes');
        allTrajes = fromBlogger;
        renderFashionGrid(allTrajes);
      } else {
        console.log('[bdofashion] Blogger vazio, mantendo mocks');
      }
    }).catch(function(err){
      console.warn('[bdofashion] ❌ Blogger falhou:', err);
    });

    var prev = document.getElementById('fashion-gallery-prev');
    var next = document.getElementById('fashion-gallery-next');
    if(prev) prev.addEventListener('click', function(){ moveFashionPhoto(-1); });
    if(next) next.addEventListener('click', function(){ moveFashionPhoto(1); });

    var modal = document.getElementById('fashion-modal');
    if(modal){
      modal.addEventListener('click', function(event){ if(event.target === modal) closeFashionModal(); });
    }
    document.addEventListener('keydown', function(event){
      if(!modal || !modal.classList.contains('open')) return;
      if(event.key === 'Escape') closeFashionModal();
      else if(event.key === 'ArrowLeft') moveFashionPhoto(-1);
      else if(event.key === 'ArrowRight') moveFashionPhoto(1);
    });
  });
})();