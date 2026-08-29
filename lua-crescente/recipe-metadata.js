const SUBRECIPES = {
  // --- Essência Espiritual de Ornette/Odore: estágios 1 e 2 (Alquimia Simples, Bolsa de Yaz) ---
  'Essência Espiritual Abençoada Maior': {
    note: 'Estágio 2 — combine com 1 das 2 peças raras restantes (a que você não usou no estágio 1). Recupera 400 HP.',
    children: [
      {name:'Essência Espiritual Abençoada', qty:1},
    ]
  },
  'Essência Espiritual Abençoada': {
    note: 'Estágio 1 — combine a Água Eterna com 1 das 3 peças raras à sua escolha (Cápsula de Sherakhan, Espiritualidade de Ron ou Kagtunak da Meia-Lua Cinzenta); qualquer uma serve pra começar. Recupera 250 HP.',
    children: [
      {name:'Água Eterna', qty:1},
    ]
  },
  'Essência Espiritual Abençoada Maior (Odore)': {
    note: 'Estágio 2 — combine com 1 das 2 peças raras restantes (a que você não usou no estágio 1).',
    children: [
      {name:'Essência Espiritual Abençoada (Odore)', qty:1},
    ]
  },
  'Essência Espiritual Abençoada (Odore)': {
    note: 'Estágio 1 — combine a Água Eterna com 1 das 3 peças raras à sua escolha (Lágrima Vermelha de Nakk, Glândula de Veneno de Makhtanan ou Semblante de Valtarra); qualquer uma serve pra começar.',
    children: [
      {name:'Água Eterna', qty:1},
    ]
  },
  'Evenruth': {
    note: 'Craftado via Alquimia Simples (Processamento, tecla L).',
    children: [
      {name:'Flor de Okilua', qty:1000},
      {name:'Lágrimas de Okilua', qty:1},
    ]
  },

  'Água Purificada': {
    note: 'Também comprável de Vendedor de Bens Gerais (Sand Grain Bazaar, Muiquun, Arehaza).',
    children: [
      {name:'Garrafa de Água de Rio', qty:1, source:'Encha uma Garrafa Vazia (comprada do Vendedor de Materiais) em um rio; depois use Filtragem (Processamento, tecla L)'},
    ]
  },
  'Reagente Líquido Limpo': {
    note: 'Craftado via Alquimia (Iniciante 1) no Utensílio de Alquimia.',
    children: [
      {name:'Sal', qty:1, source:'Compra (Vendedor de Bens Gerais) ou evaporação de Água do Mar'},
      {name:'Erva Aurora', qty:1, source:'Coleta de ervas ou compra (Vendedor de Ervas)'},
      {name:'Água Purificada', qty:1},
      {name:'Grama Selvagem', qty:1, source:'Coleta de grama ou compra (Vendedor de Ervas)', alternatives:['Erva Daninha']},
    ]
  },
  // --- Elixires-base usados pelos Fármacos ---
  'Elixir de Fúria': {
    note: 'Craftado via Alquimia (Novato 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Seiva de Freixo', qty:1},
      {name:'Cogumelo Anão', qty:4},
      {name:'Sangue de Urso', qty:4},
      {name:'Água Purificada', qty:3},
    ]
  },
  'Elixir da Concentração': {
    note: 'Craftado via Alquimia (Novato 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Reagente Líquido Limpo', qty:1},
      {name:'Cogumelo Nuvem', qty:3},
      {name:'Sangue de Urso', qty:3},
      {name:'Erva Daninha', qty:8, source:'Coleta de ervas/arbustos com as mãos ou uma Enxada.'},
    ]
  },
  'Elixir da Defesa': {
    note: 'Craftado via Alquimia (Novato 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Reagente Líquido Limpo', qty:1},
      {name:'Seiva de Freixo', qty:6},
      {name:'Sangue de Porco', qty:5},
      {name:'Água Purificada', qty:3},
    ]
  },
  'Elixir de Estamina': {
    note: 'Craftado via Alquimia (Novato 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Reagente em pó Puro', qty:1},
      {name:'Seiva de Bétula', qty:5},
      {name:'Sangue de Urso', qty:4},
      {name:'Cogumelo Anão', qty:2},
    ]
  },
  'Elixir da Vontade': {
    note: 'Craftado via Alquimia no Utensílio de Alquimia.',
    children: [
      {name:'Reagente em pó Puro', qty:1},
      {name:'Erva Aurora', qty:4, source:'Coleta de ervas ou compra (Vendedor de Ervas)'},
      {name:'Sangue de Lobo', qty:6, source:'Coleta de Fluidos de lobos usando um Coletor de Fluidos.'},
      {name:'Água Purificada', qty:3},
    ]
  },

  // --- Refeição Simples de Cron: rações e refeições regionais (Culinária) ---
  'Ração de Combate do Cavaleiro': {
    note: 'Culinária (Habilidoso 6+) no Utensílio de Culinária.',
    children: [
      {name:'Pudim Escuro', qty:1},
      {name:'Sanduíche de Presunto', qty:1},
      {name:'Croquete de Carne', qty:1},
      {name:'Vinho de Fruta', qty:1},
    ]
  },
'Refeição de Drieghan Especial': {
    note: 'Culinária (Mestre 1+) no Utensílio de Culinária.',
    children: [
      {name:'Espetinho de Queijo de Lhama', qty:1},
      {name:'Samambaia Frita', qty:1},
      {name:'Churrasco de Marmota', qty:1},
      {name:'Ghormeh Sabzi', qty:1},
      {name:'Licor de Mel', qty:2},
    ]
  },
  // --- Um nível abaixo: pratos usados na Ração do Cavaleiro (recipes confirmadas) ---
'Vinho de Fruta': {
    note: 'Culinária no Utensílio de Culinária.',
    children: [
      {name:'Fruta (Maçã ou outra fruta à escolha)', qty:5, source:'Cultivo (Fazenda) ou compra do Vendedor de Ingredientes'},
      {name:'Makgeolli', qty:1},
      {name:'Água Mineral', qty:2, source:'Comprável do Vendedor de Ingredientes, ou obtida em poços e fontes'},
      {name:'Essência do Liquor', qty:3},
    ]
  },
'Mingau de Aveia': {
    note: 'Culinária (Aprendiz 1+) no Utensílio de Culinária.',
    children: [
      {name:'Farinha (de Milho ou outro grão)', qty:9, source:'Comprável do Vendedor de Ingredientes, ou moagem de grãos'},
      {name:'Leite', qty:3, source:'Obtido de vacas leiteiras na fazenda, ou comprável do Vendedor de Ingredientes'},
      {name:'Cebola', qty:3, source:'Cultivo (Fazenda) ou compra do Vendedor de Ingredientes'},
      {name:'Mel de Cozinha', qty:2, source:'Comprável do Vendedor de Ingredientes, ou produzido a partir de Mel'},
    ]
  },
'Vinho de Ervas Exóticas': {
    note: 'Culinária no Utensílio de Culinária.',
    children: [
      {name:'Essência do Liquor', qty:3},
      {name:'Fruta (à escolha)', qty:5, source:'Cultivo (Fazenda) ou compra do Vendedor de Ingredientes'},
      {name:'Água Mineral', qty:2, source:'Comprável do Vendedor de Ingredientes, ou obtida em poços e fontes'},
    ]
  },
'Torta de Figo': {
    note: 'Culinária no Utensílio de Culinária.',
    children: [
      {name:'Figo', qty:5, source:'Compra no Mercado Central, ou coleta por trabalhador em Akman / Fazenda Shakatu'},
      {name:'Massa de Trigo', qty:3, source:'Mistura (Processamento) de Farinha de Trigo com Água Mineral'},
      {name:'Açúcar', qty:3, source:'Comprável do Vendedor de Ingredientes'},
      {name:'Azeite de Oliva', qty:2, source:'Comprável do Vendedor de Ingredientes, ou produzido a partir de Azeitona'},
    ]
  },
  'Hambúrguer do Rei da Selva': {
    note: 'Culinária (Profissional 1+) no Utensílio de Culinária.',
    children: [
      {name:'Carne de Leão', qty:4, source:'Loot ao caçar leões, na região de Valência'},
      {name:'Pão de Teff', qty:4},
      {name:'Vegetais em Conserva', qty:2},
      {name:'Noz-moscada', qty:3, source:'Cultivo (Fazenda) ou compra do Vendedor de Ingredientes'},
    ]
  },
  'Sanduíche Teff': {
    note: 'Culinária no Utensílio de Culinária.',
    children: [
      {name:'Pão de Teff', qty:1, alternatives:[{name:'Pão de Teff Esponjoso', qty:1}]},
      {name:'Ensopado de Cobra Freekeh', qty:1},
      {name:'Escorpião Grelhado', qty:1},
      {name:'Molho Vermelho', qty:3},
    ]
  },
  'Vegetais em Conserva': {
    note: 'Culinária no Utensílio de Culinária.',
    children: [
      {name:'Vegetal (à escolha)', qty:8, source:'Cultivo (Fazenda) ou compra do Vendedor de Ingredientes'},
      {name:'Vinagre', qty:4, source:'Comprável do Vendedor de Ingredientes, ou produzido a partir de fruta fermentada'},
      {name:'Fermento', qty:2, source:'Comprável do Estalajadeiro'},
      {name:'Açúcar', qty:2, source:'Comprável do Vendedor de Ingredientes'},
    ]
  },
'Licor de Mel': {
    note: 'Culinária no Utensílio de Culinária.',
    children: [
      {name:'Mel', qty:3, source:'Loot de nós de produção (Mercenários) na região de Balenos'},
      {name:'Essência do Liquor', qty:2},
      {name:'Açúcar', qty:2, source:'Comprável do Vendedor de Ingredientes'},
      {name:'Água Mineral', qty:6, source:'Comprável do Vendedor de Ingredientes, ou obtida em poços e fontes'},
    ]
  },
'Pão de Teff': {
    note: 'Culinária no Utensílio de Culinária.',
    children: [
      {name:'Farinha de Teff', qty:5, source:'Moagem (Processamento) do grão Teff'},
      {name:'Água Mineral', qty:3, source:'Comprável do Vendedor de Ingredientes, ou obtida em poços e fontes'},
      {name:'Fermento', qty:2, source:'Comprável do Estalajadeiro'},
      {name:'Sal', qty:2, source:'Comprável do Vendedor de Bens Gerais, ou evaporação de Água do Mar'},
    ]
  },
  'Massa de Teff': {
    note: 'Processamento (Misturar) no Utensílio de Processamento.',
    children: [
      {name:'Farinha de Teff', qty:1, source:'Moagem (Processamento) do grão Teff'},
      {name:'Água Mineral', qty:1, source:'Comprável do Vendedor de Ingredientes, ou obtida em poços e fontes'},
    ]
  },
  'Vinho de Tamareira': {
    note: 'Culinária (Aprendiz 6+) no Utensílio de Culinária.',
    children: [
      {name:'Tâmara', qty:5, source:'Cultivo (Fazenda) na região de Valência, ou compra do Vendedor de Ingredientes'},
      {name:'Essência do Liquor', qty:2},
      {name:'Açúcar', qty:1, source:'Comprável do Vendedor de Ingredientes'},
      {name:'Fermento', qty:4, source:'Comprável do Estalajadeiro'},
    ]
  },
'Ovos de Pássaro Cozidos': {
    note: 'Culinária (Iniciante 6+) no Utensílio de Culinária.',
    children: [
      {name:'Ovo', qty:3, source:'Comprável do Vendedor de Ingredientes, ou obtido com trabalhadores e missões'},
      {name:'Água Mineral', qty:6, source:'Comprável do Vendedor de Ingredientes, ou obtida em poços e fontes'},
      {name:'Vinho de Cozinha', qty:1, source:'Comprável do Vendedor de Ingredientes'},
      {name:'Sal', qty:1, source:'Comprável do Vendedor de Bens Gerais, ou evaporação de Água do Mar'},
    ]
  },
'Samambaia Frita': {
    note: 'Culinária (Profissional 1+) no Utensílio de Culinária.',
    children: [
      {name:'Samambaia', qty:8, source:'Coleta na região de Drieghan (Vida de Coleta)'},
      {name:'Alho', qty:5, source:'Cultivo (Fazenda) ou compra do Vendedor de Ingredientes'},
      {name:'Sal', qty:2, source:'Comprável do Vendedor de Bens Gerais, ou evaporação de Água do Mar'},
      {name:'Água Mineral', qty:5, source:'Comprável do Vendedor de Ingredientes, ou obtida em poços e fontes'},
      {name:'Azeite de Oliva', qty:2, source:'Comprável do Vendedor de Ingredientes, ou produzido a partir de Azeitona'},
    ]
  },
'Escorpião Grelhado': {
    note: 'Culinária (Habilidoso 1+) no Utensílio de Culinária.',
    children: [
      {name:'Carne de Escorpião', qty:3, source:'Loot ao caçar e abater escorpiões'},
      {name:'Manteiga', qty:2, source:'Comprável do Vendedor de Ingredientes, ou produzida a partir de Leite'},
      {name:'Noz-moscada', qty:3, source:'Cultivo (Fazenda) ou compra do Vendedor de Ingredientes'},
      {name:'Pimenta Vermelha', qty:3, source:'Cultivo (Fazenda) ou compra do Vendedor de Ingredientes'},
    ]
  },
// --- Perfume da Perseverança: reagentes de Alquimia ---
  'Reagente em pó Puro': {
    note: 'Craftado via Alquimia (Iniciante 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Açúcar', qty:1, source:'Comprável do Vendedor de Ingredientes'},
      {name:'Azaleia Real Prata', qty:1, source:'Coleta de ervas (mãos ou Enxada) na Planície Norte de Serendia e Ruínas da Fazenda Lynch; também pode ser cultivada.'},
      {name:'Água Purificada', qty:1},
      {name:'Grama Selvagem', qty:1, source:'Coleta de grama ou compra com Vendedor de Ervas.', alternatives:['Erva Daninha']},
    ]
  },
  'Óleo de Regeneração': {
    note: 'Craftado via Alquimia (Habilidoso 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Sangue da Fera Lendária', qty:1},
      {name:'Fruto da Natureza', qty:1},
      {name:'Pó de Rachadura', qty:1},
      {name:'Caroço de Árvore Vermelha', qty:1, alt:{name:'Erva Eterna', qty:1}},
    ]
  },
  'Sangue da Fera Lendária': {
    note: 'Craftado via Alquimia no Utensílio de Alquimia. Produção: 1–4 unidades.',
    children: [
      {name:'Reagente em pó Puro', qty:1},
      {name:'Sangue de Lagarto', qty:2, alternatives:['Sangue de Minhoca','Sangue de Morcego','Sangue de Pássaro Kuku','Sangue de Cobra'], source:'Coleta de Fluidos de lagartos usando um Coletor de Fluidos.'},
      {name:'Vestígio da Natureza', qty:1},
      {name:'Folha de Espírito', qty:1},
    ]
  },
  'Óleo de Abismo': {
    note: 'Craftado via Alquimia no Utensílio de Alquimia.',
    children: [
      {name:'Sangue do Tirano', qty:1},
      {name:'Fruta do Mar Profundo', qty:1},
      {name:'Pó do Tempo', qty:2},
      {name:'Laço de Árvore Sangrenta', qty:2},
    ]
  },
  'Sangue do Tirano': {
    note: 'Craftado via Alquimia (Aprendiz 1+) no Utensílio de Alquimia. Produção: 1–4 unidades; Pó Brilhante pode ser obtido como produto adicional.',
    children: [
      {name:'Reagente em pó Puro', qty:1},
      {name:'Sangue de Urso', qty:2, alternatives:['Sangue de Troll','Sangue de Ogro','Sangue de Dinossauro','Sangue de Leão','Sangue de Iaque','Sangue de Elefante Rocha'], source:'Coleta de Fluidos de ursos usando um Coletor de Fluidos.'},
      {name:'Vestígio da Natureza', qty:1},
      {name:'Galho de Monge', qty:1, source:'Obtido ao Cortar árvores ou por trabalhador em Nós de Produção.'},
    ]
  },
  'Óleo da Corrupção': {
    note: 'Craftado via Alquimia (Habilidoso 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Fruto da Natureza', qty:1},
      {name:'Pó de Escuridão', qty:1},
      {name:'Folha de Espírito', qty:1},
      {name:'Sangue do Pecador', qty:1},
    ]
  },
  'Sangue do Pecador': {
    note: 'Craftado via Alquimia (Aprendiz 1+) no Utensílio de Alquimia. Produção: 1–4 unidades; Pó Brilhante pode ser obtido como produto adicional.',
    children: [
      {name:'Laço de Árvore Sangrenta', qty:1},
      {name:'Pó de Chama', qty:1},
      {name:'Reagente Líquido Limpo', qty:1},
      {name:'Sangue de Porco', qty:2, alternatives:['Sangue de Cervo','Sangue de Ovelha','Sangue de Boi','Sangue de Waragon','Sangue de Lhama','Sangue de Cabra']},
    ]
  },

  // --- Fármacos Tradicionais: cascata do Fármaco da Onda ---
  'Elixir de Pescador': {
    note: 'Craftado via Alquimia (Hábil 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Sangue de Homem Sábio', qty:1},
      {name:'Erva Aurora', qty:6},
      {name:'Seiva de Abeto', qty:3},
      {name:'Pó de Chama', qty:2},
    ]
  },

  // --- Fármacos Tradicionais: cascatas do Oceano/Onda ---
  'Elixir da Maestria': {
    note: 'Craftado via Alquimia (Hábil 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Óleo de Tranquilidade', qty:2},
      {name:'Reagente de Delotia Purificado', qty:3},
      {name:'Seiva de Espinheiro', qty:5},
      {name:'Erva Eterna', qty:5},
      {name:'Vestígio da Natureza', qty:2},
    ]
  },
  'Elixir do Tempo': {
    note: 'Craftado via Alquimia (Aprendiz 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Sangue de Homem Sábio', qty:1},
      {name:'Flor de Escama de Fogo', qty:6},
      {name:'Pó do Tempo', qty:2},
      {name:'Seiva de Bordo', qty:5},
    ]
  },
  'Elixir de Amizade': {
    note: 'Craftado via Alquimia (Aprendiz 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Sangue da Fera Lendária', qty:1},
      {name:'Flor de Escama de Fogo', qty:5},
      {name:'Pó de Pedra Negra', qty:3},
      {name:'Seiva de Freixo', qty:6},
    ]
  },

  // --- Fármaco da Armadura de Aço ---
  'Elixir de Vida': {
    note: 'Craftado via Alquimia (Iniciante 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Reagente em pó Puro', qty:1},
      {name:'Poção de HP (P)', qty:3},
      {name:'Azaleia Real Prata', qty:3},
      {name:'Sangue de Raposa', qty:5},
    ]
  },
  'Elixir da Armadura de Aço': {
    note: 'Craftado via Alquimia (Habilidoso 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Óleo de Coragem', qty:3},
      {name:'Reagente de Delotia Purificado', qty:3},
      {name:'Seiva de Espinheiro', qty:5},
      {name:'Sangue de Turo Rígido', qty:1},
    ]
  },
  'Óleo de Coragem': {
    note: 'Craftado via Alquimia no Utensílio de Alquimia.',
    children: [
      {name:'Fruto da Natureza', qty:1},
      {name:'Galho de Monge', qty:1, source:'Obtido ao Cortar árvores ou por trabalhador em Nós de Produção.'},
      {name:'Pó de Chama', qty:1},
      {name:'Sangue de Palhaço', qty:1},
    ]
  },
  // --- Fármaco da Fera ---
  'Elixir do Ceifador': {
    note: 'Craftado via Alquimia (Habilidoso 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Óleo de Coragem', qty:1},
      {name:'Reagente em pó Puro', qty:4},
      {name:'Cogumelo Céu', qty:2},
      {name:'Vestígio da Natureza', qty:4},
      {name:'Galho de Monge', qty:2, source:'Obtido ao Cortar árvores ou por trabalhador em Nós de Produção.'},
    ]
  },
  'Elixir de Experiência': {
    note: 'Craftado via Alquimia (Aprendiz 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Sangue de Palhaço', qty:1},
      {name:'Planta Juba de Leão', qty:7},
      {name:'Pó de Chama', qty:2},
      {name:'Seiva de Pinheiro', qty:5},
    ]
  },
  'Sangue de Palhaço': {
    note: 'Craftado via Alquimia no Utensílio de Alquimia. Produção: 1–4 unidades; Pó Brilhante pode ser obtido como produto adicional.',
    children: [
      {name:'Reagente Líquido Limpo', qty:1},
      {name:'Sangue de Lobo', qty:2, alternatives:['Sangue de Rinoceronte','Sangue de Dragão Guepardo','Sangue de Flamingo'], source:'Coleta de Fluidos de lobos usando um Coletor de Fluidos.'},
      {name:'Pó de Escuridão', qty:1},
      {name:'Folha de Espírito', qty:2},
    ]
  },
  'Reagente de Delotia Purificado': {
    note: 'Craftado via Alquimia no Utensílio de Alquimia.',
    children: [
      {name:'Pó de Delotia', qty:3},
      {name:'Reagente Líquido Limpo', qty:1},
      {name:'Reagente em pó Puro', qty:1},
    ]
  },

  // --- Fármaco da Fúria ---
  'Elixir da Destruição': {
    note: 'Craftado via Alquimia (Habilidoso 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Óleo da Tempestade', qty:1},
      {name:'Vestígio da Natureza', qty:3},
      {name:'Reagente Líquido Limpo', qty:5},
      {name:'Pó de Chama', qty:5},
      {name:'Seiva de Cedro Nevado', qty:7},
    ]
  },
  'Óleo da Tempestade': {
    note: 'Craftado via Alquimia no Utensílio de Alquimia.',
    children: [
      {name:'Fruto da Natureza', qty:1},
      {name:'Pó do Tempo', qty:1},
      {name:'Casca de Árvore Velha', qty:1},
      {name:'Sangue do Tirano', qty:1},
    ]
  },
  'Elixir de Caça a Humano': {
    note: 'Craftado via Alquimia (Aprendiz 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Sangue de Palhaço', qty:1},
      {name:'Cogumelo Adivinho', qty:4},
      {name:'Pó de Pedra Negra', qty:3},
      {name:'Seiva de Bordo', qty:4, source:'Coleta de Fluidos em Bordo com um Coletor de Fluidos; também pode ser obtida por Nó de Produção de Cortar Lenha.'},
    ]
  },
  'Elixir de Trabalhador': {
    note: 'Craftado via Alquimia (Aprendiz 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Sangue do Pecador', qty:1},
      {name:'Azaleia Real Prata', qty:6},
      {name:'Pó de Chama', qty:2},
      {name:'Seiva de Freixo', qty:4},
    ]
  },

  'Elixir do Frenesi': {
    note: 'Craftado via Alquimia (Habilidoso 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Óleo de Regeneração', qty:1},
      {name:'Reagente Líquido Limpo', qty:5},
      {name:'Seiva de Cedro', qty:5},
      {name:'Vestígio da Natureza', qty:3},
      {name:'Cogumelo Fantasma', qty:2},
    ]
  },

  // --- Fármaco do Gigante ---
  'Elixir de Choque': {
    note: 'Craftado via Alquimia (Aprendiz 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Sangue de Palhaço', qty:1},
      {name:'Cogumelo Tigre', qty:5},
      {name:'Seiva de Cedro', qty:7},
      {name:'Pó do Tempo', qty:3},
    ]
  },
  'Elixir de Perfuração': {
    note: 'Craftado via Alquimia (Habilidoso 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Óleo da Corrupção', qty:1},
      {name:'Vestígio da Natureza', qty:2, source:'Escavação em Nós de Produção — obtido por trabalhadores em nós de produção apropriados.'},
      {name:'Cogumelo Blefista', qty:5},
      {name:'Reagente Líquido Limpo', qty:4},
      {name:'Seiva de Pinheiro', qty:5},
    ]
  },

  // --- Fármaco do Alvoroço ---
  'Elixir de Caça a Humanoide': {
    note: 'Craftado via Alquimia (Aprendiz 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Sangue do Pecador', qty:1},
      {name:'Cogumelo Flecha', qty:4},
      {name:'Pó de Pedra Negra', qty:3},
      {name:'Seiva de Abeto', qty:4},
    ]
  },

  // --- Fármaco de Barbaridade ---
  'Elixir de Espírito Weenie': {
    note: 'Craftado via Alquimia no Utensílio de Alquimia.',
    children: [
      {name:'Seiva de Árvore Musgosa', qty:4},
      {name:'Cogumelo Azul', qty:2},
      {name:'Pó do Tempo', qty:3},
      {name:'Galho de Monge', qty:5, source:'Obtido ao Cortar árvores ou por trabalhador em Nós de Produção.'},
      {name:'Flor Celestial', qty:1},
    ]
  },
  'Elixir de Espírito Looney': {
    note: 'Craftado via Alquimia no Utensílio de Alquimia.',
    children: [
      {name:'Seiva de Árvore Musgosa', qty:4},
      {name:'Cogumelo Vulcão', qty:2},
      {name:'Pó de Chama', qty:3},
      {name:'Caroço de Árvore Vermelha', qty:5},
      {name:'Malva', qty:1},
    ]
  },
  'Elixir de Espiral': {
    note: 'Craftado via Alquimia (Aprendiz 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Seiva de Tuia', qty:6},
      {name:'Galho de Monge', qty:3, source:'Obtido ao Cortar árvores ou por trabalhador em Nós de Produção.'},
      {name:'Sangue de Palhaço', qty:2},
      {name:'Pó de Chama', qty:2},
      {name:'Água Purificada', qty:3},
    ]
  },

  // --- Os 5 Fármacos-base do Fármaco da Harmonia ---
  'Fármaco da Raiva': {
    note: 'Craftado via Alquimia Simples (Processamento, tecla L).',
    children: [
      {name:'Elixir de Fúria', qty:30},
      {name:'Elixir do Frenesi', qty:30},
      {name:'Elixir da Concentração', qty:30},
      {name:'Elixir da Destruição', qty:30},
      {name:'Catalisador Mágico', qty:10},
    ]
  },
  'Fármaco da Adaptação': {
    note: 'Craftado via Alquimia Simples (Processamento, tecla L).',
    children: [
      {name:'Elixir da Defesa', qty:30},
      {name:'Elixir de Estamina', qty:30},
      {name:'Elixir de Vida', qty:30},
      {name:'Elixir de Espiral', qty:30},
      {name:'Catalisador Mágico', qty:10},
    ]
  },
  'Fármaco do Potencial': {
    note: 'Craftado via Alquimia Simples (Processamento, tecla L).',
    children: [
      {name:'Elixir do Vento', qty:30},
      {name:'Elixir de Rapidez', qty:30},
      {name:'Elixir de Feitiço', qty:30},
      {name:'Elixir de Choque', qty:30},
      {name:'Catalisador Mágico', qty:10},
    ]
  },
  'Fármaco da Decadência': {
    note: 'Craftado via Alquimia Simples (Processamento, tecla L).',
    children: [
      {name:'Elixir do Ceifador', qty:30},
      {name:'Elixir da Morte', qty:30},
      {name:'Elixir de Perfuração', qty:30},
      {name:'Elixir de Pilhagem', qty:30},
      {name:'Catalisador Mágico', qty:10},
    ]
  },
  'Fármaco da Ira Descontrolada': {
    note: 'Craftado via Alquimia Simples (Processamento, tecla L).',
    children: [
      {name:'Elixir do Céu', qty:30},
      {name:'Elixir de Carnificina', qty:30},
      {name:'Elixir de Detecção', qty:30},
      {name:'Elixir de Assassinato', qty:30},
      {name:'Catalisador Mágico', qty:10},
    ]
  },
  'Óleo da Imortalidade Decadente': {
    note: 'Craftado via Alquimia (Profissional 6+) no Utensílio de Alquimia.',
    children: [
      {name:'Coração dos Turos', qty:1},
      {name:'Vestígio do Espírito Queimado', qty:1},
      {name:'Óleo de Regeneração', qty:20},
      {name:'Óleo de Coragem', qty:20},
      {name:'Óleo da Corrupção', qty:20},
    ]
  },
  'Óleo de Tranquilidade': {
    note: 'Craftado via Alquimia no Utensílio de Alquimia.',
    children: [
      {name:'Sangue de Homem Sábio', qty:1},
      {name:'Laço de Árvore Sangrenta', qty:1},
      {name:'Fruto da Natureza', qty:1},
      {name:'Pó da Terra', qty:1},
    ]
  },
  'Sangue de Homem Sábio': {
    note: 'Craftado via Alquimia no Utensílio de Alquimia. Produção: 1–4 unidades; Pó Brilhante pode ser obtido como produto adicional.',
    children: [
      {name:'Galho de Monge', qty:1, source:'Obtido ao Cortar árvores ou por trabalhador em Nós de Produção.'},
      {name:'Vestígio da Natureza', qty:1},
      {name:'Reagente Líquido Limpo', qty:1},
      {name:'Sangue de Raposa', qty:2, alternatives:['Sangue de Guaxinim','Sangue de Macaco','Sangue de Doninha','Sangue de Escorpião','Sangue de Marmota'], source:'Coleta de Fluidos de raposas usando um Coletor de Fluidos.'},
    ]
  },
  'Elixir de Assassinato': {
    note: 'Craftado via Alquimia no Utensílio de Alquimia.',
    children: [
      {name:'Óleo de Regeneração', qty:1},
      {name:'Reagente em pó Puro', qty:5},
      {name:'Cogumelo Amanita', qty:4},
      {name:'Caroço de Árvore Vermelha', qty:2},
      {name:'Vestígio da Natureza', qty:2, source:'Escavação em Nós de Produção — obtido por trabalhadores em nós de produção apropriados.'},
    ]
  },
  'Elixir de Carnificina': {
    note: 'Craftado via Alquimia no Utensílio de Alquimia.',
    children: [
      {name:'Óleo da Corrupção', qty:1},
      {name:'Reagente em pó Puro', qty:7},
      {name:'Cogumelo Tigre', qty:2},
      {name:'Folha de Espírito', qty:2},
      {name:'Vestígio da Natureza', qty:3},
    ]
  },
  'Elixir da Morte': {
    note: 'Craftado via Alquimia no Utensílio de Alquimia.',
    children: [
      {name:'Óleo de Tranquilidade', qty:1},
      {name:'Reagente Líquido Limpo', qty:6},
      {name:'Cogumelo Ancestral', qty:2},
      {name:'Seiva de Freixo', qty:7},
      {name:'Vestígio da Natureza', qty:2, source:'Escavação em Nós de Produção — obtido por trabalhadores em nós de produção apropriados.'},
    ]
  },
  'Elixir de Detecção': {
    note: 'Craftado via Alquimia no Utensílio de Alquimia.',
    children: [
      {name:'Óleo da Tempestade', qty:1},
      {name:'Reagente em pó Puro', qty:6},
      {name:'Trufa', qty:3},
      {name:'Casca de Árvore Velha', qty:2},
      {name:'Vestígio da Natureza', qty:3},
    ]
  },
  'Elixir de Pilhagem': {
    note: 'Craftado via Alquimia (Hábil 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Óleo de Coragem', qty:1},
      {name:'Reagente Líquido Limpo', qty:4},
      {name:'Cogumelo Corcunda', qty:3},
      {name:'Seiva de Bétula', qty:4},
      {name:'Vestígio da Natureza', qty:2},
    ]
  },
  'Elixir de Resistência': {
    note: 'Craftado via Alquimia (Novato 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Seiva de Bétula', qty:1},
      {name:'Cogumelo Nuvem', qty:3},
      {name:'Sangue de Lobo', qty:7, source:'Coleta de Fluidos de lobo usando um Coletor de Fluidos.'},
      {name:'Água Purificada', qty:3},
    ]
  },
  'Elixir do Céu': {
    note: 'Craftado via Alquimia no Utensílio de Alquimia.',
    children: [
      {name:'Óleo de Tranquilidade', qty:1},
      {name:'Reagente em pó Puro', qty:6},
      {name:'Cogumelo Imperador', qty:1},
      {name:'Laço de Árvore Sangrenta', qty:2},
      {name:'Vestígio da Natureza', qty:4},
    ]
  },
  'Elixir de Feitiço': {
    note: 'Craftado via Alquimia no Utensílio de Alquimia.',
    children: [
      {name:'Sangue do Tirano', qty:1},
      {name:'Flor de Escama de Fogo', qty:5},
      {name:'Seiva de Bordo', qty:3},
      {name:'Pó de Escuridão', qty:2},
    ]
  },
  'Elixir de Rapidez': {
    note: 'Craftado via Alquimia no Utensílio de Alquimia.',
    children: [
      {name:'Sangue da Fera Lendária', qty:1},
      {name:'Cogumelo Flecha', qty:5},
      {name:'Seiva de Bétula', qty:5},
      {name:'Pó de Escuridão', qty:2},
    ]
  },
  'Elixir do Vento': {
    note: 'Craftado via Alquimia no Utensílio de Alquimia.',
    children: [
      {name:'Sangue de Homem Sábio', qty:1},
      {name:'Cogumelo Adivinho', qty:5},
      {name:'Seiva de Pinheiro', qty:5},
      {name:'Pó de Escuridão', qty:2},
    ]
  },
  'Elixir de Defesa': {
    note: 'Craftado via Alquimia no Utensílio de Alquimia.',
    children: [
      {name:'Reagente Líquido Limpo', qty:1},
      {name:'Seiva de Freixo', qty:6},
      {name:'Sangue de Veado, Ovelha, Porco, Waragon, Boi, Lhama ou Cabra', qty:5, source:'Coleta de Fluidos do animal escolhido usando um Coletor de Fluidos.'},
      {name:'Água Purificada', qty:3},
    ]
  },
  'Elixir de Grifo': {
    note: 'Craftado via Alquimia no Utensílio de Alquimia.',
    children: [
      {name:'Garra de Grifo', qty:1},
      {name:'Seiva de Cedro', qty:6},
      {name:'Vestígio da Natureza', qty:3},
      {name:'Água Purificada', qty:3},
      {name:'Sangue do Pecador', qty:2},
    ]
  },
  'Elixir de Edania': {
    note: 'Craftado via Alquimia Hábil 1+ no Utensílio de Alquimia.',
    children: [
      {name:'Sangue do Pecador', qty:2},
      {name:'Vestígio da Natureza', qty:4},
      {name:'Casca de Árvore Velha', qty:5},
      {name:'Reagente Líquido Limpo', qty:5},
      {name:'Seiva de Árvore de Caphras', qty:6},
    ]
  },
  'Óleo do Encanto': {
    note: 'Craftado via Alquimia (Habilidoso 1+) no Utensílio de Alquimia.',
    children: [
      {name:'Fruto da Natureza', qty:1},
      {name:'Reagente de Delotia Purificado', qty:1},
      {name:'Água Purificada', qty:2},
      {name:'Erva Eterna', qty:2},
      {name:'Sangue de Turo Rígido', qty:2},
    ]
  },

  'Pó de Olivina Mágico': {
    note: 'Obtido por Processamento (L) — Moagem.',
    children: [
      {name:'Olivina Bruta', qty:1, source:'Obtida em Edania: Interior; também disponível no Mercado Central.'},
      {name:'Reagente em pó Puro', qty:1, source:'Alquimia (Novato 1+): Açúcar ×1 + Azaleia Real Prata ×1 + Água Purificada ×1 + Erva Daninha ×1.'},
    ]
  },

  // --- Rotas de Imortalidade usadas como componente em produção em massa ---
  'Imortalidade: Perfume do Desejo': {
    note: 'Alquimia Simples (Processamento L). Produção em massa: 10 unidades.',
    children: [
      {name:'Imortalidade: Perfume de Coragem', qty:1},
      {name:'Pó Brilhante', qty:3},
      {name:'Essência de Caphras', qty:10},
    ]
  },
  'Imortalidade: Perfume da Perseverança': {
    note: 'Alquimia Simples (Processamento L). Produção em massa: 10 unidades.',
    children: [
      {name:'Imortalidade: Perfume do Mar Profundo', qty:1},
      {name:'Pó Brilhante', qty:3},
      {name:'Essência de Caphras', qty:10},
    ]
  },
  'Imortalidade: Perfume de Espírito da Respiração': {
    note: 'Produção em massa por Alquimia Simples.',
    children: [
      {name:'Imortalidade: Perfume de Espírito', qty:1},
      {name:'Respiro de Jade Estelar', qty:1},
    ]
  },
  'Imortalidade: Perfume de Espírito': {
    note: 'Alquimia Simples (Processamento L).',
    children: [
      {name:'Óleo da Imortalidade Decadente', qty:6},
      {name:'Perfume de Espírito', qty:1},
    ]
  },
  'Imortalidade: Perfume de Coragem': {
    note: 'Alquimia Simples (Processamento L).',
    children: [
      {name:'Óleo da Imortalidade Decadente', qty:6},
      {name:'Perfume de Coragem', qty:1},
    ]
  },
  'Imortalidade: Perfume do Mar Profundo': {
    note: 'Alquimia Simples (Processamento L).',
    children: [
      {name:'Óleo da Imortalidade Decadente', qty:6},
      {name:'Perfume do Mar Profundo', qty:1},
    ]
  },
'Garae-Tteok': {
    note:'Culinária (Aprendiz 1+) no Utensílio de Culinária.',
    children:[
      {name:'Farinha de Arroz', qty:5},
      {name:'Sal', qty:1, source:'Comprável de Vendedor de Bens Gerais ou obtido por evaporação de Água do Mar.'},
      {name:'Água Mineral', qty:1},
    ]
  },
'Farinha de Arroz': {
    note:'Processamento (L) — Moagem. O resultado é de 1–4 Farinhas de Arroz por processamento.',
    children:[
      {name:'Arroz', qty:1, source:'Cultivo/produção de Arroz ou compra no Mercado Central.'},
    ]
  },

  // --- Estrela de Nostos: os 6 componentes superiores (Alquimia Simples) ---
  'Cristal da Terra': {
    note:'Craftado via Alquimia Simples (Processamento, tecla L).',
    children:[
      {name:'Fragmento da Terra Rachada', qty:1000, source:'Coleta de enxada — material raro da Coleta.'},
      {name:'Essência da Natureza', qty:100},
    ]
  },
  'Árvore do Tempo': {
    note:'Craftado via Alquimia Simples (Processamento, tecla L).',
    children:[
      {name:'Fragmento de Árvore Seca', qty:1000, source:'Cortar Lenha — material raro da Coleta.'},
      {name:'Essência da Natureza', qty:100},
    ]
  },
  'Essência da Vida': {
    note:'Craftado via Alquimia Simples (Processamento, tecla L).',
    children:[
      {name:'Essência da Vida Translúcida', qty:1000, source:'Coletor de Fluidos — material raro da Coleta.'},
      {name:'Essência da Natureza', qty:100},
    ]
  },
  'Cristal do Minério': {
    note:'Craftado via Alquimia Simples (Processamento, tecla L).',
    children:[
      {name:'Fragmento de Minério Opaco', qty:1000, source:'Coleta de Mineração — material raro da Coleta.'},
      {name:'Essência da Natureza', qty:100},
    ]
  },
  'Alma Selvagem': {
    note:'Craftado via Alquimia Simples (Processamento, tecla L).',
    children:[
      {name:'Alma Selvagem Esmaecida', qty:1000, source:'Coleta de Abate — material raro obtido ao abater animais.'},
      {name:'Essência da Natureza', qty:100},
    ]
  },
  'Pele da Essência da Natureza': {
    note:'Craftado via Alquimia Simples (Processamento, tecla L).',
    children:[
      {name:'Pele de Natureza Desbotada', qty:1000, source:'Coleta de Curtimento — material raro obtido ao curtir.'},
      {name:'Essência da Natureza', qty:100},
    ]
  },
  'Fruto da Natureza': 'Cultivo em Horta — obtido com chance ao cultivar plantas; também pode ser obtido por fontes especiais de cultivo.',
  'Cogumelo Vidente': 'Produzido em Colina Ehwaz e Penhasco Costeiro; também pode ser coletado manualmente ou com Enxada.',
  'Brilho com um desenho': 'Obtido com chance em Baú de Tesouro de Marinheiro, através da cadeia do Mapa do Tesouro de um Marinheiro Desconhecido e da missão de tesouro em Ratt.',
  'Essência da Natureza': {
    note:'Craftado via Alquimia (Aprendiz 1+) no Utensílio de Alquimia.',
    children:[
      {name:'Fruto da Natureza', qty:2, source:'Cultivo na Horta — obtido através do cultivo.'},
      {name:'Seiva de Bordo', qty:4, source:'Coleta de Fluidos em Bordo com um Coletor de Fluidos; também pode ser obtida por Nó de Produção de Cortar Lenha.'},
      {name:'Vestígio da Natureza', qty:2, source:'Escavação em Nós de Produção — obtido por trabalhadores em nós de produção apropriados.'},
      {name:'Cogumelo Vidente', qty:3, source:'Produzido em Colina Ehwaz e Penhasco Costeiro; também pode ser coletado manualmente ou com Enxada.'},
    ]
  },
  'Creme': {
    note: 'Processamento (Agitação): 1 Leite + 1 Açúcar. Produz 1–4 Creme.',
    children: [
      {name:'Leite', qty:1},
      {name:'Açúcar', qty:1},
    ]
  },
  'Carne Moída de Pássaro': {
    note: 'Processamento (Moagem): 3 Frango. Produz 1–4 Carne Moída de Pássaro.',
    children: [
      {name:'Frango', qty:3},
    ]
  },
  'Massa de Milho': {
    note: 'Processamento (Agitação).',
    children: [
      {name:'Farinha de Milho', qty:1},
      {name:'Água Mineral', qty:1},
    ]
  },
};

const LEAF_SOURCES = {

  'Elixir Perfeito de Caça a Humano': 'Produto adicional obtido ao produzir Elixir de Caça a Humano com Alquimia Profissional Nv. 1 ou superior.',
  'Elixir da Vontade Extraordinária': 'Produto adicional obtido ao produzir Elixir da Vontade com Alquimia Hábil Nv. 1 ou superior.',
  'Elixir de Caça a Humanoide Feroz': 'Produto adicional obtido ao produzir Elixir de Caça a Humanoide com Alquimia Profissional Nv. 1 ou superior.',
  'Elixir de Edania Poderoso': 'Produto adicional obtido ao produzir Elixir de Edania com Alquimia Artesão Nv. 1 ou superior.',
  'Elixir da Destruição Fatal': 'Produto adicional obtido ao produzir Elixir da Destruição com Alquimia Artesão Nv. 1 ou superior.',
  'Elixir de Perfuração Brutal': 'Obtido por Alquimia Simples: 3 Elixires de Perfuração + 1 Reagente Azul.',
  'Elixir da Fúria Infinita': 'Produto adicional obtido ao produzir Elixir de Fúria com Alquimia Hábil Nv. 1 ou superior.',
  '[Mistura] Elixir do Ceifador & Experiência': 'Obtido por Alquimia Simples combinando Elixir do Ceifador e Elixir de Experiência, conforme a receita de produção do Fármaco da Fera.',
  '[Mistura] Elixir de Feitiço & Vento & Rapidez': 'Obtido por Alquimia Simples combinando os elixires indicados, conforme a receita de produção do Fármaco da Fera.',
  'Elixir de Espírito Weenie Afluente': 'Obtido por Alquimia Simples com 3 Elixires de Espírito Weenie + 1 Reagente Azul.',
  'Flor Lilás': 'Obtida por cultivo em Horta; pode ser obtida a partir de sementes de flores e também por coleta em áreas apropriadas.',
  'Flor Amarela': 'Obtida por cultivo em Horta; pode ser obtida a partir de sementes de flores e também por coleta em áreas apropriadas.',
  'Flor Azul': 'Obtida por cultivo em Horta; pode ser obtida a partir de sementes de flores e também por coleta em áreas apropriadas.',
  'Flor de Ameixa Colorida': 'Pode ser comprada por 50 moedas de prata com os NPCs Wolim, Maksoon ou Ahryung.',
  'Acelga': 'Obtida por cultivo em Horta; disponível a partir de sementes de Acelga.',
  'Acelga Especial': 'Pode ser obtida ao colher a plantação de Acelga Especial a partir de Sementes de Acelga de Alta Qualidade.',
  'Carne de Baleia Rei': 'Obtida por Caça de Baleia-Rei, coletando o cadáver com ferramenta de açougueiro após o abate.',
  'Chá Sute Saudável': 'Produto adicional obtido ao preparar Chá Sute; pode substituir 3 unidades de Chá Sute nas receitas que aceitam a variante de qualidade.',
  'Refeição Especial de Balenos': 'Produto adicional obtido ao preparar Refeição de Balenos; pode substituir 3 unidades de Refeição de Balenos nas receitas que aceitam a variante de qualidade.',
  'Carne de Crocodilo': 'Obtida ao abater crocodilos; pode ser coletada do cadáver com Faca de Açougueiro.',
  'Chá com Cheiro Forte': 'Produto adicional ao cozinhar Chá com Aroma Fino com Culinária Hábil 9 ou superior.',
  'Cogumelo Sanghwang': 'Pode ser coletado com as mãos ou com Enxada; também pode ser produzido no Caminho da Peregrinação Final.',
  'Massa de Milho': 'Processamento (Agitação): Farinha de Milho + Água Mineral.',
  'Molho': 'Comprado de Vendedor de Ingredientes de Culinária quando vendido como molho; quando a receita indicar Molho como grupo, usar o molho compatível daquele grupo.',
  'Pão de Teff Esponjoso': 'Produto adicional aleatório ao produzir Pão de Teff: 1–2 unidades, conforme a receita do Codex.',
  'Rosa': 'Coleta manual das rosas que crescem próximas às plantações.',
  'Refeição de Mediah Especial': 'Produto adicional raro ao cozinhar Refeição de Mediah com Culinária Artesão Nv. 1 ou superior; substitui 3 Refeições de Mediah na receita de Refeição Energética de Cron.',
  'Lagosta Dourada Grelhada na Manteiga': 'Produto adicional raro ao cozinhar Lagosta Assada em Manteiga com Culinária Artesão Nv. 1 ou superior; pode substituir a Lagosta Assada em Manteiga na receita de Prato Especial de Frutos do Mar de Margoria.',
  'Açúcar Mascavo': 'Compra com Vendedor de Ingredientes.',
  'Ensopado de Cobra Freekeh Forte': 'Obtido como produto adicional ao cozinhar Ensopado de Cobra Freekeh com Culinária Profissional Nv. 1 ou superior.',
  'Aveia Refinada': 'Obtida como produto adicional ao cozinhar Aveia com Culinária Hábil Nv. 9 ou superior.' ,
  'Vinho Gastronômico': 'Compra com Vendedor de Ingredientes.',
  'Água Límpida': 'Obtida de Rio, Fonte ou Poço com Garrafa de Água; também pode ser comprada conforme o vendedor.',
  'Licor de Mel': 'Produzido com Utensílio de Culinária em residência; a receita correspondente é expandida na cascata.',
  'Licor de Mel Picante': 'Produzido com Utensílio de Culinária em residência; a receita correspondente é expandida na cascata.',
  'Carne de Lagarto': 'Obtida por caça de Lagartos.',
  'Lula': 'Obtida por pesca; também pode ser comprada no Mercado Central.',
  'Pássaro Frito': 'Produzido com Utensílio de Culinária em residência, usando a receita correspondente; consulte a sub-receita para os materiais e nível exigidos.',
  'Yuzu': 'Coleta manual na Árvore de Yuzu.',
  'Macarrão com Carne': 'Produzido com Utensílio de Culinária em residência, usando a receita correspondente; consulte a sub-receita para os materiais e nível exigidos.',
  'Sorbet de Frutas': 'Produzido com Utensílio de Culinária em residência, usando a receita correspondente; consulte a sub-receita para os materiais e nível exigidos.',
  'Makgeolli de Cogumelo Sanghwang': 'Produzido com Utensílio de Culinária em residência, usando a receita correspondente; consulte a sub-receita para os materiais e nível exigidos.',
  'Cogumelo Vidente': 'Produzido em Colina Ehwaz e Penhasco Costeiro; também pode ser coletado manualmente ou com Enxada.',
  'Sangue de Cervo': 'Coleta de Fluidos de cervo usando um Coletor de Fluidos.',
  'Sangue de Ovelha': 'Coleta de Fluidos de ovelha usando um Coletor de Fluidos.',
  'Sangue de Boi': 'Coleta de Fluidos de boi usando um Coletor de Fluidos.',
  'Sangue de Waragon': 'Coleta de Fluidos de Waragon usando um Coletor de Fluidos.',
  'Sangue de Lhama': 'Coleta de Fluidos de lhama usando um Coletor de Fluidos.',
  'Sangue de Cabra': 'Coleta de Fluidos de cabra usando um Coletor de Fluidos.',
  'Trufa': 'Coleta manual ou com Enxada; também pode ser obtida por cultivo.',
  'Catalisador Mágico Concentrado': 'Compra por 10.000.000 de Moedas de Prata na Loja Lua Minguante; também pode ser obtido pela troca de 10 Catalisadores Mágicos por 1 Catalisador Mágico Concentrado.',
  'Sangue de Guaxinim': 'Coleta de Fluidos de guaxinim usando um Coletor de Fluidos.',
  'Sangue de Macaco': 'Coleta de Fluidos de macaco usando um Coletor de Fluidos.',
  'Sangue de Doninha': 'Coleta de Fluidos de doninha usando um Coletor de Fluidos.',
  'Sangue de Escorpião': 'Coleta de Fluidos de escorpião usando um Coletor de Fluidos.',
  'Sangue de Marmota': 'Coleta de Fluidos de marmota usando um Coletor de Fluidos.',
  // Perfumes — fontes conferidas no BDO Codex PT-BR.
  'Olivina Bruta': 'Obtida em Edania: Interior; também pode ser negociada no Mercado Central.',
  'Reagente em pó Puro': 'Produzido por Alquimia (Novato 1+): Açúcar ×1 + Azaleia Real Prata ×1 + Água Purificada ×1 + Grama Selvagem ×1 ou Erva Daninha ×1.',
  'Erva Daninha': 'Coleta manual em arbustos e ervas selvagens; também pode ser obtida com Enxada.',
  'Cogumelo Nevoeiro': 'Coleta de cogumelos com as mãos ou Enxada; também pode ser cultivado em Fazenda.',

  // Rações — fontes conferidas no BDO Codex PT-BR.
  'Cenoura Especial': 'Obtida por cultivo/produção de Cenoura Especial; também pode ser comprada no Mercado Central.',
  'Cenoura de Alta Qualidade': 'Obtida por cultivo/produção de Cenoura de Alta Qualidade; também pode ser comprada no Mercado Central.',
  'Torrão de Açúcar Mascavo': 'Processamento (Aquecimento) de 10 Açúcar Mascavo + 1 Água Mineral.',
  'Canela': 'Coleta na Fazenda Kasula, em Mediah, com as mãos ou enxada.',
  'Cantarilho': 'Obtido por Pesca Comum.',
  'Carne de Boi': 'Obtida ao abater Boi; faz parte do grupo de carnes substituíveis da Culinária.',
  'Farinha de Milho': 'Obtida por Processamento (Moagem) de Milho.',
  'Farinha de Trigo': 'Obtida por Processamento (Moagem) de Trigo ou outro cereal compatível.',
  'Frango': 'Produção em Fazenda de Galinhas ou compra no Mercado Central.',
  // Itens Tesouro — Essência Espiritual de Ornette/Odore (peças de missão)
  'Água Eterna': 'Dada pela NPC Merindora (Espírito Mais Velho), em Grana, ao entregar/possuir uma das peças raras (Sherekhan, Ron ou Kagtunak para Ornette; Nakk, Makhtanan ou Valtarra para Odore).',
  'Cápsula de Sherakhan': 'Loot raro ao caçar monstros em Sherekhan Necropolis, Drieghan (recomendado 210+ AP).',
  'Kagtunak da Meia-Lua Cinzenta': 'Loot raro ao caçar monstros em Blood Wolf Settlement, Drieghan (recomendado 190+ AP).',
  'Espiritualidade de Ron': 'Loot raro ao caçar monstros em Tooth Fairy Forest, Kamasylvia (recomendado 240+ AP).',
  'Pedra do Som do Espírito Musical': 'Troca de 300 Folhas de Peridoto com o NPC Moyamo (Gerente do Nó de Okiara River, Kamasylvia).',
  'Pedra da Coragem de Gayak': 'Troca de 30 Escamas de Garmoth com o NPC Camira (Gerente do Nó de Sherekhan Necropolis, Drieghan).',
  'Lágrima Vermelha de Nakk': 'Loot raro ao derrotar Xamã Manshaum ou Grande Guerreiro Manshaum, em Manshaum Forest, Kamasylvia (recomendado 240+ AP).',
  'Glândula de Veneno de Makhtanan': 'Loot raro ao derrotar Guardião das Folhas, Guardião da Vinha ou Guardião do Bosque, em Tshira Ruins, Drieghan (recomendado 140+ AP).',
  'Semblante de Valtarra': 'Curtimento (faca de curtir equipada) de Ferrica, Ferrina, Elefante Belladonna ou Filhote de Elefante Belladonna, em Navarn Steppe.',
  'Pedra do Amanhecer do Corvo Noturno': 'Troca de 100 Fósseis de Escama de Dragão com o NPC Altar Sinistro (Gerente do Nó de Garmoth\'s Nest, Drieghan).',
  'Pedra do Guardião Krogdalo': 'Troca de 100 Fragmentos de Terra Tremendo com o NPC Krogdalo\'s Trace (Gerente do Nó de Krogdalo\'s Trace, Kamasylvia).',

  // Culinária Especial — fontes de ingredientes confirmadas/descritas por método.
  'Carne de Tigre': 'Obtida ao caçar Tigres na região de O\'dillita.',
  'Cogumelo Ganoderma': 'Coleta de cogumelos ou cultivo em Fazenda.',
  'Jujuba': 'Comprada do Vendedor de Frutas da Terra do Amanhecer ou obtida por cultivo; também pode ser obtida por trabalhadores quando houver nó correspondente.',
  'Carne Pulsante': 'Obtida de criaturas específicas por coleta/abate; também pode ser encontrada no Mercado Central.',
  'Carne de Porco': 'Obtida por coleta de carne de porco ou compra no Mercado Central.',
  'Água Mineral': 'Comprável de Vendedor de Bens Gerais; também obtida em fontes/poços.',
  'Água de Nascente': 'Nome incorreto/antigo no projeto — a receita usa Água Mineral, comprável de Vendedor de Culinária/Estalajadeiro.',
  'Ovo': 'Produção em Fazenda de Galinhas ou compra no Mercado Central.',
  'Arroz Estranho e Magnífico': 'Colhido da Semente de Arroz Estranho e Magnífico, obtida com probabilidade definida durante o cultivo de Semente de Arroz.',
  'Garae-Tteok': 'Produzido no Utensílio de Culinária com 5 Farinha de Arroz, 1 Sal e 1 Água Mineral.',
  'Farinha de Arroz': 'Obtida por Moagem de Arroz; cada processamento rende de 1 a 4 unidades.',
  'Arroz Cozido': 'Culinária (Aprendiz 6+) com 5 Arroz e 2 Água de Primavera.',
  'Alho': 'Cultivo em Fazenda, coleta ou compra no Mercado Central.',
  'Folha de Ansarina-Branca': 'Coleta/produção de ervas e cultivo; também disponível no Mercado Central.',
  'Samambaia': 'Coleta de Samambaia ou cultivo/produção conforme as fontes de coleta do jogo.',
  'Pó de Pimenta': 'Processamento de Pimenta por Moagem.',
  'Ameixa Irisada': 'Obtida com probabilidade definida ao coletar Ameixa na Terra do Amanhecer.',
  'Ameixa': 'Obtida por coleta/cultivo de Ameixeira na Terra do Amanhecer.',
  'Fermento': 'Comprável de Vendedores de Comida ou Estalajadeiros.',
  'Farinha de Trigo': 'Obtida por Moagem de Trigo ou outro cereal compatível.',
  'Maçã': 'Obtida por cultivo/coleta de frutas ou compra de Vendedor de Frutas.',
  'Fruta': 'Obtida por cultivo/coleta de frutas ou compra de Vendedor de Frutas/Ingredientes.',
  'Arroz': 'Obtido por cultivo/produção de Arroz ou compra no Mercado Central.',
  'Água de Primavera': 'Comprável de Vendedor de Bens Gerais.',
  'Acelga de Alta Qualidade': 'Produzida por cultivo de Acelga; também pode ser adquirida no Mercado Central.',
  'Rabanete': 'Cultivo em Fazenda ou compra no Mercado Central.',
  'Vestígio da Natureza': 'Escavação em Nós de Produção (ex: Fazenda Bernianto, Toco da Árvore Rhua) — requer o nó ativado',
  'Pedra da Luz do Fogo: Raiva': 'Loot ao derrotar monstros (Fendas Sombrias, Chefes de Mundo/Guilda) — cai aleatoriamente entre os tipos de Pedra da Luz; também comprável no Mercado Central',
  'Pedra da Luz do Fogo: Alvo': 'Loot ao derrotar monstros (Fendas Sombrias, Chefes de Mundo/Guilda) — cai aleatoriamente entre os tipos de Pedra da Luz; também comprável no Mercado Central',
  'Pedra da Luz da Terra: Parede de Ferro': 'Loot ao derrotar monstros (Fendas Sombrias, Chefes de Mundo/Guilda) — cai aleatoriamente entre os tipos de Pedra da Luz; também comprável no Mercado Central',
  'Pedra da Luz da Terra: Onda': 'Loot ao derrotar monstros (Fendas Sombrias, Chefes de Mundo/Guilda) — cai aleatoriamente entre os tipos de Pedra da Luz; também comprável no Mercado Central',
  'Pedra da Luz do Vento: Coração': 'Loot ao derrotar monstros (Fendas Sombrias, Chefes de Mundo/Guilda) — cai aleatoriamente entre os tipos de Pedra da Luz; também comprável no Mercado Central',
  'Pedra da Luz da Grama Incompleta': 'Loot ao derrotar monstros — cai aleatoriamente entre os tipos de Pedra da Luz; também comprável no Mercado Central',
  'Seiva de Árvore-Anel': 'Coleta de Fluidos em Árvore Louca (chance de ~75%); também via Nó de Exploração (Corte)',
  'Essência de Árvore Morta': 'Corte de Árvore de Musgo Seca, ou Coleta de Fluidos em Árvore Louca/de Musgo — chance rara',
  'Essência de Delotia': 'Coleta (mãos ou enxada) em arbustos de Delotia, em O\'dyllita — chance rara',
  'Essência da Perspicácia': 'Loot raro ao derrotar monstros',
  'Galho de Monge': 'Obtido ao Cortar árvores ou por trabalhador em Nós de Produção.',
  'Restos de Criatura Mística': 'Troca com a NPC Dalishain (Alquimista Errante) usando Mobília Empalhada ou Mobília com Fôlego, obtidas na Caça',
  'Pergaminho Misterioso': 'Compra do NPC Negociante de Móveis, em qualquer cidade (10.000.000 de Silver)',
  'Cristal Mágico de Pedra de Luz': 'Troca de Pedras da Luz indesejadas com a NPC Dalishain (Alquimista Errante), nas principais cidades',
  'Pó de Pedra Negra': 'Processamento (Fundir) de Pedra Bruta, ou moagem de Cristais Mágicos; também comprável no Mercado Central',
  'Couro Supremo': 'Loot ao caçar e abater animais selvagens (Vida de Caça) — item raro, chance maior com Maestria de Caça alta (901+); também trocável com caçadores NPC (Chuck Laurie / Roussea) entregando peles de grau inferior',
  'Tempero de Cron Ancestral': 'Compra com Vendedor de Culinária ou Dono da Taverna.',
  'Molho Base': 'Compra do Vendedor de Comida ou do Estalajadeiro, em qualquer cidade',
  'Folha de Espírito': 'Corte de árvores (Lumbering) — chance rara; também via Nó de Exploração (Corte)',
  'Coral de Rusalka': 'Coleta após derrotar Caranguejos-de-Costa-de-Pedra Coralinos, em Edania',
  'Pó Brilhante': 'Chance aleatória ao completar receitas de Alquimia (Habilidoso+) com sucesso — subproduto',
  'Essência de Caphras': 'Corte (Lumbering) ou Coleta de Fluido na Árvore de Caphras',
  'Seiva de Cedro Branco': 'Coleta com Coletor de Fluidos em Cedros Brancos (chance de ~75%)',
  'Cristal de Coral': 'Coleta subaquática com Enxada, ou loot ao derrotar Monstros Marinhos',
  'Cogumelo Flecha': 'Coleta (mãos ou enxada) em montanhas de Serendia, Balenos e Calpheon; também produzido em nó na Floresta do Saque',
  'Fruta do Mar Profundo': 'Coleta subaquática — chance rara ao coletar no mar aberto',
  'Pó do Tempo': 'Coleta (Mineração) — pequena chance ao minerar rochas',
  'Laço de Árvore Sangrenta': 'Corte de árvores (Lumbering) — chance rara; também via Nó de Produção (Floresta Treant, Área de Descanso do Lenhador)',
  'Óleo de Baleia Rei': 'Obtido ao caçar e abater Baleias-Rei (Caça).',
  'Laço de Árvore Sangrenta': 'Corte de árvores (Lumbering) — chance rara; também via Nó de Produção (Floresta Treant, Terras Devastadas de Stonetail)',
  'Pele de Khalk Fujão': 'Loot ao caçar e abater um Khalk Fugitivo',
  'Fruto da Natureza': 'Cultivo em Horta — obtido com chance ao cultivar plantas; também pode ser obtido por fontes especiais de cultivo.',
  'Sangue de Veado': 'Loot ao caçar veados',
  'Pó de Escuridão': 'Mineração (chance pequena ao minerar com picareta) em nós de Minério de Ferro (ex: Caverna Costeira); também via escavação de trabalhador em minas',
  'Pó de Chama': 'Mineração (chance pequena ao minerar com picareta) em nós de Cobre (ex: Caverna Costeira); também via escavação de trabalhador em minas',
  'Fruto da Natureza': 'Chance de bônus ao cultivar Cevada, Cenoura, Batata-semente ou Batata-doce na Fazenda',
  'Pó de Rachadura': 'Mineração (chance pequena ao minerar rochas com picareta)',
  'Caroço de Árvore Vermelha': 'Obtido por coleta ao cortar árvores; também pode ser obtido por nós/atividades de coleta e negociado no Mercado Central.',
  'Erva Eterna': 'Coleta de ervas selvagens (mãos ou enxada) — chance rara',
  'Lágrima de Lua do Anoitecer': 'Compra com o Gerente da Lua Minguante (Clow, Stee, Lajee ou Jak) nas grandes cidades.',
  'Flor de Escama de Fogo': 'Coleta Manual ou com Enxada em Ervas Selvagens; também pode ser cultivada a partir de sua semente.',
  'Pó de Delotia': 'Moagem (Processamento) da erva Delotia, coletada com mãos ou enxada em O\'dyllita',
  'Seiva de Espinheiro': 'Coleta de Fluidos em árvores Thornwood; também via Nó de Exploração (Corte)',
  'Sangue de Turo Rígido': 'Obtido com baixa probabilidade através de combates na região de O\'dyllita.',
  'Sangue de Raposa': 'Coleta de Fluidos de raposas usando um Coletor de Fluidos.',
  'Poção de HP (Pequena)': 'Comprável do Vendedor de Bens Gerais.',
  'Poção de HP (P)': 'Comprável do Vendedor de Bens Gerais; também pode ser obtida por Processamento de poções menores conforme a receita do jogo.',
  'Poção de MP (P)': 'Comprável do Vendedor de Bens Gerais; também pode ser obtida por Processamento de poções menores conforme a receita do jogo.',
  'Tendão de Baleia Azul': 'Obtido ao caçar uma Baleia-Azul e cortar/esquartejar o corpo da baleia.',
  'Azaleia Real Prata': 'Coleta de ervas selvagens (mãos ou enxada), na Planície Norte de Serendia ou Ruínas da Fazenda Lynch; também cultivável',
  'Cogumelo Adivinho': 'Coleta (mãos ou enxada) em florestas — chance de bônus',
  'Seiva de Bordo': 'Coleta de Fluidos em Bordos (chance de ~75%)',
  'Fruta da Abundância': 'Chance de bônus ao cultivar determinada plantação na Fazenda',
  'Casca de Árvore Velha': 'Corte de árvores (Lumbering) — chance rara',
  'Seiva de Cedro Nevado': 'Obtida por Coleta de Fluidos em Cedros Nevados.',
  'Seiva de Cedro': 'Coleta de Fluidos em Cedros (chance de ~75%)',
  'Vestígio de Batalha': 'Loot ao derrotar monstros em zonas de combate específicas',
  'Cogumelo Fantasma': 'Produzido na Caverna Marie; coleta manual ou com Enxada.',
  'Cogumelo Anão': 'Produzido no Pântano do Norte; coleta manual ou com Enxada.',
  'Seiva de Freixo': 'Obtida por Coleta de Fluidos em Freixos.',
  'Seiva de Freixo': 'Coleta de Fluidos em Freixos usando Coletor de Fluidos; também pode ser obtida por nós de produção de madeira.',
  'Sangue de Porco': 'Extração de sangue de Porcos usando Coletor de Fluidos após abate/coleta.',
  'Sangue da Fera Lendária': 'Produzido com Ferramenta de Alquimia: Reagente em Pó Puro x1 + Sangue de Lagarto x2 + Vestígio da Natureza x1 + Folha de Espírito x1.',

  'Cogumelo Tigre': 'Coleta (mãos ou enxada) em florestas — chance de bônus',
  'Cogumelo Blefista': 'Obtido por coleta.',
  'Seiva de Pinheiro': 'Coleta de Fluidos em Pinheiros (chance de ~75%)',
  'Sangue de Urso': 'Coleta de Fluidos de ursos usando um Coletor de Fluidos.',
  'Essência do Abismo': 'Obtida ao eliminar monstros das Ruínas Submarinas Sikraia.',
  'Seiva de Abeto': 'Coleta de Fluidos em Abetos (chance de ~75%)',
  'Seiva de Árvore Musgosa': 'Coleta de Fluidos em Árvores com Musgo (chance de ~75%)',
  'Cogumelo Azul': 'Coleta (mãos ou enxada) em florestas — chance de bônus',
  'Flor Celestial': 'Coleta de flores silvestres (mãos ou enxada) — chance de bônus',
  'Cogumelo Vulcão': 'Coleta (mãos ou enxada) em zonas vulcânicas — chance de bônus',
  'Malva': 'Coleta de flores silvestres (mãos ou enxada) — chance de bônus',
  'Seiva de Tuia': 'Coleta de Fluidos em Tuias (chance de ~75%)',
  'Cogumelo Céu': 'Coleta (mãos ou enxada) em florestas — chance de bônus',
  'Planta Juba de Leão': 'Coleta de grama (mãos ou enxada) — chance de bônus',
  'Catalisador Mágico': 'Comprável por 1.000.000 de Moedas de Prata com os gerentes da Lua Minguante em cada cidade.',
  'Coração dos Turos': 'Obtido como espólio ao derrotar Ulutuka em Tunkta (O\'dyllita).',
  'Vestígio do Espírito Queimado': 'Obtido através da coleta de Delotia.',
  'Pó da Terra': 'Mineração (chance pequena ao minerar com picareta); também via escavação de trabalhador em minas',
  'Cogumelo Nuvem': 'Coleta (mãos ou enxada) em florestas — chance de bônus',
  'Cogumelo Amanita': 'Coleta (mãos ou enxada) em florestas — chance de bônus',
  'Cogumelo Ancestral': 'Coleta (mãos ou enxada) em florestas — chance de bônus',
  'Cogumelo Corcunda': 'Coleta (mãos ou enxada) em florestas — chance de bônus',
  'Cogumelo Imperador': 'Coleta (mãos ou enxada) em florestas — chance de bônus',
  'Seiva de Bétula': 'Coleta de Fluidos em Bétulas (chance de ~75%)',
  'Flor de Escama de Fogo': 'Coleta de flores silvestres, como Flor de Escama de Fogo, usando as mãos ou uma Enxada.',
  'Garra de Grifo': 'Loot ao derrotar Grifos, em Kamasylvia',
  'Seiva de Árvore de Caphras': 'Coleta de Fluidos na Árvore de Caphras (chance de ~75%)',
  'Água Purificada': 'Processamento (Filtragem) de Água de Rio engarrafada.',
  'Reagente Líquido Limpo': 'Alquimia (Novato 1+) no Utensílio de Alquimia',
  'Respiro de Jade Estelar': 'Recompensa do Presente de Erethea; também negociável no Mercado Central',
  'Essência de Ibellab': 'Comprar com Vendedor de Materiais de qualquer aldeia ou com Clow, Gerente da Lua Minguante, em Velia.',
  'Óleo da Imortalidade Decadente': 'Alquimia: Coração dos Turos x1 + Vestígio do Espírito Queimado x1 + Óleo de Regeneração x20 + Óleo de Coragem x20 + Óleo da Corrupção x20',

  // Trabalhadores energia — fontes dos ingredientes das receitas.
  'Grão': 'Pode usar Trigo, Cevada, Batata, Milho ou Batata-doce; obtenção por cultivo/produção ou Mercado Central.',
  'Açúcar': 'Comprável de Vendedores de Comida ou Estalajadeiros.',
  'Frango': 'Produção em Fazenda de Galinhas ou compra no Mercado Central.',
  'Óleo para Fritura': 'Produzido por Alquimia; também pode ser comprado no Mercado Central.',
  'Sal': 'Comprável de Vendedores de Comida ou Estalajadeiros.',
  'Vinho para Cozinha': 'Comprável de Vendedores de Comida ou Estalajadeiros.',
  'Farinha de Grão': 'Obtida por Moagem de grãos como Trigo, Cevada, Batata, Milho ou Batata-doce.',
  'Leite': 'Obtido por ordenha de vacas em Fazenda ou por minijogo de ordenha.',
  'Mel de Cozinha': 'Produzido por trabalhadores em Nós de Produção de Colmeia ou comprado no Mercado Central.',
  'Cebola': 'Cultivo em Fazenda ou compra no Mercado Central.',
  'Peixe Seco': 'Obtido por Secagem de peixe; também pode ser comprado no Mercado Central.',
  'Molho Branco': 'Culinária (Novato 1+) com 1 Molho Base, 1 Maçã, 1 Leite e 2 Vinho para Cozinha.',
  'Freekeh': 'Cultivo em Fazenda ou compra no Mercado Central.',
  'Carne de Cobra': 'Obtida por caça/coleta de Cobras ou compra no Mercado Central.',
  'Anis Estrelar': 'Produção por trabalhadores em nós de cultivo de Anis-Estrelado, como Terras Agrícolas de Shakatu, ou cultivo em Horta; também disponível no Mercado Central.',
  'Queijo': 'Processamento de Leite por Secagem.',
  'Massa de Grão': 'Processamento por Agitação de Farinha de Grão com Água Mineral.',
  'Manteiga': 'Processamento por Agitação de Creme com Sal.',

  // O perfume-base já é a receita principal exibida no card.
  // Nas rotas de Imortalidade ele aparece novamente como matéria-prima;
  // nesses casos não deve ser tratado como item sem fonte.

  // Itens Tesouro — fontes confirmadas/revisadas.

  'Peça da Bússola Atualizada — Vodkhan': 'Drop de Vodkhan nas Ruínas de Hystria; também pode aparecer em conteúdos/baús específicos de Aakman e Hystria.',
  'Peça da Bússola Atualizada — Elten': 'Drop de Elten e Tukar Belten nas Ruínas de Hystria; é uma das peças mais raras da bússola.',
  'Peça da Bússola Atualizada — Aakman': 'Drop de Aakman Elite Guardian no Templo de Aakman.',
  'Rubi Sangrento': 'Processamento por Agitação: 7 Rubis Resplandecentes + 3 Polidores de Gemas.',
  'Safira Oceânica': 'Processamento por Agitação: 7 Safiras Resplandecentes + 3 Polidores de Gemas.',
  'Topázio Dourado': 'Processamento por Agitação: 7 Topázios Resplandecentes + 3 Polidores de Gemas.',

  'Peça do Mapa — Tukar': 'Drop na Mina de Enxofre de Roud, associado ao Lava Tukar.',
  'Peça do Mapa — Devourer': 'Drop na Mina de Enxofre de Roud, associado ao Lava Devourer.',
  'Peça do Mapa — Warder': 'Drop na Prisão de Pila Ku, associado ao Iron Fist Warder.',
  'Peça do Mapa — Deportee': 'Drop na Prisão de Pila Ku, associado ao Sordid Deportee.',
  'Rubi de Sangue': 'Processamento por Agitação: 7 Rubis Resplandecentes + 3 Polidores de Gemas.',
  'Esmeralda Florestal': 'Processamento por Agitação: 7 Esmeraldas Resplandecentes + 3 Polidores de Gemas.',

  'Brilho com um desenho': 'Obtido com chance no Baú de Tesouro de um Marinheiro. Cadeia: derrote Crocodilos do Mar para obter o Mapa Coberto de Musgo → use Alquimia Simples com o Removedor de Musgo de Ravinia para revelar os Pedaços de Mapa do Tesouro Rasgado → junte os pedaços em um Mapa do Tesouro de um Marinheiro → complete a missão até o Baú de Tesouro de um Marinheiro.',
  'Moeda de Corvo': 'Moeda de Barganha (Barter) obtida navegando e comercializando com o sistema de Crow\'s Nest.',
  'Flor de Okilua': 'Troca por 1.000 Moedas de Corvo na Loja de Moeda Corvo; também pode vir de Permuta Súbita, Mercadoria Marítima de nível 3 a 5 e Baú de Tesouro de Marinheiro.' ,
  'Lágrimas de Okilua': 'Troca por 100.000 Moedas de Corvo na Loja de Moeda Corvo.' ,

  'Fragmento do Anel de Al Yurad — Floresta de Cinzas': 'Drop raro na Floresta das Cinzas.',
  'Fragmento do Anel de Al Yurad — Ilha de Padix': 'Drop raro na Ilha de Padix, principalmente dos Caçadores de Tesouro Bêbados.',
  'Fragmento do Anel de Al Yurad — Sycraia': 'Drop raro nas Ruínas Submarinas de Sycraia; também pode vir de Fendas Sombrias e baús de Atoraxxion: Sycrakea.',
  'Fragmento do Anel de Al Yurad — Cripta dos Pensamentos em Repouso': 'Drop raro na Cripta dos Pensamentos Adormecidos; também há fontes alternativas relacionadas à caça marítima.',
  'Fragmento do Anel de Al Yurad — Vale de Olun': 'Drop raro no Vale de Olun.',
  'Coral Vermelho': 'Coleta subaquática de corais; também pode vir de alguns sacos de pesca.',
  'Coral Azul': 'Coleta subaquática de corais; também pode vir de alguns sacos de pesca.',
  'Rubi Bruto': 'Mineração de rochas/minérios com Picareta ou nós de mineração.',
  'Rubi': 'Processamento por Moagem de Rubi Bruto.',
  'Rubi Resplandecente': 'Processamento por Moagem de Rubi.',
  'Safira Bruta': 'Mineração de rochas/minérios com Picareta ou nós de mineração.',
  'Safira': 'Processamento por Moagem de Safira Bruta.',
  'Safira Resplandecente': 'Processamento por Moagem de Safira.',
  'Topázio Resplandecente': 'Processamento por Moagem de Topázio.',

  'Fragmento de Luz das Fadas': 'Chance ao entregar um Cavalo Imperial Nível 15+ (Entrega de Cavalo Imperial), principalmente com Cavalos T9/Sonhos.',
  'Lumentrace': 'Chance ao entregar um Cavalo Imperial Nível 15+ (Entrega de Cavalo Imperial), obtido apenas com Corcéis Imperiais adquiridos após a atualização que introduziu esse item.',

  'Peça do Telescópio Reforçado — 1': 'Drop do Tungrad Executioner nas Ruínas de Tungrad.',
  'Peça do Telescópio Reforçado — 2': 'Drop na Cidade dos Mortos e no Retiro do Buscador das Trevas; associado aos monstros dessas áreas.',
  'Peça do Telescópio Reforçado — 3': 'Drop nas Ruínas de Tungrad, Cidade dos Mortos e Retiro do Buscador das Trevas; também pode ser obtida trocando 3 peças de Vodkhan com Ulubala.',
  'Diamante Estelar': 'Processamento por Agitação: 7 Diamantes Resplandecentes + 3 Polidores de Gemas; os diamantes brutos vêm de mineração.',

  'Retiro de Krogdalo': 'Obtido pela linha de missões do Retiro de Krogdalo, ligada aos três Cavalos Míticos: Arduanatt, Diné e Doom.',
  'Lâmpada Flutuante de Remitaronsom': 'Tesouro de Treinamento; sua montagem usa Fragmentos de Luz das Fadas e Rastro de Luz.',
  'Telescópio Reforçado de Lafi Bedmountain': 'Tesouro montado com 3 peças únicas do telescópio, Diamante Estelar e Topázio Dourado.',
  'Mapa de Arqueólogo': 'Tesouro montado com as quatro peças diferentes do mapa e quatro gemas de suporte.',
  'Bússola Atualizada de Lafi Bedmountain': 'Tesouro montado com três peças raras da bússola e três gemas de suporte.',
  'Anel de Comerciante Rico': 'Tesouro montado com cinco fragmentos raros e nove materiais de suporte.',
  'Brilho de Evenruth': 'Tesouro marítimo montado com Brilho com um desenho e Evenruth; também comprável direto por 2.000.000 de Moedas de Corvo.',
  'Estrela de Nostos': 'Tesouro de Coleta montado com seis materiais superiores produzidos a partir de materiais raros de diferentes atividades de Coleta.',

  'Elixir de Fúria': 'Alquimia no Utensílio de Alquimia: 4 Cogumelos Anões, 1 Seiva de Freixo, 4 Sangues de Urso e 3 Águas Purificadas.',
  'Elixir da Concentração': 'Alquimia no Utensílio de Alquimia: Reagente Líquido Limpo, 3 Cogumelos Nuvem, 3 Sangues de Urso e 8 Ervas Daninhas.',
  'Elixir da Defesa': 'Alquimia no Utensílio de Alquimia: Reagente Líquido Limpo, Seiva de Freixo, Sangue de Porco e Água Purificada.',
  'Elixir de Estamina': 'Alquimia no Utensílio de Alquimia; receita de Elixir de Estamina.',
  'Garrafa de Água de Rio': 'Encha uma Garrafa Vazia em um rio; a garrafa vazia é comprada do Vendedor de Materiais.',
  'Erva Aurora': 'Coleta de ervas ou compra com Vendedor de Ervas; também pode ser obtida por nós de coleta.',
  'Grama Selvagem': 'Coleta de grama/ervas ou compra com Vendedor de Ervas.',
  'Sangue de Lobo': 'Extração de sangue de lobos usando Coletor de Fluidos.',
  'Carne (Frango, Ave Kuku ou Flamingo)': 'Açougue: abata e esquarteje Frango, Ave Kuku ou Flamingo.',
  'Vegetal à escolha (Abóbora, Tomate, Repolho, Páprica ou Azeitona)': 'Cultivo/coleta dos vegetais indicados ou compra no Mercado Central.',
  'Carne (qualquer, exceto Lagarto e Frango)': 'Açougue de animais; use qualquer carne compatível com a receita, exceto Lagarto e Frango.',
  'Farinha': 'Processamento (Moagem) de grãos, como Trigo, Milho, Cevada, Batata ou Batata-Doce.',
  'Óleo de Fritura': 'Compra com Vendedor de Ingredientes de Culinária.',
  'Fruta (Maçã ou outra fruta à escolha)': 'Coleta/cultivo de frutas ou compra no Mercado Central; use Maçã ou outra fruta compatível.',
  'Farinha (de Milho ou outro grão)': 'Processamento (Moagem) do grão escolhido.',
  'Molho (Dressing)': 'Compra com Vendedor de Ingredientes de Culinária ou produção por Culinária, conforme a variante usada.',
  'Pimenta': 'Cultivo de Pimenta ou compra no Mercado Central.',
  'Vinagre': 'Produção por Culinária ou compra no Mercado Central.',
  'Fruta (à escolha)': 'Coleta/cultivo de frutas ou compra no Mercado Central.',
  'Noz-moscada': 'Coleta/cultivo da Noz-moscada ou compra no Mercado Central.',
  'Vegetal (Abóbora, Tomate, Repolho ou Páprica)': 'Cultivo/coleta de Abóbora, Tomate, Repolho ou Páprica.',
  'Figo': 'Coleta/cultivo de Figos ou compra no Mercado Central.',
  'Massa de Trigo': 'Processamento (Mistura) de Farinha de Trigo com Água Mineral.',
  'Óleo de Oliva': 'Compra com Vendedor de Ingredientes de Culinária.',
  'Carne de Leão': 'Açougue: abata e esquarteje Leões na região de Valência.',
  'Vegetal (à escolha)': 'Cultivo/coleta de vegetais ou compra no Mercado Central.',
  'Mel': 'Extração de Mel de Colmeias de Abelhas ou compra no Mercado Central.',
  'Massa': 'Processamento (Mistura) de Farinha com Água Mineral.',
  'Farinha de Teff': 'Processamento (Moagem) de Teff.',
  'Tâmara': 'Coleta de Palmeiras de Tâmara na região de Valência ou compra no Mercado Central.',
  'Carne': 'Obtida com Faca de Açougueiro ao abater um animal que forneça carne compatível com a receita; para Bife, a receita específica usa Carne de Porco.',
  'Vinho de Cozinha': 'Compra com Vendedor de Ingredientes de Culinária.',
  'Carne de Lhama': 'Açougue: abata e esquarteje Lhamas.',
  'Pimenta Vermelha': 'Cultivo de Pimenta Vermelha ou compra no Mercado Central.',
  'Carne de Marmota': 'Açougue: abata e esquarteje Marmotas.',
  'Carne de Iaque': 'Açougue: abata e esquarteje Iaque.',
  'Porco': 'Açougue: abata e esquarteje Porcos.',
  'Carne de Escorpião': 'Açougue: abata e esquarteje Escorpiões.',
  'Carne (qualquer, exceto Frango e Flamingo)': 'Açougue de animais; use qualquer carne compatível, exceto Frango e Flamingo.',
  'Pimenta-do-reino': 'Cultivo de Pimenta-do-reino ou compra no Mercado Central.',
  'Sangue de Lagarto': 'Extração de sangue de Lagartos usando Coletor de Fluidos.',
  'Sangue de Raposa': 'Coleta de Fluidos de raposas usando um Coletor de Fluidos.',
  'Reagente Azul': 'Comprável do Vendedor de Materiais (ex: Bartali Farm), por 10.000 Silver.',

  'Prato Especial de Frutos do Mar de Margoria': 'Produzido com Utensílio de Culinária em residência, usando a receita correspondente; consulte a sub-receita para os materiais e nível exigidos.',
  'Salada de Carne de Baleia': 'Culinária; produzida com carne de baleia e ingredientes de cozinha conforme a receita do jogo.',
  'Filé de Peixe Vermelho do Monstro Marinho': 'Obtido ao eliminar Lyngbakr e como recompensa da missão semanal de investigação de Lyngbakr.',
  'Elixir da Maestria': 'Produzido em Alambique com a receita de Elixir da Maestria; consulte a categoria de Alquimia para a cascata completa.',
  'Elixir do Tempo': 'Produzido em Alambique com a receita de Elixir do Tempo; consulte a categoria de Alquimia para a cascata completa.',
  'Elixir de Amizade': 'Produzido em Alambique com a receita de Elixir de Amizade; consulte a categoria de Alquimia para a cascata completa.',
  'Fragmento do Vento Oscilante': 'Troca de Selo de Retribuição Dourado - [Treinamento Imperial] x1 ou Selo de Corrida de Cavalo x2, no Posto de Troca.',
  'Essência do Oceano': 'Obtida ao eliminar Mareta Carente e como recompensa da missão semanal de investigação de Lyngbakr.',


  'Azaleia Real Prata': 'Coleta de ervas (mãos ou Enxada) na Planície Norte de Serendia e Ruínas da Fazenda Lynch; também pode ser cultivada.',
  'Cogumelo Véu-de-noiva': 'Coleta de cogumelos ou cultivo em Fazenda.',
  'Cogumelo Amanita Vinosa': 'Coleta de cogumelos ou cultivo em Fazenda.',
  'Tendão de Baleia Rei': 'Obtido ao caçar e abater Baleias-Rei.',
  'Suspiro da Usurpação': 'Obtido ao derrotar monstros nas regiões de Elvia Calpheon.',
  'Alma Selvagem Esmaecida':'Coleta de Abate — material raro obtido ao abater animais.',
  'Azeite de Oliva':'Comprável do Vendedor de Ingredientes, ou produzido a partir de Azeitona',
  'Essência da Vida Translúcida':'Coletor de Fluidos — material raro da Coleta.',
  'Fragmento da Terra Rachada':'Coleta de enxada — material raro da Coleta.',
  'Fragmento de Minério Opaco':'Coleta de Mineração — material raro da Coleta.',
  'Fragmento de Árvore Seca':'Cortar Lenha — material raro da Coleta.',
  'Pele de Natureza Desbotada':'Coleta de Curtimento — material raro obtido ao curtir.',
  'Repolho':'Cultivo (Fazenda) ou compra do Vendedor de Ingredientes',
  'Sangue de Veado, Ovelha, Porco, Waragon, Boi, Lhama ou Cabra':'Coleta de Fluidos do animal escolhido usando um Coletor de Fluidos.',
  'Linguiça Defumada':'Pode ser obtida como produto adicional ao cozinhar Salsicha Grelhada com Culinária Hábil Nv. 5 ou superior.',
  'Mel para Cozinha de Alta Qualidade':'Atirar em Colmeia com Mosquete e depois Moer a Colmeia obtida; também pode resultar do processamento de Colmeia Selvagem.',
  'Mel de Qualidade Superior':'Atirar em Colmeia com Mosquete e depois Moer a Colmeia obtida; resultado raro do processamento de Colmeia Selvagem.',
  'Pudim Escuro Sangrento':'Pequena chance de obtê-lo ao cozinhar Pudim Escuro com Culinária Profissional Nv. 7 ou superior.',
  'Sal Desidratado ao Sol':'Comprado de Vendedores de Comida ou em Pousadas.',
  'Pimenta-do-Reino':'Cultivo em Horta e produção por trabalhadores, conforme os métodos de obtenção do ingrediente no jogo.',
  'Cogumelo Oriole':'Coleta manual ou com Enxada; também pode ser cultivado conforme os métodos de obtenção do ingrediente no jogo.',
  'Pudim Vermelho de Delotia':'Produzido por Culinária como a variante de qualidade do Pudim de Delotia.',
  'Refogado de Carne e Samambaia':'Produzido com Utensílios Culinários em residência; Culinária Profissional Nv. 1 ou superior.',

  'Colmeia Selvagem':'Obtida ao disparar em uma Colmeia com Mosquete; também é usada como material de Processamento para os tipos de mel.',  'Aloés': 'Coleta manual ou com Enxada na Fazenda Ahto, Mediah.',
  'Amido': 'Processamento (Moagem) de Batata ou outro cereal compatível, conforme o método de obtenção do ingrediente.',
  'Arroz Especial': 'Obtido por cultivo/produção de Arroz Especial; também pode ser comprado no Mercado Central.',
  'Arroz de Alta Qualidade': 'Obtido por cultivo/produção de Arroz de Alta Qualidade; também pode ser comprado no Mercado Central.',
  'Açúcar Bruto': 'Processamento do Açúcar, conforme as receitas de transformação do jogo.',
  'Batata': 'Produzida por trabalhadores em fazendas de Balenos/Serendia ou cultivada em Horta; também disponível no Mercado Central.',
  'Batata Especial': 'Obtida por cultivo de Batata Especial; também disponível no Mercado Central.',
  'Batata de Alta Qualidade': 'Obtida por cultivo de Batata de Alta Qualidade; também disponível no Mercado Central.',
  'Broto de Feijão': 'Produzido por cultivo agrícola e disponível para compra no Mercado Central; a fonte exata pode variar conforme a região/rota de obtenção.',
  'Camarão': 'Coleta com Enxada no mar; também pode ser obtido ao coletar determinados recursos marinhos.',
  'Carne de Ave': 'Obtida ao abater aves. Pode ser substituída por Frango ou outras carnes do grupo de aves.',
  'Carne Moída de Pássaro': 'Processamento (Moagem) de 3 Frango, produzindo 1–4 unidades.',
  'Carne de Baleia Azul': 'Obtida ao caçar e abater Baleia Azul.',
  'Carne de Baleia Macia': 'Obtida como produto da Caça de Baleia; também é negociável no Mercado Central quando disponível.',
  'Carne de Frango': 'Produzida em Fazenda de Galinhas; também pode ser obtida por comércio/mercado conforme disponibilidade.',
  'Carne-Seca Perfumada': 'Processamento (Secagem) da carne correspondente, conforme o grupo de carnes do item.',
  'Chifre de Khalk Fujão': 'Obtido ao caçar e abater Khalk Fugitivo.',
  'Coco': 'Coleta em coqueiros, especialmente na região de Arehaza, ou compra no Mercado Central.',
  'Cogumelo Arco-Íris': 'Coleta manual ou com Enxada.',
  'Coquetel de Coco Gelado': 'Pequena chance de obter ao cozinhar Coquetel de Coco com Culinária Mestre 1+.',
  'Cuscuz Clássico': 'Pequena chance de obter ao cozinhar Cuscuz com Culinária Artesão 6+.',
  'Delotia': 'Coleta manual ou com Enxada em fontes de Delotia, principalmente em O’dillita.',
  'Feijão Vermelho': 'Produção agrícola/cultivo de Feijão Vermelho; também pode ser obtido por trabalhadores conforme os nós disponíveis.',
  'Feijão-Mungo': 'Cultivo/produção agrícola de Feijão-Mungo; também disponível no Mercado Central.',
  'Folha de Coentro': 'Cultivo/produção de Coentro e obtenção agrícola correspondente.',
  'Folha de Perila': 'Obtida por cultivo de Perila e nas fontes agrícolas correspondentes; também pode ser adquirida pelo Mercado Central.',
  'Frutos do Mar': 'Obtidos por Pesca ou Coleta submarina, conforme a espécie exigida pela receita; a receita determina quais espécies são aceitas.',
  'Gelo Transparente': 'Coleta/obtenção de Gelo Transparente na Montanha do Inverno; também pode ser adquirido no Mercado Central quando disponível.',
  'Ginkgo': 'Pode ser comprado do Vendedor de Frutas da Terra do Amanhecer ou obtido por coleta/cultivo conforme a fonte disponível.',
  'Holmick': 'Produzido por Culinária Profissional 1+ no Utensílio de Culinária.',
  'Lagosta': 'Coleta submarina com Enxada; também pode ser obtida por outras fontes marinhas do jogo.',
  'Legume': 'Ingrediente de grupo: use um vegetal aceito pela receita, como Abóbora, Tomate, Repolho ou Pimentão, conforme a regra de substituição.',
  'Licor de Yuzu Azedo': 'Pequena chance de obter ao cozinhar Licor de Yuzu com a habilidade exigida pelo jogo.',
  'Makgeolli Encorpado': 'Pequena chance de obter ao produzir Makgeolli com Culinária Hábil 1+.',
  'Marisco Desidratado': 'Obtido por Secagem de Mariscos; versão correspondente de maior qualidade pode substituir conforme a regra do grupo.',
  'Marisco de Pérola Desidratado': 'Obtido por Secagem de Marisco de Pérola.',
  'Mel de Cozinha de Alta Qualidade': 'Obtido por processamento de Colmeia Selvagem; também pode resultar de fontes de apicultura/colheita do jogo.',
  'Mesima': 'Coleta manual na região da Montanha do Inverno, incluindo áreas florestais próximas ao Wind Nol’s Perch; também pode ser negociada pelo Mercado Central quando disponível.',
  'Molho de Soja': 'Obtido na Terra do Amanhecer a partir da produção de Pasta de Soja em Jarro de Barro/Jangdok; pode surgir como subproduto.',
  'Noz-Moscada': 'Obtida em nós agrícolas de Valência, como Terras Agrícolas do Bazar, ou por cultivo; também disponível no Mercado Central.',
  'Ostra': 'Coleta submarina com Enxada; também pode ser obtida em fontes marítimas apropriadas.',
  'Pasta de Soja': 'Produzida na Terra do Amanhecer em Jarro de Barro/Jangdok usando Meju; o Molho de Soja pode ser obtido como subproduto.',
  'Peixe': 'Obtido por Pesca; escolha uma espécie de peixe pertencente ao grupo de substituição aceito pela receita.',
  'Pimenta Picante': 'Cultivo/produção agrícola de Pimenta Picante; também disponível no Mercado Central.',
  'Pistache': 'Produção agrícola/cultivo ou trabalhadores nos nós de produção apropriados da região de Valência.',
  'Plantas': 'Ingrediente de grupo: selecione a planta/erva aceita pela receita e pela regra de substituição correspondente.',
  'Páprica': 'Cultivo/produção agrícola de Páprica; também disponível no Mercado Central.',
  'Pó de Pimenta Vermelha': 'Processamento (Moagem) de Pimenta Vermelha/Pimenta conforme o método de processamento do jogo.',
  'Repolho Chinês': 'Cultivo/produção de Repolho Chinês; também disponível no Mercado Central.',
  'Risoto de Cogumelo Oriole bem Aromático': 'Pequena chance de obter ao cozinhar Risoto de Cogumelo Oriole com Culinária Artesão 1+.',
  'Samambaia Frita': 'Culinária Profissional 1+ no Utensílio de Culinária: 8 Samambaia + 5 Alho + 2 Sal + 5 Água Mineral + 2 Azeite de Oliva.',
  'Samambaia Frita Bem Gostosa': 'Pequena chance de obter ao cozinhar Samambaia Frita com Culinária Mestre 1+.',
  'Yuzu Especial': 'Produzido por cultivo/coleta de Yuzu Especial; também pode ser comprado no Mercado Central.',
  'Yuzu de Alta Qualidade': 'Produzido por cultivo/coleta de Yuzu de Alta Qualidade; também pode ser comprado no Mercado Central.',
  'Óleo de Gergelim': 'Obtido por Processamento (Moagem) de 5 Gergelim.',
  'Óleo de Milho': 'Processamento (Aquecimento/Transformação) conforme a receita de óleo do jogo, usando Milho como matéria-prima.',
  'Óleo de Perila': 'Processamento do ingrediente agrícola Perila conforme a receita de produção do óleo no jogo.',
  'Sanduíche de Cogumelo Arco-Íris Doce': 'Pequena chance de obter ao cozinhar Sanduíche de Cogumelo Arco-Íris com Culinária Artesão 1+.',
  'Queijo Gratinado Gostoso': 'Versão de qualidade obtida ao produzir Queijo Gratinado; pode substituir a versão normal conforme a regra de substituição.',
  'Trigo-Sarraceno': 'Cultivo/produção agrícola de Trigo-Sarraceno; também disponível no Mercado Central.',
  'Chá com Leite Suave': 'Versão de qualidade obtida ao produzir Chá com Leite; pode substituir a versão normal conforme a regra de substituição.',
  'Trigo': 'Produzido por trabalhadores em nós de trigo ou cultivado em Horta; também disponível no Mercado Central.',
  'Teff': 'Produzido por trabalhadores em nós apropriados de Teff/Valência ou por cultivo, conforme as fontes agrícolas do jogo.',

};
