const DATA = [
  {
    name: 'Fármacos da Harmonia',
    group: 'Fármacos da Harmonia',
    isGroup: true,
    farmacoGroup: true,
    routes: [
      { label: 'Receita base', variants: [
        { title: 'Fármaco da Harmonia', effect:'Duração: 20 min', produces:10, children: [
          {name:'Fármaco da Raiva', qty:10}, {name:'Fármaco da Adaptação', qty:10}, {name:'Fármaco do Potencial', qty:10}, {name:'Fármaco da Decadência', qty:10}, {name:'Fármaco da Ira Descontrolada', qty:10}
        ]},
        { title: 'Fármaco da Harmonia - Humano', effect:'Duração: 20 min', produces:10, children: [
          {name:'Fármaco da Harmonia', qty:10}, {name:'Elixir de Caça a Humano', qty:30}, {name:'Elixir da Vontade', qty:30}, {name:'Catalisador Mágico Concentrado', qty:1}
        ]},
        { title: 'Fármaco da Harmonia - Humanoide', effect:'Duração: 20 min', produces:10, children: [
          {name:'Fármaco da Harmonia', qty:10}, {name:'Elixir de Caça a Humanoide', qty:30}, {name:'Elixir da Vontade', qty:30}, {name:'Catalisador Mágico Concentrado', qty:1}
        ]},
        { title: 'Fármaco da Harmonia - Kamasylvia', effect:'Duração: 20 min', produces:10, children: [
          {name:'Fármaco da Harmonia', qty:10}, {name:'Elixir de Grifo', qty:30}, {name:'Elixir da Vontade', qty:30}, {name:'Catalisador Mágico Concentrado', qty:1}
        ]},
        { title: 'Fármaco da Harmonia - Edania', effect:'Duração: 20 min', produces:10, children: [
          {name:'Fármaco da Harmonia', qty:10}, {name:'Elixir de Edania', qty:30}, {name:'Elixir da Vontade', qty:30}, {name:'Catalisador Mágico Concentrado', qty:1}
        ]}
      ]},
      { label: 'Receita de 1', variants: [
        { title: 'Fármaco da Harmonia - Humano', effect:'Duração: 20 min', produces:1, children: [
          {name:'Fármaco da Harmonia', qty:1}, {name:'Elixir Perfeito de Caça a Humano', qty:1}, {name:'Elixir da Vontade Extraordinária', qty:1}, {name:'Catalisador Mágico', qty:1}
        ]},
        { title: 'Fármaco da Harmonia - Humanoide', effect:'Duração: 20 min', produces:1, children: [
          {name:'Fármaco da Harmonia', qty:1}, {name:'Elixir de Caça a Humanoide Feroz', qty:1}, {name:'Elixir da Vontade Extraordinária', qty:1}, {name:'Catalisador Mágico', qty:1}
        ]},
        { title: 'Fármaco da Harmonia - Kamasylvia', effect:'Duração: 20 min', produces:1, children: [
          {name:'Fármaco da Harmonia', qty:1}, {name:'Elixir de Grifo', qty:3}, {name:'Elixir da Vontade Extraordinária', qty:1}, {name:'Catalisador Mágico', qty:1}
        ]},
        { title: 'Fármaco da Harmonia - Edania', effect:'Duração: 20 min', produces:1, children: [
          {name:'Fármaco da Harmonia', qty:1}, {name:'Elixir de Edania Poderoso', qty:1}, {name:'Elixir da Vontade Extraordinária', qty:1}, {name:'Catalisador Mágico', qty:1}
        ]}
      ]},
      { label: 'Receita de 100', variants: [
        { title:'Fármaco da Harmonia - Humano - 100 unidades', produces:100, children:[{name:'Fármaco da Harmonia',qty:100},{name:'Elixir de Caça a Humano',qty:300},{name:'Elixir da Vontade',qty:300},{name:'Catalisador Mágico Concentrado',qty:10},{name:'Essência de Ibellab',qty:1}]},
        { title:'Fármaco da Harmonia - Humanoide - 100 unidades', produces:100, children:[{name:'Fármaco da Harmonia',qty:100},{name:'Elixir de Caça a Humanoide',qty:300},{name:'Elixir da Vontade',qty:300},{name:'Catalisador Mágico Concentrado',qty:10},{name:'Essência de Ibellab',qty:1}]},
        { title:'Fármaco da Harmonia - Kamasylvia - 100 unidades', produces:100, children:[{name:'Fármaco da Harmonia',qty:100},{name:'Elixir de Grifo',qty:300},{name:'Elixir da Vontade',qty:300},{name:'Catalisador Mágico Concentrado',qty:10},{name:'Essência de Ibellab',qty:1}]},
        { title:'Fármaco da Harmonia - Edania - 100 unidades', produces:100, children:[{name:'Fármaco da Harmonia',qty:100},{name:'Elixir de Edania',qty:300},{name:'Elixir da Vontade',qty:300},{name:'Catalisador Mágico Concentrado',qty:10},{name:'Essência de Ibellab',qty:1}]}
      ]},
      { label: 'Imortalidade de 1', variants: [
        { title: 'Imortalidade: Fármaco da Harmonia', immortality:true, produces:1, children:[{name:'Fármaco da Harmonia',qty:1},{name:'Óleo da Imortalidade Decadente',qty:6}]},
        { title: 'Imortalidade: Fármaco da Harmonia - Humano', immortality:true, produces:1, children:[{name:'Fármaco da Harmonia - Humano',qty:1},{name:'Óleo da Imortalidade Decadente',qty:6}]},
        { title: 'Imortalidade: Fármaco da Harmonia - Humanoide', immortality:true, produces:1, children:[{name:'Fármaco da Harmonia - Humanoide',qty:1},{name:'Óleo da Imortalidade Decadente',qty:6}]},
        { title: 'Imortalidade: Fármaco da Harmonia - Kamasylvia', immortality:true, produces:1, children:[{name:'Fármaco da Harmonia - Kamasylvia',qty:1},{name:'Óleo da Imortalidade Decadente',qty:6}]},
        { title: 'Imortalidade: Fármaco da Harmonia - Edania', immortality:true, produces:1, children:[{name:'Fármaco da Harmonia - Edania',qty:1},{name:'Óleo da Imortalidade Decadente',qty:6}]}
      ]},
      { label: 'Imortalidade', variants: [
        { title: 'Imortalidade: Fármaco da Harmonia', immortality:true, produces:10, children:[{name:'Fármaco da Harmonia',qty:10},{name:'Óleo da Imortalidade Decadente',qty:60},{name:'Essência de Ibellab',qty:1}]},
        { title: 'Imortalidade: Fármaco da Harmonia - Humano', immortality:true, produces:10, children:[{name:'Fármaco da Harmonia - Humano',qty:10},{name:'Óleo da Imortalidade Decadente',qty:60},{name:'Essência de Ibellab',qty:1}]},
        { title: 'Imortalidade: Fármaco da Harmonia - Humanoide', immortality:true, produces:10, children:[{name:'Fármaco da Harmonia - Humanoide',qty:10},{name:'Óleo da Imortalidade Decadente',qty:60},{name:'Essência de Ibellab',qty:1}]},
        { title: 'Imortalidade: Fármaco da Harmonia - Kamasylvia', immortality:true, produces:10, children:[{name:'Fármaco da Harmonia - Kamasylvia',qty:10},{name:'Óleo da Imortalidade Decadente',qty:60},{name:'Essência de Ibellab',qty:1}]},
        { title: 'Imortalidade: Fármaco da Harmonia - Edania', immortality:true, produces:10, children:[{name:'Fármaco da Harmonia - Edania',qty:10},{name:'Óleo da Imortalidade Decadente',qty:60},{name:'Essência de Ibellab',qty:1}]}
      ]}
    ]
  },

  // Fármacos Base — camada intermediária formada pelos Elixires Base e
  // utilizada como matéria-prima para o Fármaco da Harmonia.
  {
    name: 'Fármacos Base',
    group: 'Fármacos Base',
    isGroup: true,
    farmacoGroup: true,
    routes: [
      { label: 'Receita base', variants: [
        {title:'Fármaco da Raiva', effect:'Duração: 20 min', produces:10, children:[{name:'Elixir de Fúria',qty:30},{name:'Elixir do Frenesi',qty:30},{name:'Elixir da Concentração',qty:30},{name:'Elixir da Destruição',qty:30},{name:'Catalisador Mágico',qty:10}]},
        {title:'Fármaco da Adaptação', effect:'Duração: 20 min', produces:10, children:[{name:'Elixir da Defesa',qty:30},{name:'Elixir de Estamina',qty:30},{name:'Elixir de Vida',qty:30},{name:'Elixir de Espiral',qty:30},{name:'Catalisador Mágico',qty:10}]},
        {title:'Fármaco do Potencial', effect:'Duração: 20 min', produces:10, children:[{name:'Elixir do Vento',qty:30},{name:'Elixir de Rapidez',qty:30},{name:'Elixir de Feitiço',qty:30},{name:'Elixir de Choque',qty:30},{name:'Catalisador Mágico',qty:10}]},
        {title:'Fármaco da Decadência', effect:'Duração: 20 min', produces:10, children:[{name:'Elixir do Ceifador',qty:30},{name:'Elixir da Morte',qty:30},{name:'Elixir de Perfuração',qty:30},{name:'Elixir de Pilhagem',qty:30},{name:'Catalisador Mágico',qty:10}]},
        {title:'Fármaco da Ira Descontrolada', effect:'Duração: 20 min', produces:10, children:[{name:'Elixir de Assassinato',qty:30},{name:'Elixir de Detecção',qty:30},{name:'Elixir de Carnificina',qty:30},{name:'Elixir do Céu',qty:30},{name:'Catalisador Mágico',qty:10}]}
      ]},
      { label: 'Receita de 100', variants: [
        {title:'Fármaco da Raiva — 100 unidades', produces:100, children:[{name:'Elixir de Fúria',qty:300},{name:'Elixir do Frenesi',qty:300},{name:'Elixir da Concentração',qty:300},{name:'Elixir da Destruição',qty:300},{name:'Catalisador Mágico Concentrado',qty:10}]},
        {title:'Fármaco da Adaptação — 100 unidades', produces:100, children:[{name:'Elixir da Defesa',qty:300},{name:'Elixir de Estamina',qty:300},{name:'Elixir de Vida',qty:300},{name:'Elixir de Espiral',qty:300},{name:'Catalisador Mágico Concentrado',qty:10}]},
        {title:'Fármaco do Potencial — 100 unidades', produces:100, children:[{name:'Elixir do Vento',qty:300},{name:'Elixir de Rapidez',qty:300},{name:'Elixir de Feitiço',qty:300},{name:'Elixir de Choque',qty:300},{name:'Catalisador Mágico Concentrado',qty:10}]},
        {title:'Fármaco da Decadência — 100 unidades', produces:100, children:[{name:'Elixir do Ceifador',qty:300},{name:'Elixir da Morte',qty:300},{name:'Elixir de Pilhagem',qty:300},{name:'Elixir de Perfuração',qty:300},{name:'Catalisador Mágico Concentrado',qty:10}]},
        {title:'Fármaco da Ira Descontrolada — 100 unidades', produces:100, children:[{name:'Elixir de Assassinato',qty:300},{name:'Elixir de Detecção',qty:300},{name:'Elixir de Carnificina',qty:300},{name:'Elixir do Céu',qty:300},{name:'Catalisador Mágico Concentrado',qty:10}]}
      ]},
      { label: 'Imortalidade', variants: [
        {title:'Imortalidade: Fármaco da Raiva', immortality:true, routes:[{label:'Imortalidade ×1',produces:1,children:[{name:'Fármaco da Raiva',qty:1},{name:'Óleo da Imortalidade Decadente',qty:1}]},{label:'Imortalidade ×10',produces:10,children:[{name:'Fármaco da Raiva',qty:10},{name:'Óleo da Imortalidade Decadente',qty:10},{name:'Essência de Ibellab',qty:1}]}]},
        {title:'Imortalidade: Fármaco da Adaptação', immortality:true, routes:[{label:'Imortalidade ×1',produces:1,children:[{name:'Fármaco da Adaptação',qty:1},{name:'Óleo da Imortalidade Decadente',qty:1}]},{label:'Imortalidade ×10',produces:10,children:[{name:'Fármaco da Adaptação',qty:10},{name:'Óleo da Imortalidade Decadente',qty:10},{name:'Essência de Ibellab',qty:1}]}]},
        {title:'Imortalidade: Fármaco do Potencial', immortality:true, routes:[{label:'Imortalidade ×1',produces:1,children:[{name:'Fármaco do Potencial',qty:1},{name:'Óleo da Imortalidade Decadente',qty:1}]},{label:'Imortalidade ×10',produces:10,children:[{name:'Fármaco do Potencial',qty:10},{name:'Óleo da Imortalidade Decadente',qty:10},{name:'Essência de Ibellab',qty:1}]}]},
        {title:'Imortalidade: Fármaco da Decadência', immortality:true, routes:[{label:'Imortalidade ×1',produces:1,children:[{name:'Fármaco da Decadência',qty:1},{name:'Óleo da Imortalidade Decadente',qty:1}]},{label:'Imortalidade ×10',produces:10,children:[{name:'Fármaco da Decadência',qty:10},{name:'Óleo da Imortalidade Decadente',qty:10},{name:'Essência de Ibellab',qty:1}]}]},
        {title:'Imortalidade: Fármaco da Ira Descontrolada', immortality:true, routes:[{label:'Imortalidade ×1',produces:1,children:[{name:'Fármaco da Ira Descontrolada',qty:1},{name:'Óleo da Imortalidade Decadente',qty:1}]},{label:'Imortalidade ×10',produces:10,children:[{name:'Fármaco da Ira Descontrolada',qty:10},{name:'Óleo da Imortalidade Decadente',qty:10},{name:'Essência de Ibellab',qty:1}]}]}
      ]}
    ]
  },

  // Sangues processados — intermediários de Alquimia usados em receitas avançadas.
  {name:'Sangue da Fera Lendária', group:'Sangues', produces:'1–4', note:'Alquimia (Aprendiz 1+) no Utensílio de Alquimia. Receita: Sangue de Lagarto ×2; alternativas do grupo: Sangue de Minhoca, Sangue de Morcego, Sangue de Pássaro Kuku ou Sangue de Cobra. Produção: 1–4 unidades.', children:[
    {name:'Reagente em pó Puro',qty:1}, {name:'Sangue de Lagarto',qty:2, alternatives:['Sangue de Minhoca','Sangue de Morcego','Sangue de Pássaro Kuku','Sangue de Cobra']}, {name:'Vestígio da Natureza',qty:1}, {name:'Folha de Espírito',qty:1}
  ]},
  {name:'Sangue do Tirano', group:'Sangues', produces:'1–4', note:'Alquimia (Aprendiz 1+) no Utensílio de Alquimia. Produção: 1–4 unidades; Pó Brilhante pode ser obtido como produto adicional.', children:[
    {name:'Reagente em pó Puro',qty:1}, {name:'Sangue de Urso',qty:2, alternatives:['Sangue de Troll','Sangue de Ogro','Sangue de Dinossauro','Sangue de Leão','Sangue de Iaque','Sangue de Elefante Rocha']}, {name:'Vestígio da Natureza',qty:1}, {name:'Galho de Monge',qty:1}
  ]},
  {name:'Sangue do Pecador', group:'Sangues', produces:'1–4', note:'Alquimia (Aprendiz 1+) no Utensílio de Alquimia. Produção: 1–4 unidades; Pó Brilhante pode ser obtido como produto adicional.', children:[
    {name:'Reagente Líquido Limpo',qty:1}, {name:'Sangue de Porco',qty:2, alternatives:['Sangue de Cervo','Sangue de Ovelha','Sangue de Boi','Sangue de Waragon','Sangue de Lhama','Sangue de Cabra']}, {name:'Pó de Chama',qty:1}, {name:'Laço de Árvore Sangrenta',qty:1}
  ]},
  {name:'Sangue de Palhaço', group:'Sangues', produces:'1–4', note:'Alquimia (Aprendiz 1+) no Utensílio de Alquimia. Produção: 1–4 unidades; Pó Brilhante pode ser obtido como produto adicional.', children:[
    {name:'Reagente Líquido Limpo',qty:1}, {name:'Sangue de Lobo',qty:2, alternatives:['Sangue de Rinoceronte','Sangue de Dragão Guepardo','Sangue de Flamingo']}, {name:'Pó de Escuridão',qty:1}, {name:'Folha de Espírito',qty:1}
  ]},
  {name:'Sangue de Homem Sábio', group:'Sangues', produces:'1–4', note:'Alquimia (Aprendiz 1+) no Utensílio de Alquimia. Produção: 1–4 unidades; Pó Brilhante pode ser obtido como produto adicional.', children:[
    {name:'Reagente Líquido Limpo',qty:1}, {name:'Sangue de Raposa',qty:2, alternatives:['Sangue de Guaxinim','Sangue de Macaco','Sangue de Doninha','Sangue de Escorpião','Sangue de Marmota']}, {name:'Vestígio da Natureza',qty:1}, {name:'Galho de Monge',qty:1}
  ]},

  // Materiais base — sangue bruto usado diretamente ou como substituto nas cascatas de Alquimia.
  {name:'Sangue de Cervo', group:'Sangues', source:'Coletando Fluidos de cervo com um Coletor de Fluidos.'},
  {name:'Sangue de Ovelha', group:'Sangues', source:'Coletando Fluidos de ovelha com um Coletor de Fluidos.'},
  {name:'Sangue de Porco', group:'Sangues', source:'Coletando Fluidos de porco com um Coletor de Fluidos.'},
  {name:'Sangue de Raposa', group:'Sangues', source:'Coletando Fluidos de raposa com um Coletor de Fluidos.'},
  {name:'Sangue de Urso', group:'Sangues', source:'Coletando Fluidos de urso com um Coletor de Fluidos.'},
  {name:'Sangue de Lobo', group:'Sangues', source:'Coletando Fluidos de lobo com um Coletor de Fluidos.'},
  {name:'Sangue de Rinoceronte', group:'Sangues', source:'Coletando Fluidos de rinoceronte com um Coletor de Fluidos.'},
  {name:'Sangue de Dragão Guepardo', group:'Sangues', source:'Coletando Fluidos de Dragão Guepardo com um Coletor de Fluidos.'},
  {name:'Sangue de Flamingo', group:'Sangues', source:'Coletando Fluidos de flamingo com um Coletor de Fluidos.'},
  {name:'Sangue de Guaxinim', group:'Sangues', source:'Coletando Fluidos de guaxinim com um Coletor de Fluidos.'},
  {name:'Sangue de Macaco', group:'Sangues', source:'Coletando Fluidos de macaco com um Coletor de Fluidos.'},
  {name:'Sangue de Doninha', group:'Sangues', source:'Coletando Fluidos de doninha com um Coletor de Fluidos.'},
  {name:'Sangue de Escorpião', group:'Sangues', source:'Coletando Fluidos de escorpião com um Coletor de Fluidos.'},
  {name:'Sangue de Marmota', group:'Sangues', source:'Coletando Fluidos de marmota com um Coletor de Fluidos.'},
  {name:'Sangue de Boi', group:'Sangues', source:'Coletando Fluidos de boi com um Coletor de Fluidos.'},
  {name:'Sangue de Waragon', group:'Sangues', source:'Coletando Fluidos de Waragon com um Coletor de Fluidos.'},
  {name:'Sangue de Lhama', group:'Sangues', source:'Coletando Fluidos de lhama com um Coletor de Fluidos.'},
  {name:'Sangue de Cabra', group:'Sangues', source:'Coletando Fluidos de cabra com um Coletor de Fluidos.'},
  {name:'Sangue de Troll', group:'Sangues', source:'Coletando Fluidos de Troll com um Coletor de Fluidos.'},
  {name:'Sangue de Ogro', group:'Sangues', source:'Coletando Fluidos de Ogro com um Coletor de Fluidos.'},
  {name:'Sangue de Dinossauro', group:'Sangues', source:'Coletando Fluidos de Dinossauro com um Coletor de Fluidos.'},
  {name:'Sangue de Leão', group:'Sangues', source:'Coletando Fluidos de Leão com um Coletor de Fluidos.'},
  {name:'Sangue de Iaque', group:'Sangues', source:'Coletando Fluidos de Iaque com um Coletor de Fluidos.'},
  {name:'Sangue de Elefante Rocha', group:'Sangues', source:'Coletando Fluidos de Elefante Rocha com um Coletor de Fluidos.'},
  {name:'Sangue de Lagarto', group:'Sangues', source:'Coletando Fluidos de lagarto com um Coletor de Fluidos.'},
  {name:'Sangue de Minhoca', group:'Sangues', source:'Coletando Fluidos de minhoca com um Coletor de Fluidos.'},
  {name:'Sangue de Morcego', group:'Sangues', source:'Coletando Fluidos de morcego com um Coletor de Fluidos.'},
  {name:'Sangue de Pássaro Kuku', group:'Sangues', source:'Coletando Fluidos do pássaro Kuku com um Coletor de Fluidos.'},
  {name:'Sangue de Cobra', group:'Sangues', source:'Coletando Fluidos de cobra com um Coletor de Fluidos.'},
  {name:'Sangue de Turo Rígido', group:'Sangues', source:'Obtido com baixa probabilidade através de combates na região de O\'dyllita.'},

  // Materiais base — seivas brutas usadas diretamente nas cascatas de Alquimia.
  {name:'Seiva de Abeto', group:'Seivas', source:'Pode ser obtida de Abeto usando um Coletor de Fluidos; também por Nó de Produção de Cortar Lenha.'},
  {name:'Seiva de Bordo', group:'Seivas', source:'Pode ser obtida de Bordo usando um Coletor de Fluidos; também por Nó de Produção de Cortar Lenha.'},
  {name:'Seiva de Bétula', group:'Seivas', source:'Pode ser obtida de Bétula usando um Coletor de Fluidos; também por Nó de Produção de Cortar Lenha.'},
  {name:'Seiva de Cedro', group:'Seivas', source:'Pode ser obtida de Cedro usando um Coletor de Fluidos; também por Nó de Produção de Cortar Lenha.'},
  {name:'Seiva de Cedro Branco', group:'Seivas', source:'Pode ser obtida de Cedro Branco usando um Coletor de Fluidos; também por Nó de Produção de Cortar Lenha.'},
  {name:'Seiva de Cedro Nevado', group:'Seivas', source:'Obtida por Coleta de Fluidos em Cedros Nevados.'},
  {name:'Seiva de Espinheiro', group:'Seivas', source:'Pode ser obtida de Espinheiro usando um Coletor de Fluidos; também por Nó de Produção de Cortar Lenha.'},
  {name:'Seiva de Freixo', group:'Seivas', source:'Pode ser obtida de Freixo usando um Coletor de Fluidos; também por Nó de Produção de Cortar Lenha.'},
  {name:'Seiva de Pinheiro', group:'Seivas', source:'Pode ser obtida de Pinheiro usando um Coletor de Fluidos; também por Nó de Produção de Cortar Lenha.'},
  {name:'Seiva de Tuia', group:'Seivas', source:'Pode ser obtida de Tuia usando um Coletor de Fluidos; também por Nó de Produção de Cortar Lenha.'},
  {name:'Seiva de Árvore Musgosa', group:'Seivas', source:'Pode ser obtida de Árvore Musgosa usando um Coletor de Fluidos; também por Nó de Produção de Cortar Lenha.'},
  {name:'Seiva de Árvore de Caphras', group:'Seivas', source:'Pode ser obtida da Árvore de Caphras usando um Coletor de Fluidos; também por Nó de Produção de Cortar Lenha.'},
  {name:'Seiva de Árvore-Anel', group:'Seivas', source:'Pode ser obtida de Árvore-Anel usando um Coletor de Fluidos; também por Nó de Produção de Cortar Lenha.'},

  {
    name: 'Fármacos Tradicionais',
    group: 'Fármacos Tradicionais',
    isGroup: true,
    farmacoGroup: true,
    routes: [
      { label: 'Receita base', variants: [
        {title:'Fármaco da Onda', effect:'EXP de Pesca +20%, Potencial de Velocidade de Pesca +2 Nv., Maestria de Pesca +50, por 180 min (tempo de recarga: 10 s)', children:[{name:'Elixir de Pescador',qty:36},{name:'Elixir do Tempo',qty:36},{name:'Elixir da Maestria',qty:36},{name:'Lágrima de Lua do Anoitecer',qty:10}], note:'Alquimia Simples (Processamento L).'},
        {title:'Fármaco da Onda Azul', effect:'EXP de Pesca +20%, Potencial de Velocidade de Pesca +2 Nv., Maestria de Pesca +50, por 360 min (tempo de recarga: 10 s)', children:[{name:'Elixir de Pescador',qty:72},{name:'Elixir do Tempo',qty:72},{name:'Elixir da Maestria',qty:72},{name:'Lágrima de Lua do Anoitecer',qty:20},{name:'Fragmento do Vento Oscilante',qty:1}], note:'Alquimia Simples (Processamento L).'},
        {title:'Fármaco da Onda Azul Profunda', effect:'EXP de Pesca +30%, Potencial de Velocidade de Pesca +3 Nv., Maestria de Pesca +100, por 600 min (tempo de recarga: 10 s)', routes:[{label:'Receita 1',children:[{name:'Fármaco da Onda',qty:4},{name:'Essência da Onda',qty:1,source:'Obtido no Baú de Recompensa do Campeonato Semanal de Pesca'}]},{label:'Receita 2',children:[{name:'Fármaco da Onda Azul',qty:2},{name:'Essência da Onda',qty:1,source:'Obtido no Baú de Recompensa do Campeonato Semanal de Pesca'}]}], note:'Alquimia Simples (Processamento L).'},
        {title:'Fármaco da Fúria', effect:'Duração: 20 min', routes:[{label:'Receita base',children:[{name:'Elixir da Destruição',qty:3},{name:'Elixir de Caça a Humano',qty:3},{name:'Elixir do Frenesi',qty:3},{name:'Lágrima de Lua do Anoitecer',qty:1}]},{label:'Produção ×10',children:[{name:'Elixir de Caça a Humano',qty:30},{name:'Elixir do Frenesi',qty:30},{name:'Elixir da Destruição Fatal',qty:10},{name:'Lágrima de Lua do Anoitecer',qty:10},{name:'Essência de Ibellab',qty:1}]}]},
        {title:'Fármaco do Gigante', effect:'Duração: 20 min', routes:[{label:'Receita base',children:[{name:'Elixir de Fúria',qty:3},{name:'Elixir de Choque',qty:3},{name:'Elixir de Perfuração',qty:3},{name:'Lágrima de Lua do Anoitecer',qty:1}]},{label:'Produção ×10',children:[{name:'Elixir de Perfuração Brutal',qty:10},{name:'Elixir da Fúria Infinita',qty:10},{name:'Elixir de Choque',qty:30},{name:'Lágrima de Lua do Anoitecer',qty:10},{name:'Essência de Ibellab',qty:1}]}]},
        {title:'Fármaco da Fera', effect:'Duração: 20 min', routes:[{label:'Receita base',children:[{name:'Elixir do Ceifador',qty:3},{name:'Elixir de Experiência',qty:3},{name:'Elixir da Vontade',qty:3},{name:'Lágrima de Lua do Anoitecer',qty:1}]},{label:'Produção ×10',children:[{name:'[Mistura] Elixir do Ceifador & Experiência',qty:10},{name:'[Mistura] Elixir de Feitiço & Vento & Rapidez',qty:10},{name:'Lágrima de Lua do Anoitecer',qty:10},{name:'Essência de Ibellab',qty:1}]}]},
        {title:'Fármaco de Barbaridade', effect:'Duração: 20 min', routes:[{label:'Receita base',children:[{name:'Elixir de Espírito Weenie',qty:3},{name:'Elixir de Espírito Looney',qty:3},{name:'Elixir de Espiral',qty:3},{name:'Lágrima de Lua do Anoitecer',qty:1}]},{label:'Produção ×10',children:[{name:'Elixir de Espírito Weenie Afluente',qty:10},{name:'Elixir de Espírito Looney',qty:30},{name:'Elixir de Espiral',qty:30},{name:'Lágrima de Lua do Anoitecer',qty:10},{name:'Essência de Ibellab',qty:1}]}]},
        {title:'Fármaco do Alvoroço', effect:'Duração: 20 min', routes:[{label:'Receita base',children:[{name:'Elixir do Frenesi',qty:3},{name:'Elixir de Caça a Humanoide',qty:3},{name:'Lágrima de Lua do Anoitecer',qty:1},{name:'Essência do Abismo',qty:1}]},{label:'Produção ×10',children:[{name:'Elixir do Frenesi',qty:30},{name:'Elixir de Caça a Humanoide',qty:30},{name:'Lágrima de Lua do Anoitecer',qty:10},{name:'Essência de Ibellab',qty:1},{name:'Essência do Abismo',qty:10}]}]},
        {title:'Fármaco da Armadura de Aço', effect:'Duração: 20 min', routes:[{label:'Receita base',children:[{name:'Elixir da Vontade',qty:3},{name:'Elixir de Vida',qty:3},{name:'Elixir da Armadura de Aço',qty:3},{name:'Lágrima de Lua do Anoitecer',qty:1}]},{label:'Produção ×10',children:[{name:'Elixir da Vontade',qty:30},{name:'Elixir de Vida',qty:30},{name:'Elixir da Armadura de Aço',qty:30},{name:'Lágrima de Lua do Anoitecer',qty:10},{name:'Essência de Ibellab',qty:1}]}]}
      ]},
      { label: 'Imortalidade', variants: [
        {title:'Imortalidade: Fármaco da Fúria', immortality:true, routes:[{label:'Imortalidade ×1',children:[{name:'Fármaco da Fúria',qty:1},{name:'Óleo da Imortalidade Decadente',qty:1}]},{label:'Imortalidade ×10',children:[{name:'Fármaco da Fúria',qty:10},{name:'Óleo da Imortalidade Decadente',qty:10},{name:'Essência de Ibellab',qty:1}]}]},
        {title:'Imortalidade: Fármaco do Gigante', immortality:true, routes:[{label:'Imortalidade ×1',children:[{name:'Fármaco do Gigante',qty:1},{name:'Óleo da Imortalidade Decadente',qty:1}]},{label:'Imortalidade ×10',children:[{name:'Fármaco do Gigante',qty:10},{name:'Óleo da Imortalidade Decadente',qty:10},{name:'Essência de Ibellab',qty:1}]}]},
        {title:'Imortalidade: Fármaco da Fera', immortality:true, routes:[{label:'Imortalidade ×1',children:[{name:'Fármaco da Fera',qty:1},{name:'Óleo da Imortalidade Decadente',qty:1}]},{label:'Imortalidade ×10',children:[{name:'Fármaco da Fera',qty:10},{name:'Óleo da Imortalidade Decadente',qty:10},{name:'Essência de Ibellab',qty:1}]}]},
        {title:'Imortalidade: Fármaco de Barbaridade', immortality:true, routes:[{label:'Imortalidade ×1',children:[{name:'Fármaco de Barbaridade',qty:1},{name:'Óleo da Imortalidade Decadente',qty:1}]},{label:'Imortalidade ×10',children:[{name:'Fármaco de Barbaridade',qty:10},{name:'Óleo da Imortalidade Decadente',qty:10},{name:'Essência de Ibellab',qty:1}]}]},
        {title:'Imortalidade: Fármaco do Alvoroço', immortality:true, routes:[{label:'Imortalidade ×1',children:[{name:'Fármaco do Alvoroço',qty:1},{name:'Óleo da Imortalidade Decadente',qty:1}]},{label:'Imortalidade ×10',children:[{name:'Fármaco do Alvoroço',qty:10},{name:'Óleo da Imortalidade Decadente',qty:10},{name:'Essência de Ibellab',qty:1}]}]},
        {title:'Imortalidade: Fármaco da Armadura de Aço', immortality:true, routes:[{label:'Imortalidade ×1',children:[{name:'Fármaco da Armadura de Aço',qty:1},{name:'Óleo da Imortalidade Decadente',qty:1}]},{label:'Imortalidade ×10',children:[{name:'Fármaco da Armadura de Aço',qty:10},{name:'Óleo da Imortalidade Decadente',qty:10},{name:'Essência de Ibellab',qty:1}]}]}
      ]}

    ]
  },
  { name:'Fármaco do Oceano', group:'Fármacos Tradicionais', effect:'EXP de Navegação +20%, EXP de Permuta +20%, EXP de Marinheiro +10%, por 180 min (tempo de espera: 10 s)', children:[{name:'Elixir da Maestria',qty:36},{name:'Elixir do Tempo',qty:36},{name:'Elixir de Amizade',qty:36},{name:'Lágrima de Lua do Anoitecer',qty:10}], note:'Alquimia Simples (Processamento L).'},
  { name:'Fármaco do Vasto Oceano', group:'Fármacos Tradicionais', effect:'EXP de Navegação +20%, EXP de Permuta +20%, EXP de Marinheiro +10%, por 360 min (tempo de recarga: 10 s)', children:[{name:'Elixir da Maestria',qty:72},{name:'Elixir do Tempo',qty:72},{name:'Elixir de Amizade',qty:72},{name:'Lágrima de Lua do Anoitecer',qty:20},{name:'Fragmento do Vento Oscilante',qty:1}], note:'Alquimia Simples (Processamento L).'},
  { name:'Fármaco do Oceano Infinito', group:'Fármacos Tradicionais', effect:'EXP de Navegação +25%, EXP de Permuta +25%, EXP de Marinheiro +15%, Maestria de Navegação +50, por 600 min (tempo de recarga: 10 s)', routes:[{label:'Receita 1',children:[{name:'Fármaco do Oceano',qty:4},{name:'Essência do Oceano',qty:1}]},{label:'Receita 2',children:[{name:'Fármaco do Vasto Oceano',qty:2},{name:'Essência do Oceano',qty:1}]}], note:'Alquimia Simples (Processamento L).'},
  
  // Elixires Base — elixires verdes/fundacionais usados como matéria-prima
  // dos Fármacos da Harmonia e de versões superiores. A lista da categoria
  // segue a composição oficial dos cinco fármacos de harmonia: 20 elixires.
  {name:'Elixir de Fúria', group:'Elixires Base', effect:'PA Total +5, por 10 min (tempo de recarga: 1 s)', produces:'1–4', children:[
    {name:'Seiva de Freixo',qty:1}, {name:'Cogumelo Anão',qty:4}, {name:'Sangue de Urso',qty:4}, {name:'Água Purificada',qty:3}
  ], note:'Alquimia (Novato 1+) no Utensílio de Alquimia.',additionalProducts:['1–2 Elixir da Fúria Infinita']},
  {name:'Elixir do Frenesi', group:'Elixires Base', effect:'PD Total -5, PA Total +10, por 10 min (tempo de recarga: 1 s)', produces:'1–4', children:[
    {name:'Óleo de Regeneração',qty:1}, {name:'Reagente Líquido Limpo',qty:5}, {name:'Seiva de Cedro',qty:5}, {name:'Vestígio da Natureza',qty:3}, {name:'Cogumelo Fantasma',qty:2}
  ], note:'Alquimia (Hábil 1+) no Utensílio de Alquimia.',additionalProducts:['1–2 Elixir do Frenesi Infinito','1 Pó Brilhante']},
  {name:'Elixir da Concentração', group:'Elixires Base', effect:'Precisão Total +8, por 10 min (tempo de recarga: 1 s)', produces:'1', children:[
    {name:'Reagente Líquido Limpo',qty:1}, {name:'Cogumelo Nuvem',qty:3}, {name:'Sangue de Urso',qty:3}, {name:'Grama Selvagem',qty:2, alternatives:[{name:'Erva Daninha',qty:8}]}
  ], note:'Alquimia (Novato 1+) no Utensílio de Alquimia.',additionalProducts:['1 Elixir de Concentração Avançada']},
  {name:'Elixir da Destruição', group:'Elixires Base', effect:'Dano adicional de todo ataque especial +1%, por 10 min (tempo de recarga: 1 s)', produces:'1–4', children:[
    {name:'Óleo da Tempestade',qty:1}, {name:'Vestígio da Natureza',qty:3}, {name:'Reagente Líquido Limpo',qty:5}, {name:'Pó de Chama',qty:5}, {name:'Seiva de Cedro Nevado',qty:7}
  ], note:'Alquimia (Hábil 1+) no Utensílio de Alquimia.',additionalProducts:['1–2 Elixir da Destruição Fatal','1 Pó Brilhante']},

  {name:'Elixir da Defesa', group:'Elixires Base', effect:'Redução de Todos os Danos +5, por 10 min (tempo de recarga: 1 s)', produces:'1–4', children:[
    {name:'Reagente Líquido Limpo',qty:1}, {name:'Seiva de Freixo',qty:6}, {name:'Sangue de Porco',qty:5, alternatives:['Sangue de Cervo','Sangue de Ovelha','Sangue de Boi','Sangue de Waragon','Sangue de Lhama','Sangue de Cabra']}, {name:'Água Purificada',qty:3}
  ], note:'Alquimia (Novato 1+) no Utensílio de Alquimia.',additionalProducts:['1–2 Elixir de Defesa de Aço']},
  {name:'Elixir de Espiral', group:'Elixires Base', effect:'Evasão Total +8, por 10 min (tempo de recarga: 1 s)', produces:'1–4', children:[
    {name:'Seiva de Tuia',qty:6}, {name:'Galho de Monge',qty:3}, {name:'Sangue de Palhaço',qty:2}, {name:'Pó de Chama',qty:2}, {name:'Água Purificada',qty:3}
  ], note:'Alquimia (Aprendiz 1+) no Utensílio de Alquimia.',additionalProducts:['1–2 Elixir de Espiral Brilhante','1 Pó Brilhante']},
  {name:'Elixir de Vida', group:'Elixires Base', effect:'HP Máximo +100, por 10 min (tempo de recarga: 1 s)', produces:'1–4', children:[
    {name:'Reagente em pó Puro',qty:1}, {name:'Azaleia Real Prata',qty:3}, {name:'Sangue de Raposa',qty:5}, {name:'Poção de HP (P)',qty:3}
  ], note:'Alquimia (Novato 1+) no Utensílio de Alquimia.',additionalProducts:['1–2 Elixir Poderoso de Vida']},
  {name:'Elixir de Estamina', group:'Elixires Base', effect:'Stamina Máxima +100, por 10 min (tempo de recarga: 1 s)', produces:'1–4', children:[
    {name:'Reagente em pó Puro',qty:1}, {name:'Seiva de Bétula',qty:5}, {name:'Sangue de Urso',qty:4}, {name:'Cogumelo Anão',qty:2}
  ], note:'Alquimia (Novato 1+) no Utensílio de Alquimia.',additionalProducts:['1–2 Elixir de Estamina Esmagadora']},

  {name:'Elixir do Vento', group:'Elixires Base', effect:'Potencial de Velocidade de Ataque +2 Nv., por 10 min (tempo de recarga: 1 s)', produces:'1–4', children:[
    {name:'Sangue de Homem Sábio',qty:1}, {name:'Cogumelo Vidente',qty:5}, {name:'Seiva de Pinheiro',qty:5}, {name:'Pó de Escuridão',qty:2}
  ], note:'Alquimia (Aprendiz 1+) no Utensílio de Alquimia.',additionalProducts:['1–2 Elixir do Vento Fluente','1 Pó Brilhante']},
  {name:'Elixir de Rapidez', group:'Elixires Base', effect:'Potencial de Velocidade de Movimento +2 Nv., por 10 min (tempo de recarga: 1 s)', produces:'1–4', children:[
    {name:'Sangue da Fera Lendária',qty:1}, {name:'Cogumelo Flecha',qty:5}, {name:'Seiva de Bétula',qty:5}, {name:'Pó de Escuridão',qty:2}
  ], note:'Alquimia (Aprendiz 1+) no Utensílio de Alquimia.',additionalProducts:['1–2 Elixir da Rapidez Intrépida','1 Pó Brilhante']},
  {name:'Elixir de Feitiço', group:'Elixires Base', effect:'Potencial de Velocidade de Conjuração +2 Nv., por 10 min (tempo de recarga: 1 s)', produces:'1–4', children:[
    {name:'Sangue do Tirano',qty:1}, {name:'Flor de Escama de Fogo',qty:5}, {name:'Seiva de Bordo',qty:3}, {name:'Pó de Escuridão',qty:2}
  ], note:'Alquimia (Aprendiz 1+) no Utensílio de Alquimia.',additionalProducts:['1–2 Elixir de Feitiço Ágil','1 Pó Brilhante']},
  {name:'Elixir de Choque', group:'Elixires Base', effect:'Taxa de Acerto Crítico +2 Nv., por 10 min (tempo de recarga: 1 s)', produces:'1–4', children:[
    {name:'Sangue de Palhaço',qty:1}, {name:'Cogumelo Tigre',qty:5}, {name:'Seiva de Cedro',qty:7}, {name:'Pó do Tempo',qty:3}
  ], note:'Alquimia (Aprendiz 1+) no Utensílio de Alquimia.',additionalProducts:['1–2 Elixir de Choque Poderoso','1 Pó Brilhante']},

  {name:'Elixir do Ceifador', group:'Elixires Base', effect:'Ao acertar golpe, HP Atual +3, por 10 min (tempo de recarga: 1 s)', produces:'1–4', children:[
    {name:'Óleo de Coragem',qty:1}, {name:'Reagente em pó Puro',qty:4}, {name:'Cogumelo Céu',qty:2}, {name:'Galho de Monge',qty:2}, {name:'Vestígio da Natureza',qty:4}
  ], note:'Alquimia (Hábil 1+) no Utensílio de Alquimia.',additionalProducts:['1–2 Elixir de Ceifador de Alma','1 Pó Brilhante']},
  {name:'Elixir da Morte', group:'Elixires Base', effect:'No Acerto Crítico, Dano que Ignora Defesa +7, por 10 min (tempo de recarga: 1 s)', produces:'1–4', children:[
    {name:'Óleo de Tranquilidade',qty:1}, {name:'Reagente Líquido Limpo',qty:6}, {name:'Cogumelo Ancestral',qty:2}, {name:'Seiva de Freixo',qty:7}, {name:'Vestígio da Natureza',qty:2}
  ], note:'Alquimia (Hábil 1+) no Utensílio de Alquimia.',additionalProducts:['1–2 Elixir de Morte Brutal','1 Pó Brilhante']},
  {name:'Elixir de Perfuração', group:'Elixires Base', effect:'No Ataque por Trás, Dano que Ignora Defesa +7, por 10 min (tempo de recarga: 1 s)', produces:'1–4', children:[
    {name:'Óleo da Corrupção',qty:1}, {name:'Reagente Líquido Limpo',qty:4}, {name:'Cogumelo Blefista',qty:5}, {name:'Seiva de Pinheiro',qty:5}, {name:'Vestígio da Natureza',qty:2}
  ], note:'Alquimia (Hábil 1+) no Utensílio de Alquimia.',additionalProducts:['1–2 Elixir de Perfuração Brutal','1 Pó Brilhante']},
  {name:'Elixir de Pilhagem', group:'Elixires Base', effect:'HP Atual no Acerto Crítico +9, por 10 min (tempo de recarga: 1 s)', produces:'1–4', children:[
    {name:'Óleo de Coragem',qty:1}, {name:'Reagente Líquido Limpo',qty:4}, {name:'Cogumelo Corcunda',qty:3}, {name:'Seiva de Bétula',qty:4}, {name:'Vestígio da Natureza',qty:2}
  ], note:'Alquimia (Hábil 1+) no Utensílio de Alquimia.',additionalProducts:['1–2 Elixir de Pilhagem Forte','1 Pó Brilhante']},

  {name:'Elixir de Assassinato', group:'Elixires Base', effect:'Dano Adicional no Ataque por Trás +10%, por 10 min (tempo de recarga: 1 s)', produces:'1–4', children:[
    {name:'Óleo de Regeneração',qty:1}, {name:'Reagente em pó Puro',qty:5}, {name:'Cogumelo Amanita',qty:4}, {name:'Caroço de Árvore Vermelha',qty:2}, {name:'Vestígio da Natureza',qty:2}
  ], note:'Alquimia (Hábil 1+) no Utensílio de Alquimia.',additionalProducts:['1–2 Elixir de Assassino Letal','1 Pó Brilhante']},
  {name:'Elixir de Detecção', group:'Elixires Base', effect:'Dano Adicional no Acerto Crítico +10%, por 10 min (tempo de recarga: 1 s)', produces:'1–4', children:[
    {name:'Óleo da Tempestade',qty:1}, {name:'Reagente em pó Puro',qty:6}, {name:'Trufa',qty:3}, {name:'Casca de Árvore Velha',qty:2}, {name:'Vestígio da Natureza',qty:3}
  ], note:'Alquimia (Hábil 1+) no Utensílio de Alquimia.',additionalProducts:['1–2 Elixir de Detecção Afiada','1 Pó Brilhante']},
  {name:'Elixir de Carnificina', group:'Elixires Base', effect:'Dano Adicional de Ataque Baixo +10%, por 10 min (tempo de recarga: 1 s)', produces:'1–4', children:[
    {name:'Óleo da Corrupção',qty:1}, {name:'Reagente em pó Puro',qty:7}, {name:'Cogumelo Tigre',qty:2}, {name:'Folha de Espírito',qty:2}, {name:'Vestígio da Natureza',qty:3}
  ], note:'Alquimia (Hábil 1+) no Utensílio de Alquimia.',additionalProducts:['1–2 Elixir de Carnificina Brutal','1 Pó Brilhante']},
  {name:'Elixir do Céu', group:'Elixires Base', effect:'Dano Adicional no Ataque Aéreo +10%, por 10 min (tempo de recarga: 1 s)', produces:'1–4', children:[
    {name:'Óleo de Tranquilidade',qty:1}, {name:'Reagente em pó Puro',qty:6}, {name:'Cogumelo Imperador',qty:1}, {name:'Laço de Árvore Sangrenta',qty:2}, {name:'Vestígio da Natureza',qty:4}
  ], note:'Alquimia (Hábil 1+) no Utensílio de Alquimia.',additionalProducts:['1–2 Elixir do Céu Impiedoso','1 Pó Brilhante']},
  { name:'Perfume de Coragem', group:'Perfumes', effect:'PA Total +20, HP Máximo +200, Velocidade de Ataque +5, Velocidade de Conjuração +5, Velocidade de Movimento +5, por 20 min', routes:[
    { label:'Receita base', children:[
      {name:'Óleo de Baleia Rei', qty:1},{name:'Vestígio da Natureza', qty:3},{name:'Laço de Árvore Sangrenta', qty:6},{name:'Água Purificada', qty:4},{name:'Reagente Líquido Limpo', qty:2},
    ]},
    { label:'Imortalidade', children:[{name:'Óleo da Imortalidade Decadente', qty:6},{name:'Perfume de Coragem', qty:1}]},
    { label:'Imortalidade ×10', children:[{name:'Óleo da Imortalidade Decadente', qty:60},{name:'Perfume de Coragem', qty:10},{name:'Essência de Ibellab', qty:1}]},
  ]},
  { name:'Perfume do Khalk', group:'Perfumes', effect:'Todas as Resistências +10%, Redução de Todos os Danos +15, HP Máximo +100, Velocidade de Movimento +5%, por 20 min', routes:[
    { label:'Receita base', children:[
      {name:'Pele de Khalk Fujão', qty:1},
      {name:'Seiva de Cedro Branco', qty:10},
      {name:'Vestígio da Natureza', qty:5},
      {name:'Água Purificada', qty:4},
      {name:'Óleo da Corrupção', qty:2},
    ]},
    { label:'Imortalidade', children:[{name:'Óleo da Imortalidade Decadente', qty:6},{name:'Perfume do Khalk', qty:1}]},
    { label:'Imortalidade ×10', children:[{name:'Óleo da Imortalidade Decadente', qty:60},{name:'Perfume do Khalk', qty:10},{name:'Essência de Ibellab', qty:1}]},
  ]},
  { name:'Perfume do Mar Profundo', group:'Perfumes', effect:'PA Total +10, Stamina Máxima +100, HP Máximo +100, Dano Adicional no Ataque por Trás +10%, Dano Adicional de Ataque Baixo +10%, Dano Adicional no Ataque Aéreo +10%, por 20 min', routes:[
    { label:'Receita base', children:[{name:'Óleo de Abismo', qty:1},{name:'Cristal de Coral', qty:2},{name:'Reagente Líquido Limpo', qty:5},{name:'Cogumelo Flecha', qty:5},{name:'Seiva de Cedro Branco', qty:5}]},
    { label:'Imortalidade', children:[{name:'Óleo da Imortalidade Decadente', qty:6},{name:'Perfume do Mar Profundo', qty:1}]},
    { label:'Imortalidade ×10', children:[{name:'Óleo da Imortalidade Decadente', qty:60},{name:'Perfume do Mar Profundo', qty:10},{name:'Essência de Ibellab', qty:1}]},
  ]},
  { name:'Perfume do Desejo', group:'Perfumes', effect:'PA Total +25, HP Máximo +500, Potencial de Velocidade de Ataque +5, Potencial de Velocidade de Conjuração +5, Potencial de Velocidade de Movimento +5, por 20 min', routes:[
    { label:'Alquimia', children:[
      {name:'Vestígio da Natureza', qty:5},
      {name:'Caroço de Árvore Vermelha', qty:5},
      {name:'Reagente Líquido Limpo', qty:5},
      {name:'Óleo da Corrupção', qty:6},
      {name:'Coral de Rusalka', qty:30},
    ]},
    { label:'Alquimia Simples', children:[{name:'Perfume de Coragem', qty:1},{name:'Pó Brilhante', qty:3},{name:'Essência de Caphras', qty:10}]},
    { label:'Imortalidade', children:[{name:'Óleo da Imortalidade Decadente', qty:6},{name:'Perfume do Desejo', qty:1}]},
    { label:'Imortalidade ×10', children:[{name:'Imortalidade: Perfume do Desejo', qty:10},{name:'Essência de Ibellab', qty:1},{name:'Pó Brilhante', qty:30},{name:'Essência de Caphras', qty:100}]},
  ]},
  { name:'Perfume da Perseverança', group:'Perfumes', effect:'PA Total +15, Stamina Máxima +100, HP Máximo +400, Dano Adicional no Ataque por Trás +10%, Dano Adicional de Ataque Baixo +10%, Dano Adicional no Ataque Aéreo +10%, por 20 min', routes:[
    { label:'Alquimia (tradicional)', children:[
      {name:'Vestígio da Natureza', qty:5},
      {name:'Folha de Espírito', qty:5},
      {name:'Reagente em pó Puro', qty:5},
      {name:'Óleo de Regeneração', qty:6},
      {name:'Coral de Rusalka', qty:30},
    ]},
    { label:'Alquimia Simples (via Mar Profundo)', children:[
      {name:'Perfume do Mar Profundo', qty:1},
      {name:'Pó Brilhante', qty:3},
      {name:'Essência de Caphras', qty:10},
    ]},
    { label:'Imortalidade', children:[{name:'Óleo da Imortalidade Decadente', qty:6},{name:'Perfume da Perseverança', qty:1}]},
    { label:'Imortalidade ×10', children:[{name:'Imortalidade: Perfume da Perseverança', qty:10},{name:'Essência de Ibellab', qty:1},{name:'Pó Brilhante', qty:30},{name:'Essência de Caphras', qty:100}]},
  ]},
  { name:'Perfume de Rapidez', group:'Perfumes', effect:'Peso +200LT, EXP de Vida +20%, Velocidade de Movimento/Coleta/Pesca +5, por 20 min', children:[
    {name:'Óleo de Baleia Rei', qty:1},
    {name:'Pó do Tempo', qty:4},
    {name:'Erva Eterna', qty:6},
    {name:'Água Purificada', qty:4},
    {name:'Reagente Líquido Limpo', qty:2},
  ]},
  { name:'Perfume da Sombra Verde', group:'Perfumes', effect:'Maestria de Vida +50, EXP de Vida +25%, Potencial de Velocidade de Movimento +5, Potencial de Velocidade de Coleta +5, Potencial de Velocidade de Pesca +5, Peso Máximo +300LT, por 20 min', routes:[
    { label:'Receita de Alquimia', children:[
      {name:'Vestígio da Natureza', qty:5},
      {name:'Erva Eterna', qty:5},
      {name:'Reagente Líquido Limpo', qty:5},
      {name:'Óleo de Tranquilidade', qty:6},
      {name:'Pó de Olivina Mágico', qty:50},
    ]},
    { label:'Alquimia Simples', children:[
      {name:'Perfume de Rapidez', qty:1},
      {name:'Pó Brilhante', qty:3},
      {name:'Pó de Olivina Mágico', qty:35},
    ]},
  ], note:'Alquimia (Hábil 1+) ou Alquimia Simples (Processamento L).'},
  { name:'Perfume de Espírito', group:'Perfumes', effect:'HP Máximo +300, Potencial de Acerto Crítico +5, MP/WP/SP +9 por acerto, por 20 min', routes:[
    { label:'Receita base', children:[{name:'Seiva de Árvore-Anel', qty:10},{name:'Fruto da Natureza', qty:1},{name:'Malva', qty:2, alternatives:[{name:'Flor Lilás',qty:2},{name:'Flor Amarela',qty:2},{name:'Flor Celestial',qty:2},{name:'Flor Azul',qty:2}]},{name:'Pó de Escuridão', qty:10},{name:'Essência de Árvore Morta', qty:1}]},
    { label:'Imortalidade', children:[{name:'Óleo da Imortalidade Decadente', qty:6},{name:'Perfume de Espírito', qty:1}]},
    { label:'Imortalidade ×10', children:[{name:'Óleo da Imortalidade Decadente', qty:60},{name:'Perfume de Espírito', qty:10},{name:'Essência de Ibellab', qty:1}]},
  ]},
  { name:'Perfume de Espírito da Respiração', group:'Perfumes', effect:'PA Adicional contra Monstros +5, PV Máximo +300, Chance de Crítico +5, MP/WP/SP +9 por acerto, por 20 min', routes:[
    { label:'Receita base', children:[{name:'Perfume de Espírito', qty:1},{name:'Respiro de Jade Estelar', qty:1}]},
    { label:'Produção ×10', children:[{name:'Perfume de Espírito', qty:10},{name:'Respiro de Jade Estelar', qty:10},{name:'Essência de Ibellab', qty:1}]},
    { label:'Imortalidade', children:[{name:'Óleo da Imortalidade Decadente', qty:6},{name:'Perfume de Espírito da Respiração', qty:1}]},
    { label:'Imortalidade ×10', children:[{name:'Perfume de Espírito da Respiração', qty:10},{name:'Essência de Ibellab', qty:1},{name:'Óleo da Imortalidade Decadente', qty:60}]},
  ]},
  { name:'Perfume do Encanto', group:'Perfumes', effect:'Esquiva Total +25, PV Máximo +750, Velocidade de Movimento +5%, por 20 min', routes:[
    { label:'Receita base', children:[{name:'Óleo do Encanto', qty:2},{name:'Pó Brilhante', qty:3},{name:'Erva Eterna', qty:5},{name:'Essência de Delotia', qty:1},{name:'Água Purificada', qty:3}]},
    { label:'Imortalidade', children:[{name:'Óleo da Imortalidade Decadente', qty:6},{name:'Perfume do Encanto', qty:1}]},
    { label:'Imortalidade ×10', children:[{name:'Óleo da Imortalidade Decadente', qty:60},{name:'Perfume do Encanto', qty:10},{name:'Essência de Ibellab', qty:1}]},
  ]},
  { name:'Perfume do Discernimento', group:'Perfumes', effect:'Precisão Total +15, PV Máximo +100, Potencial de Velocidade de Ataque +5, Potencial de Velocidade de Conjuração +5, Potencial de Velocidade de Movimento +5, por 20 min', routes:[
    { label:'Receita base', children:[{name:'Essência da Perspicácia', qty:1},{name:'Vestígio da Natureza', qty:3},{name:'Galho de Monge', qty:3},{name:'Água Purificada', qty:3},{name:'Pó de Rachadura', qty:5}]},
    { label:'Imortalidade', children:[{name:'Óleo da Imortalidade Decadente', qty:6},{name:'Perfume do Discernimento', qty:1}]},
    { label:'Imortalidade ×10', children:[{name:'Óleo da Imortalidade Decadente', qty:60},{name:'Perfume do Discernimento', qty:10},{name:'Essência de Ibellab', qty:1}]},
  ]},
  { name:'Refeição da Onda de Okilua', group:'Culinária', effect:'EXP de Navegação +25%, EXP de Permuta +25%, EXP de Marinheiro +10%, Maestria de Navegação +50, por 600 min (tempo de recarga: 30 min)', children:[{name:'Prato Especial de Frutos do Mar de Margoria',qty:3},{name:'Pão de Teff',qty:3},{name:'Salada de Carne de Baleia',qty:3},{name:'Filé de Peixe Vermelho do Monstro Marinho',qty:1}], note:'Culinária Simples (Processamento L). Substitui e remove o efeito de Refeição de Cron aplicado anteriormente.'},
  { name:'Sopa Nutritiva Milagrosa', group:'Culinária Especial', effect:'HP Máximo +200, Stamina Máxima +100, por 30 min (tempo de recarga: 22h)', children:[{name:'Carne de Tigre', qty:5},{name:'Água Mineral', qty:2},{name:'Cogumelo Ganoderma', qty:5},{name:'Jujuba', qty:5},{name:'Carne Pulsante', qty:1}]},
  { name:'Sopa de Bolinho de Arroz Milagroso', group:'Culinária Especial', effect:'Recupera HP Atual +5000 imediatamente (tempo de recarga: 22h)', children:[{name:'Carne de Porco', qty:1},{name:'Água Mineral', qty:1},{name:'Ovo', qty:1},{name:'Arroz Estranho e Magnífico', qty:50},{name:'Garae-Tteok', qty:1}]},
  { name:'Licor de Ameixa Colorido', group:'Culinária Especial', effect:'Redução de Todos os Danos +5, Todas as Resistências +5%, HP Máximo +300, por 30 min (tempo de recarga: 22h)', children:[{name:'Flor de Ameixa Colorida', qty:10},{name:'Ameixa', qty:10},{name:'Essência do Liquor', qty:5},{name:'Fermento', qty:2}], note:'Culinária Simples (Processamento L). Não pode ser usado junto com Sopa Nutritiva Milagrosa.'},
  { name:'Refeição Coreana Farta', group:'Culinária Especial', effect:'PA Adicional contra Monstros +5, EXP de Combate +1000%, por 3h (tempo de recarga: 3h)', note:'Oficina Real — obtido exclusivamente por meio da Oficina Real; os materiais internos do design não são necessários para a árvore de ingredientes.'},
  { name:'Doces e Chá Tradicionais', group:'Culinária Especial', effect:'PA Adicional contra Monstros +5, Taxa de Drop de Item +100%, por 3h (tempo de recarga: 3h)', note:'Oficina Real — obtido exclusivamente por meio da Oficina Real; os materiais internos do design não são necessários para a árvore de ingredientes.'},
  { name:'Kimchis Sortidos', group:'Culinária Especial', effect:'EXP de Vida +250%, Peso Máximo +100LT, por 3h (tempo de recarga: 3h)', note:'Oficina Real — obtido exclusivamente por meio da Oficina Real; os materiais internos do design não são necessários para a árvore de ingredientes.'},
  { name:'Yeolgujatang', group:'Culinária Especial', effect:'Maestria de Vida +500, Peso Máximo +100LT, por 3h (tempo de recarga: 3h)', note:'Oficina Real — obtido exclusivamente por meio da Oficina Real; os materiais internos do design não são necessários para a árvore de ingredientes.'},
  { name:'Remédio de Erva Misterioso', group:'Culinária Especial', effect:'Recuperação de Energia +50, Peso Máximo +100LT, por 3h (tempo de recarga: 3h)', note:'Oficina Real — obtido exclusivamente por meio da Oficina Real; os materiais internos do design não são necessários para a árvore de ingredientes.'},
  { name:'Gukbap de Mu-Duh', group:'Culinária Especial', effect:'Ganha EXP de Respiração imediatamente; somente se Respiração < 41. Tempo de recarga: 240 min', children:[{name:'Farinha de Arroz', qty:2},{name:'Arroz Cozido', qty:1},{name:'Água Mineral', qty:1},{name:'Alho', qty:2},{name:'Carne de Porco', qty:3}], note:'Culinária — Artesão 1+ e conhecimento de Gukbap de Mu-Duh.'},
  { name:'Gukbap de Dhal-Bhol', group:'Culinária Especial', effect:'Ganha EXP de Força imediatamente; somente se Força < 41. Tempo de recarga: 240 min', children:[{name:'Folha de Ansarina-Branca', qty:2},{name:'Arroz Cozido', qty:1},{name:'Água Mineral', qty:1},{name:'Samambaia', qty:2},{name:'Pó de Pimenta', qty:3}], note:'Culinária — Artesão 1+ e conhecimento de Gukbap de Dhal-Bhol.'},
  { name:'Gukbap do Concelho de Byot', group:'Culinária Especial', effect:'Ganha EXP de Saúde imediatamente; somente se Saúde < 41. Tempo de recarga: 240 min', children:[{name:'Acelga de Alta Qualidade', qty:1, alternatives:[{name:'Acelga', qty:2},{name:'Acelga Especial', qty:1}]},{name:'Arroz Cozido', qty:1},{name:'Água Mineral', qty:1},{name:'Rabanete', qty:2},{name:'Carne de Porco', qty:2}], note:'Culinária — Artesão 1+ e conhecimento de Gukbap do Concelho de Byot.'},
  { name:'Refeição Coreana Requintada', group:'Culinária Especial', effect:'PA Adicional contra Monstros +3, EXP de Combate +500%, por 3h (tempo de recarga: 3h)', note:'Oficina Real — obtido exclusivamente por meio da Oficina Real; os materiais internos do design não são necessários para a árvore de ingredientes.'},
  { name:'Tteoks Sortidos', group:'Culinária Especial', effect:'PA Adicional contra Monstros +3, Taxa de Drop de Item +50%, por 3h (tempo de recarga: 3h)', note:'Oficina Real — obtido exclusivamente por meio da Oficina Real; os materiais internos do design não são necessários para a árvore de ingredientes.'},
  { name:'Namul Tricolor', group:'Culinária Especial', effect:'EXP de Vida +150%, Peso Máximo +50LT, por 3h (tempo de recarga: 3h)', note:'Oficina Real — obtido exclusivamente por meio da Oficina Real; os materiais internos do design não são necessários para a árvore de ingredientes.'},
  { name:'Gujeolpan', group:'Culinária Especial', effect:'Maestria de Vida +300, Peso Máximo +50LT, por 3h (tempo de recarga: 3h)', note:'Oficina Real — obtido exclusivamente por meio da Oficina Real; os materiais internos do design não são necessários para a árvore de ingredientes.'},
  { name:'Remédio de Erva Sutil', group:'Culinária Especial', effect:'Recuperação de Energia +25, Peso Máximo +50LT, por 3h (tempo de recarga: 3h)', note:'Oficina Real — obtido exclusivamente por meio da Oficina Real; os materiais internos do design não são necessários para a árvore de ingredientes.'},
  { name:'Essência Espiritual de Ornette', group:'Itens Tesouro', effect:'Recuperação de HP +550; instantânea; recarga de 2s; não desaparece ao usar. 45% mais eficaz se usada enquanto imobilizado.', routes:[{label:'Montagem do tesouro',image:'ornette-combinacao.png',children:[{name:'Essência Espiritual Abençoada Maior',qty:1},{name:'Pedra do Som do Espírito Musical',qty:1},{name:'Pedra da Coragem de Gayak',qty:1}]}], note:'Estágio 3 (final) — combine com a última peça rara que sobrou (Cápsula de Sherakhan, Espiritualidade de Ron ou Kagtunak — a que você ainda não usou nos estágios 1 e 2) na Bolsa de Combinações de Yaz. As 3 peças raras podem ser usadas em qualquer ordem entre os estágios 1, 2 e 3.'},
  { name:'Essência Espiritual de Odore', group:'Itens Tesouro', effect:'Recuperação de MP/WP/SP +375; instantânea; recarga de 5s; não desaparece ao usar. 45% mais eficaz se usada enquanto imobilizado.', routes:[{label:'Montagem do tesouro',image:'odore-combinacao.png',children:[{name:'Essência Espiritual Abençoada Maior (Odore)',qty:1},{name:'Pedra do Amanhecer do Corvo Noturno',qty:1},{name:'Pedra do Guardião Krogdalo',qty:1}]}], note:'Estágio 3 (final) — combine com a última peça rara que sobrou (Lágrima Vermelha de Nakk, Glândula de Makhtanan ou Semblante de Valtarra — a que você ainda não usou nos estágios 1 e 2) na Bolsa de Combinações de Yaz. As 3 peças raras podem ser usadas em qualquer ordem entre os estágios 1, 2 e 3.'},
  { name:'Bússola Atualizada de Lafi Bedmountain', group:'Itens Tesouro', effect:'Mostra sua localização no Deserto e Grande Oceano e permite convocar membros do grupo para sua posição.', routes:[{label:'Montagem do tesouro',image:'bussola-combinacao.png',children:[{name:'Peça da Bússola Atualizada — Vodkhan',qty:1},{name:'Peça da Bússola Atualizada — Elten',qty:1},{name:'Peça da Bússola Atualizada — Aakman',qty:1},{name:'Rubi Sangrento',qty:1},{name:'Safira Oceânica',qty:1},{name:'Topázio Dourado',qty:1}]}], note:'Tesouro — 3 peças raras + 3 gemas. As peças são obtidas em Aakman e Hystria; as gemas podem ser produzidas ou compradas no Mercado Central.'},
  { name:'Mapa de Arqueólogo', group:'Itens Tesouro', effect:'Teleporta para uma cidade visitada e permite retornar ao ponto de origem dentro das condições do tesouro; recarga de 6h.', routes:[{label:'Montagem do tesouro',image:'mapa-arqueologo-combinacao.png',children:[{name:'Peça do Mapa — Tukar',qty:1},{name:'Peça do Mapa — Devourer',qty:1},{name:'Peça do Mapa — Warder',qty:1},{name:'Peça do Mapa — Deportee',qty:1},{name:'Rubi de Sangue',qty:1},{name:'Safira Oceânica',qty:1},{name:'Topázio Dourado',qty:1},{name:'Esmeralda Florestal',qty:1}]}], note:'Tesouro — 4 peças diferentes do mapa + 4 gemas. As peças vêm de Roud Sulfur Mine e Pila Ku Jail; as gemas podem ser produzidas ou compradas no Mercado Central.'},
  { name:"Brilho de Evenruth", group:'Itens Tesouro', effect:'No Carrack ou Panokseon, após usar Vela Ligeira (BreezySail), permite uma Vela Ligeira adicional sem consumir Stamina, e aumenta a distância dessa Vela Ligeira em 50%.', routes:[{label:'Montagem do tesouro',image:'evenruth-combinacao.png',children:[{name:'Brilho com um desenho',qty:1},{name:'Evenruth',qty:1}]},{label:'Compra direta',children:[{name:'Moeda de Corvo',qty:2000000}]}], note:'Tesouro marítimo — combine o Brilho com um desenho com o Evenruth na Bolsa de Combinações de Yaz. Também comprável direto da NPC Ravinia, em Crow\'s Nest, por 2.000.000 de Moedas de Corvo.'},
  { name:'Anel de Comerciante Rico', group:'Itens Tesouro', effect:'Aumenta em +5% o valor de prata recebido das vendas no Mercado Central.', routes:[{label:'Montagem do tesouro',image:'comerciante-rico-combinacao.png',children:[{name:'Fragmento do Anel de Al Yurad — Floresta de Cinzas',qty:1},{name:'Fragmento do Anel de Al Yurad — Ilha de Padix',qty:1},{name:'Fragmento do Anel de Al Yurad — Sycraia',qty:1},{name:'Fragmento do Anel de Al Yurad — Cripta dos Pensamentos em Repouso',qty:1},{name:'Fragmento do Anel de Al Yurad — Vale de Olun',qty:1},{name:'Coral Vermelho',qty:1},{name:'Coral Azul',qty:1},{name:'Rubi Bruto',qty:1},{name:'Rubi',qty:1},{name:'Rubi Resplandecente',qty:1},{name:'Safira Bruta',qty:1},{name:'Safira',qty:1},{name:'Safira Resplandecente',qty:1},{name:'Topázio Resplandecente',qty:1}]}], note:'Tesouro — 5 fragmentos do Anel de Al Yurad (loot raríssimo, um por zona) + 9 materiais de gema em cascata (mineração → moagem → moagem novamente).'},
  { name:'Retiro de Krogdalo', group:'Itens Tesouro', effect:'Permite armazenar e recuperar um de cada Cavalo Mítico — Arduanatt Mítico, Diné Mítico e Doom Mítico — a qualquer momento.', note:'Tesouro obtido por linha de missões. É necessário possuir os três Cavalos Míticos e concluir a linha [Retiro de Krogdalo] com Merindora e Krogdalo.'},
  { name:'Lâmpada Flutuante de Remitaronsom', group:'Itens Tesouro', effect:'Quando instalada na Carroça do Caminho da Floresta de Peridoto, restaura continuamente a energia/durabilidade da carroça.', routes:[{label:'Montagem do tesouro',image:'lampada-remitaronsom-combinacao.png',children:[{name:'Fragmento de Luz das Fadas',qty:4},{name:'Lumentrace',qty:1}]}], note:'Tesouro de Treinamento — combine na Bolsa de Combinações de Yaz em formato de cruz [+]. Os dois materiais vêm por chance da Entrega de Cavalo Imperial (Nível 15+); o Lumentrace só é obtido com Corcéis Imperiais adquiridos após a atualização que introduziu o item.'},
  { name:'Telescópio Reforçado de Lafi Bedmountain', group:'Itens Tesouro', effect:'Teleporta o usuário para a localização de um membro online do grupo ou da guilda no mesmo servidor; recarga de 10h.', routes:[{label:'Montagem do tesouro',image:'telescopio-combinacao.png',children:[{name:'Peça do Telescópio Reforçado — 1',qty:1},{name:'Peça do Telescópio Reforçado — 2',qty:1},{name:'Peça do Telescópio Reforçado — 3',qty:1},{name:'Diamante Estelar',qty:1},{name:'Topázio Dourado',qty:1}]}], note:'Tesouro — 3 peças únicas + Diamante Estelar + Topázio Dourado. As peças vêm principalmente das áreas de Ulukita; uma delas também pode ser obtida trocando 3 peças específicas da Bússola com Ulubala.'},
  { name:'Estrela de Nostos', group:'Itens Tesouro', effect:'Permite equipar o tesouro no acampamento e retornar a uma residência ou mansão; recarga de 30 min por personagem.', routes:[{label:'Montagem do tesouro',image:'estrela-nostos-combinacao.png',children:[{name:'Cristal da Terra',qty:1},{name:'Árvore do Tempo',qty:1},{name:'Essência da Vida',qty:1},{name:'Cristal do Minério',qty:1},{name:'Alma Selvagem',qty:1},{name:'Pele da Essência da Natureza',qty:1}]}], note:'Tesouro de Coleta — cada um dos 6 componentes é craftado via Alquimia Simples (Processamento, tecla L) a partir de 1.000 materiais brutos da coleta correspondente + 100 Essências da Natureza. Depois, os 6 componentes são combinados na Bolsa de Combinações de Yaz.'},
  { name:'Poção de HP (P)', group:'Poções', effect:'HP Atual +100.', note:'Poção comum — comprada com o Vendedor de Bens Gerais.'},
  { name:'Poção de HP (M)', group:'Poções', effect:'HP Atual +250.', children:[{name:'Poção de HP (P)', qty:3}], note:'Alquimia Simples (Processamento L) — também pode ser comprada com o Vendedor de Bens Gerais.'},
  { name:'Poção de HP (G)', group:'Poções', effect:'HP Atual +350.', children:[{name:'Poção de HP (M)', qty:3}], note:'Alquimia Simples (Processamento L).'},
  { name:'Poção de MP (P)', group:'Poções', effect:'MP/WP/SP Atual +125.', note:'Poção comum — comprada com o Vendedor de Bens Gerais.'},
  { name:'Poção de MP (M)', group:'Poções', effect:'MP/WP/SP Atual +175.', children:[{name:'Poção de MP (P)', qty:3}], note:'Alquimia Simples (Processamento L) — também pode ser comprada com o Vendedor de Bens Gerais.'},
  { name:'Poção de MP (G)', group:'Poções', effect:'MP/WP/SP Atual +250.', children:[{name:'Poção de MP (M)', qty:3}], note:'Alquimia Simples (Processamento L).'},
  { name:'Poção de Tendão de Baleia', group:'Poções', effect:'HP Atual +1200; MP/WP/SP Atual +300. Recarga: 30s.', children:[{name:'Tendão de Baleia Azul', qty:1},{name:'Poção de HP (M)', qty:3},{name:'Poção de MP (M)', qty:3},{name:'Água Purificada', qty:8}], note:'Alquimia — Aprendiz 1+. Produz 10 unidades por fabricação em Ferramenta de Alquimia na residência. Há pequena chance de obter 1–3 unidades da versão Superior com Alquimia Hábil 5+.'},
  { name:'Poção de Tendão de Baleia Superior', group:'Poções', effect:'HP Atual +1800; MP/WP/SP Atual +500. Recarga: 30s.', children:[{name:'Poção de Tendão de Baleia', qty:3},{name:'Reagente Azul', qty:1}], note:'Alquimia Simples (Processamento, tecla L).'},
  { name:'Cerveja', group:'Trabalhadores energia', effect:'Recupera +2 Pontos de Ação de Trabalhador.', children:[{name:'Grão', qty:5, source:'Trigo, Cevada, Batata, Milho ou Batata-doce'},{name:'Água Mineral', qty:6},{name:'Fermento', qty:2},{name:'Açúcar', qty:1}], note:'Culinária — Novato 1+. Há uma pequena chance de obter Chope Gelado ao produzir Cerveja com Culinária Hábil 1+.'},
  { name:'Chope Gelado', group:'Trabalhadores energia', effect:'Recupera +3 Pontos de Ação de Trabalhador.', note:'Obtido como produto adicional ao produzir Cerveja com Culinária Hábil 1+.'},
  { name:'Carne de Pássaro Grelhada', group:'Trabalhadores energia', effect:'Recupera +3 Pontos de Ação de Trabalhador.', children:[{name:'Frango', qty:2, source:'Produção de Frango em Fazenda ou Mercado Central'},{name:'Óleo para Fritura', qty:6},{name:'Sal', qty:1},{name:'Vinho para Cozinha', qty:2}], note:'Culinária — Novato 1+. Pode usar carne de Frango, Ave Kuku ou Flamingo. Há uma pequena chance de obter Carne de Pássaro Bem Grelhada com Culinária Hábil 1+.'},
  { name:'Carne de Pássaro Bem Grelhada', group:'Trabalhadores energia', effect:'Recupera +4 Pontos de Ação de Trabalhador.', note:'Obtido como produto adicional ao produzir Carne de Pássaro Grelhada com Culinária Hábil 1+.'},
  { name:'Aveia Refinada', group:'Trabalhadores energia', effect:'Recupera +6 Pontos de Ação de Trabalhador.', note:'Obtido como produto adicional ao produzir Aveia com Culinária Hábil 9+.'},
  { name:'Salgadinho Delicioso de Filé de Peixe', group:'Trabalhadores energia', effect:'Recupera +6 Pontos de Ação de Trabalhador.', note:'Obtido como produto adicional ao produzir Salgado de Filé de Peixe com Culinária Hábil 9+.'},
  { name:'Ensopado de Cobra Freekeh Forte', group:'Trabalhadores energia', effect:'Recupera +6 Pontos de Ação de Trabalhador.', note:'Obtido como produto adicional ao produzir Ensopado de Cobra Freekeh com Culinária Profissional 1+.'},
  { name:'Torta de Queijo de Alta Qualidade', group:'Trabalhadores energia', effect:'Recupera +8 Pontos de Ação de Trabalhador.', note:'Obtido como produto adicional ao produzir Torta de Queijo com Culinária Profissional 3+.'},
  { name:'Refeição Simples de Cron', group:'Culinária', effect:'PA Adicional contra Monstros +30, EXP de Combate +20%, EXP de Habilidade +10%, Velocidade de Ataque/Conjuração +2, Velocidade de Movimento +3, Acerto Crítico +2, HP Máximo +150, Chance de Obter Conhecimento +10%, Chance de Obter Conhecimento Superior +5%, Peso Máximo +100LT, Dano de Ataque pelas Costas +5%, Dano de Acerto Crítico +5%, Redução de Dano de Monstro +6%, Resistência à Insolação/Hipotermia +10%, por 120 min', routes:[
    { label:'Rota 1', children:[
      {name:'Ração de Combate do Cavaleiro', qty:1},
      {name:'Refeição de Mediah', qty:3},
      {name:'Refeição de Valência', qty:3},
      {name:'Tempero de Cron Ancestral', qty:1},
    ]},
    { label:'Rota 2', children:[
      {name:'Refeição de Drieghan Especial', qty:1},
      {name:'Refeição de Serendia', qty:3},
      {name:'Refeição de Mediah', qty:3},
      {name:'Tempero de Cron Ancestral', qty:1},
    ]},
  ]},
  { name:'Bênção de Criatura Mística - PA Total', group:'Pergaminhos', effect:'PA Total +15 por 60 min (cooldown de 10s)', routes:[
    { label:'Produção ×10', children:[
      {name:'Pedra da Luz do Fogo: Raiva', qty:1},
      {name:'Restos de Criatura Mística', qty:10},
      {name:'Pergaminho Misterioso', qty:10, alt:{name:'Couro Supremo', qty:100}},
      {name:'Cristal Mágico de Pedra de Luz', qty:350},
    ]},
    { label:'Produção ×100', children:[
      {name:'Pedra da Luz do Fogo: Raiva', qty:1},
      {name:'Restos de Criatura Mística', qty:100},
      {name:'Pergaminho Misterioso', qty:100, alt:{name:'Couro Supremo', qty:1000}},
      {name:'Cristal Mágico de Pedra de Luz', qty:3600},
      {name:'Pó de Pedra Negra', qty:1},
    ]},
  ]},
  { name:'Bênção de Criatura Mística - Precisão', group:'Pergaminhos', effect:'Precisão Total +20 por 60 min (cooldown de 10s)', routes:[
    { label:'Produção ×10', children:[
      {name:'Pedra da Luz do Fogo: Alvo', qty:1},
      {name:'Restos de Criatura Mística', qty:10},
      {name:'Pergaminho Misterioso', qty:10, alt:{name:'Couro Supremo', qty:100}},
      {name:'Cristal Mágico de Pedra de Luz', qty:350},
    ]},
    { label:'Produção ×100', children:[
      {name:'Pedra da Luz do Fogo: Alvo', qty:1},
      {name:'Restos de Criatura Mística', qty:100},
      {name:'Pergaminho Misterioso', qty:100, alt:{name:'Couro Supremo', qty:1000}},
      {name:'Cristal Mágico de Pedra de Luz', qty:3600},
      {name:'Pó de Pedra Negra', qty:1},
    ]},
  ]},
  { name:'Bênção de Criatura Mística - Redução de Dano', group:'Pergaminhos', effect:'Redução de Dano Total +15 por 60 min (cooldown de 10s)', routes:[
    { label:'Produção ×10', children:[
      {name:'Pedra da Luz da Terra: Parede de Ferro', qty:1},
      {name:'Restos de Criatura Mística', qty:10},
      {name:'Pergaminho Misterioso', qty:10, alt:{name:'Couro Supremo', qty:100}},
      {name:'Cristal Mágico de Pedra de Luz', qty:350},
    ]},
    { label:'Produção ×100', children:[
      {name:'Pedra da Luz da Terra: Parede de Ferro', qty:1},
      {name:'Restos de Criatura Mística', qty:100},
      {name:'Pergaminho Misterioso', qty:100, alt:{name:'Couro Supremo', qty:1000}},
      {name:'Cristal Mágico de Pedra de Luz', qty:3600},
      {name:'Pó de Pedra Negra', qty:1},
    ]},
  ]},
  { name:'Bênção de Criatura Mística - Evasão', group:'Pergaminhos', effect:'Esquiva Total +20 por 60 min (cooldown de 10s)', routes:[
    { label:'Produção ×10', children:[
      {name:'Pedra da Luz da Terra: Onda', qty:1},
      {name:'Restos de Criatura Mística', qty:10},
      {name:'Pergaminho Misterioso', qty:10, alt:{name:'Couro Supremo', qty:100}},
      {name:'Cristal Mágico de Pedra de Luz', qty:350},
    ]},
    { label:'Produção ×100', children:[
      {name:'Pedra da Luz da Terra: Onda', qty:1},
      {name:'Restos de Criatura Mística', qty:100},
      {name:'Pergaminho Misterioso', qty:100, alt:{name:'Couro Supremo', qty:1000}},
      {name:'Cristal Mágico de Pedra de Luz', qty:3600},
      {name:'Pó de Pedra Negra', qty:1},
    ]},
  ]},
  { name:'Bênção de Criatura Mística - HP Máximo', group:'Pergaminhos', effect:'PV Máximo +100 por 60 min (cooldown de 10s)', routes:[
    { label:'Produção ×10', children:[
      {name:'Pedra da Luz do Vento: Coração', qty:1},
      {name:'Restos de Criatura Mística', qty:10},
      {name:'Pergaminho Misterioso', qty:10, alt:{name:'Couro Supremo', qty:100}},
      {name:'Cristal Mágico de Pedra de Luz', qty:350},
    ]},
    { label:'Produção ×100', children:[
      {name:'Pedra da Luz do Vento: Coração', qty:1},
      {name:'Restos de Criatura Mística', qty:100},
      {name:'Pergaminho Misterioso', qty:100, alt:{name:'Couro Supremo', qty:1000}},
      {name:'Cristal Mágico de Pedra de Luz', qty:3600},
      {name:'Pó de Pedra Negra', qty:1},
    ]},
  ]},
  { name:'Bênção de Criatura Mística - Maestria de Vida', group:'Pergaminhos', effect:'Maestria de Habilidade de Vida +100 por 60 min (cooldown de 10s)', routes:[
    { label:'Produção ×10', children:[
      {name:'Pedra da Luz da Grama Incompleta', qty:1},
      {name:'Restos de Criatura Mística', qty:10},
      {name:'Pergaminho Misterioso', qty:10, alt:{name:'Couro Supremo', qty:100}},
      {name:'Cristal Mágico de Pedra de Luz', qty:350},
    ]},
    { label:'Produção ×100', children:[
      {name:'Pedra da Luz da Grama Incompleta', qty:1},
      {name:'Restos de Criatura Mística', qty:100},
      {name:'Pergaminho Misterioso', qty:100, alt:{name:'Couro Supremo', qty:1000}},
      {name:'Cristal Mágico de Pedra de Luz', qty:3600},
      {name:'Pó de Pedra Negra', qty:1},
    ]},
  ]},
  {name:'Biscoito de Aloés', group:'Culinária', children:[{name:'Aloés',qty:5}, {name:'Massa de Trigo',qty:7}, {name:'Mel de Cozinha',qty:3}, {name:'Açúcar',qty:4, alternatives:[{name:'Açúcar Mascavo',qty:2}]}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Iogurte de Aloés', group:'Culinária', children:[{name:'Aloés',qty:5}, {name:'Leite',qty:2}, {name:'Açúcar',qty:3}, {name:'Fermento',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Acompanhamentos Variados', group:'Culinária', children:[{name:'Lula',qty:1}, {name:'Maçã',qty:5}, {name:'Queijo',qty:3}, {name:'Pássaro Frito',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Marmita de Balacs', group:'Culinária', children:[{name:'Sanduíche Eil',qty:2}, {name:'Suco de Yuzu',qty:2}, {name:'Bala de Yuzu',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Refeição de Balenos', group:'Culinária', children:[{name:'Queijo Gratinado',qty:1, alternatives:[{name:'Queijo Gratinado Gostoso',qty:1}]}, {name:'Croquete de Carne',qty:1}, {name:'Filé de Peixe Defumado',qty:1}, {name:'Legumes Refogados',qty:2}, {name:'Cerveja',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Mexido de Broto de Feijão', group:'Culinária', children:[{name:'Broto de Feijão',qty:6}, {name:'Folha de Perila',qty:1}, {name:'Sal',qty:1}, {name:'Pó de Pimenta Vermelha',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Ovos de Pássaros Cozidos', group:'Culinária', children:[{name:'Ovo',qty:3}, {name:'Água Mineral',qty:6, alternatives:[{name:'Água Purificada',qty:3}]}, {name:'Vinho para Cozinha',qty:1, alternatives:[{name:'Vinho Gastronômico',qty:1}]}, {name:'Sal',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Borscht', group:'Culinária', children:[{name:'Carne-Seca Perfumada',qty:7}, {name:'Leite',qty:3}, {name:'Canela',qty:1}, {name:'Água Mineral',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Gelatina de Trigo-Sarraceno', group:'Culinária', children:[{name:'Trigo-Sarraceno',qty:5}, {name:'Sal',qty:1}, {name:'Água Mineral',qty:1}, {name:'Molho de Soja',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Lagosta Assada em Manteiga', group:'Culinária', children:[{name:'Lagosta',qty:1}, {name:'Manteiga',qty:4}, {name:'Sal',qty:5}, {name:'Azeite de Oliva',qty:5}, {name:'Alho',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Refeição de Calpheon', group:'Culinária', children:[{name:'Pão Macio',qty:2}, {name:'Chá com Leite',qty:1, alternatives:[{name:'Chá com Leite Suave',qty:1}]}, {name:'Salada de Filé de Peixe',qty:1}, {name:'Torta de Queijo',qty:1}, {name:'Macarrão com Carne',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Cenoura Confit', group:'Rações', produces:'1', children:[{name:'Cenoura Especial',qty:2}, {name:'Água Mineral',qty:6, alternatives:[{name:'Água Purificada',qty:3}]}, {name:'Torrão de Açúcar Mascavo',qty:3}, {name:'Sal',qty:2}, {name:'Canela',qty:4}], note:'Produção: 1 unidade.'},
  {name:'Ensopado de Batata e Cogumelo Oriole', group:'Culinária', children:[{name:'Cogumelo Oriole',qty:2}, {name:'Batata',qty:5}, {name:'Cebola',qty:1}, {name:'Repolho',qty:2}, {name:'Água Mineral',qty:5}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Mingau de Cogumelo Oriole', group:'Culinária', children:[{name:'Cogumelo Oriole',qty:2}, {name:'Trigo',qty:5}, {name:'Cebola',qty:1}, {name:'Sal',qty:2}, {name:'Água Mineral',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Risoto de Cogumelo Oriole', group:'Culinária', children:[{name:'Cogumelo Oriole',qty:2}, {name:'Trigo',qty:5}, {name:'Molho Branco',qty:1}, {name:'Manteiga',qty:1}, {name:'Azeite de Oliva',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Ensopado de Cogumelo Oriole', group:'Culinária', children:[{name:'Cogumelo Oriole',qty:3}, {name:'Pimenta',qty:1}, {name:'Molho Vermelho',qty:1}, {name:'Água Mineral',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Queijo Gratinado', group:'Culinária', children:[{name:'Salsicha Grelhada',qty:1}, {name:'Massa de Trigo',qty:5}, {name:'Repolho',qty:4}, {name:'Queijo',qty:3}, {name:'Molho Vermelho',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Torta de Queijo', group:'Culinária', children:[{name:'Massa de Trigo',qty:4}, {name:'Queijo',qty:7}, {name:'Manteiga',qty:3}, {name:'Ovo',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Salada de Peito de Frango', group:'Culinária', children:[{name:'Carne de Frango',qty:5}, {name:'Fruta',qty:5}, {name:'Legume',qty:5}, {name:'Vinagre',qty:1}, {name:'Vinho para Cozinha',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Chowder', group:'Culinária', children:[{name:'Marisco Desidratado',qty:5, alternatives:[{name:'Marisco de Pérola Desidratado',qty:1}]}, {name:'Pimenta-do-Reino',qty:2}, {name:'Carne de Porco',qty:2}, {name:'Leite',qty:1}, {name:'Pão de Teff',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Bala de Yuzu', group:'Culinária', children:[{name:'Yuzu',qty:1}, {name:'Mel de Cozinha',qty:1}, {name:'Açúcar Bruto',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Sidra de Yuzu', group:'Culinária', children:[{name:'Yuzu',qty:5}, {name:'Essência do Liquor',qty:3}, {name:'Açúcar',qty:1}, {name:'Fermento',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Suco de Yuzu', group:'Culinária', children:[{name:'Yuzu',qty:5}, {name:'Açúcar',qty:3}, {name:'Água Mineral',qty:5}, {name:'Mel de Cozinha',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Vinagre de Yuzu', group:'Culinária', children:[{name:'Yuzu',qty:2}, {name:'Fermento',qty:1}, {name:'Açúcar',qty:1}, {name:'Água Mineral',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Coquetel de Coco', group:'Culinária', children:[{name:'Coco',qty:2}, {name:'Makgeolli',qty:1}, {name:'Essência do Liquor',qty:2}, {name:'Maçã',qty:1}, {name:'Água Mineral',qty:5}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Peixe Coco Frito', group:'Culinária', children:[{name:'Coco',qty:3}, {name:'Peixe',qty:1}, {name:'Ovo',qty:2}, {name:'Massa de Trigo',qty:3}, {name:'Óleo para Fritura',qty:4}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Macarrão de Coco', group:'Culinária', children:[{name:'Coco',qty:2}, {name:'Cebola',qty:2}, {name:'Alho',qty:4}, {name:'Massa de Trigo',qty:5}, {name:'Molho Branco',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Arroz Cozido', group:'Culinária', children:[{name:'Arroz',qty:5, alternatives:[{name:'Arroz de Alta Qualidade',qty:2},{name:'Arroz Especial',qty:1}]}, {name:'Água Límpida',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Cuscuz', group:'Culinária', children:[{name:'Ensopado de Cobra Freekeh',qty:1, alternatives:[{name:'Ensopado de Cobra Freekeh Forte',qty:1}]}, {name:'Massa de Teff',qty:6}, {name:'Noz-Moscada',qty:3}, {name:'Repolho',qty:4}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Gukbap de Dhal-Bohl', group:'Culinária', children:[{name:'Folha de Coentro',qty:2}, {name:'Arroz Cozido',qty:1}, {name:'Água Mineral',qty:1}, {name:'Samambaia',qty:2}, {name:'Pó de Pimenta Vermelha',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Pudim Escuro', group:'Culinária', children:[{name:'Aveia',qty:1, alternatives:[{name:'Aveia Refinada',qty:1}]}, {name:'Legumes em Conserva',qty:1}, {name:'Frango',qty:5}, {name:'Sangue de Porco',qty:7}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Vinho de Tamareira', group:'Culinária', children:[{name:'Tâmara',qty:5}, {name:'Essência do Liquor',qty:2}, {name:'Açúcar',qty:1}, {name:'Fermento',qty:4}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Suco de Delotia', group:'Culinária', children:[{name:'Delotia',qty:4}, {name:'Maçã',qty:5}, {name:'Açúcar',qty:3, alternatives:[{name:'Açúcar Mascavo',qty:1}]}, {name:'Água Purificada',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Chá com Leite de Delotia', group:'Culinária', children:[{name:'Delotia',qty:4}, {name:'Leite',qty:3}, {name:'Mel de Cozinha',qty:3}, {name:'Água Purificada',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Pudim de Delotia', group:'Culinária', children:[{name:'Delotia',qty:5}, {name:'Sangue de Lobo',qty:7}, {name:'Licor de Mel',qty:2, alternatives:[{name:'Licor de Mel Picante',qty:1}]}, {name:'Aveia',qty:1}, {name:'Água Purificada',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Tartar de Delotia', group:'Culinária', children:[{name:'Delotia',qty:3}, {name:'Leite',qty:2}, {name:'Farinha',qty:5}, {name:'Ovo',qty:1}, {name:'Água Purificada',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Bolinho do Deserto', group:'Culinária', children:[{name:'Carne de Lagarto',qty:6}, {name:'Massa de Trigo',qty:6}, {name:'Canela',qty:1}, {name:'Azeite de Oliva',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Dongchimi', group:'Culinária', children:[{name:'Rabanete',qty:5}, {name:'Alho',qty:2}, {name:'Sal',qty:1}, {name:'Água Mineral',qty:5}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Tempero', group:'Culinária', children:[{name:'Ovo',qty:1}, {name:'Água Mineral',qty:1}, {name:'Azeite de Oliva',qty:1}, {name:'Sal',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Refeição de Eil', group:'Culinária', children:[{name:'Risoto de Cogumelo Oriole',qty:1, alternatives:[{name:'Risoto de Cogumelo Oriole bem Aromático',qty:1}]}, {name:'Ensopado de Batata e Cogumelo Oriole',qty:1}, {name:'Carne Frita com Cogumelo Oriole',qty:1}, {name:'Sorbet de Frutas',qty:2}, {name:'Makgeolli de Cogumelo Sanghwang',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Sanduíche Eil', group:'Culinária', children:[{name:'Yuzu',qty:2, alternatives:[{name:'Yuzu de Alta Qualidade',qty:1},{name:'Yuzu Especial',qty:1}]}, {name:'Pão Macio',qty:2}, {name:'Ovo',qty:4}, {name:'Repolho',qty:5}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Refeição Energética de Cron', group:'Culinária', routes:[
    {label:'Receita 1 — Refeição de Mediah', children:[{name:'Refeição de Drieghan Especial',qty:1},{name:'Refeição de Serendia',qty:3},{name:'Refeição de Mediah',qty:3},{name:'Tempero de Cron Ancestral',qty:1}]},
    {label:'Receita 2 — Refeição de Mediah Especial', children:[{name:'Refeição de Drieghan Especial',qty:1},{name:'Refeição de Serendia',qty:3},{name:'Refeição de Mediah Especial',qty:1},{name:'Tempero de Cron Ancestral',qty:1}]}
  ], note:'Culinária Simples (Processamento L). A Refeição de Mediah Especial substitui 3 Refeições de Mediah na proporção 1:3.'},
  {name:'Essência do Liquor', group:'Culinária', children:[{name:'Farinha',qty:1}, {name:'Fruta',qty:1}, {name:'Fermento',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Refeição de Iguarias de Cron', group:'Culinária', children:[{name:'Refeição de Serendia',qty:3}, {name:'Refeição Especial de Arehaza',qty:1}, {name:'Refeição de Kamasylvia',qty:3}, {name:'Tempero de Cron Ancestral',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Torta de Figo', group:'Culinária', children:[{name:'Figo',qty:5}, {name:'Massa de Trigo',qty:3}, {name:'Açúcar',qty:3}, {name:'Azeite de Oliva',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Salgado de Filé de Peixe', group:'Culinária', children:[{name:'Peixe',qty:2}, {name:'Molho Branco',qty:3}, {name:'Farinha',qty:7}, {name:'Sal',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Salada de Filé de Peixe', group:'Culinária', children:[{name:'Peixe',qty:1}, {name:'Tempero',qty:2}, {name:'Cebola',qty:3}, {name:'Queijo',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Sopa de Peixe', group:'Culinária', children:[{name:'Peixe',qty:1}, {name:'Farinha',qty:3}, {name:'Creme',qty:2}, {name:'Água Mineral',qty:6}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Sopa de Frango com Grãos', group:'Culinária', children:[{name:'Carne Moída de Pássaro',qty:2}, {name:'Água Mineral',qty:2}, {name:'Trigo',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Sanduíche Frank', group:'Culinária', children:[{name:'Salsicha Grelhada',qty:2}, {name:'Pão Macio',qty:1}, {name:'Legume',qty:2}, {name:'Molho Vermelho',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Ensopado de Cobra Freekeh', group:'Culinária', children:[{name:'Carne de Cobra',qty:3}, {name:'Freekeh',qty:6}, {name:'Anis Estrelar',qty:2}, {name:'Água Mineral',qty:5}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Pássaro Frito', group:'Culinária', children:[{name:'Frango',qty:7}, {name:'Farinha de Trigo',qty:4}, {name:'Ovo',qty:2}, {name:'Pimenta-do-Reino',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Peixe Frito', group:'Culinária', children:[{name:'Peixe',qty:1}, {name:'Farinha',qty:3}, {name:'Óleo para Fritura',qty:2, alternatives:[{name:'Óleo de Gergelim',qty:2}]}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Legumes Fritos', group:'Culinária', children:[{name:'Repolho',qty:4, alternatives:[{name:'Pimenta',qty:6},{name:'Cebola',qty:6}]}, {name:'Óleo para Fritura',qty:6, alternatives:[{name:'Óleo de Gergelim',qty:6}]}, {name:'Massa de Trigo',qty:3}, {name:'Ovo',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Salada de Frutas e Legumes', group:'Culinária', children:[{name:'Fruta',qty:4}, {name:'Legume',qty:4}, {name:'Vinagre',qty:1}, {name:'Vinho para Cozinha',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Suco de Fruta', group:'Culinária', children:[{name:'Fruta',qty:4}, {name:'Açúcar',qty:3}, {name:'Água Mineral',qty:5}, {name:'Sal',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Torta de Fruta', group:'Culinária', children:[{name:'Fruta',qty:6}, {name:'Massa de Trigo',qty:6}, {name:'Creme',qty:3}, {name:'Açúcar',qty:4}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Pudim de Fruta', group:'Culinária', children:[{name:'Fruta',qty:5}, {name:'Creme',qty:1}, {name:'Leite',qty:3}, {name:'Açúcar',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Sorbet de Frutas', group:'Culinária', children:[{name:'Gelo Transparente',qty:1}, {name:'Maçã',qty:2}, {name:'Açúcar',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Vinho de Fruta', group:'Culinária', children:[{name:'Fruta',qty:5}, {name:'Makgeolli',qty:1}, {name:'Essência do Liquor',qty:3}, {name:'Água Mineral',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Ghormeh Sabzi', group:'Culinária', children:[{name:'Carne de Iaque',qty:5}, {name:'Amido',qty:2}, {name:'Alho',qty:5}, {name:'Sal',qty:2}, {name:'Leite',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Ração Boa', group:'Rações', produces:'3–5', children:[{name:'Cantarilho',qty:1}, {name:'Carne de Boi',qty:6}, {name:'Farinha de Milho',qty:4}, {name:'Água Mineral',qty:3}], note:'Produção: 3–5 unidades.'},
  {name:'Sopa de Grãos', group:'Culinária', children:[{name:'Trigo',qty:6}, {name:'Água Mineral',qty:3, alternatives:[{name:'Água Purificada',qty:1}]}, {name:'Vinho para Cozinha',qty:3, alternatives:[{name:'Vinho Gastronômico',qty:3}]}, {name:'Sal',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Carne de Ave Grelhada', group:'Culinária', children:[{name:'Carne de Ave',qty:2}, {name:'Óleo para Fritura',qty:6}, {name:'Vinho para Cozinha',qty:2}, {name:'Sal',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Salsicha Grelhada', group:'Culinária', children:[{name:'Carne de Porco',qty:6}, {name:'Cebola',qty:1}, {name:'Pimenta-do-Reino',qty:2}, {name:'Sal',qty:2, alternatives:[{name:'Sal Desidratado ao Sol',qty:2}]}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Escorpião Grelhado', group:'Culinária', children:[{name:'Carne de Escorpião',qty:3}, {name:'Manteiga',qty:2}, {name:'Noz-Moscada',qty:3}, {name:'Pimenta',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Sanduíche de Presunto', group:'Culinária', children:[{name:'Pão Macio',qty:2}, {name:'Salsicha Grelhada',qty:2, alternatives:[{name:'Linguiça Defumada',qty:1}]}, {name:'Repolho',qty:5}, {name:'Ovo',qty:4}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Molusco Cozido', group:'Culinária', children:[{name:'Marisco de Pérola Desidratado',qty:2}, {name:'Essência do Liquor',qty:3}, {name:'Alho',qty:4}, {name:'Pimenta',qty:2}, {name:'Azeite de Oliva',qty:5}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Suco de Cenoura de Alta Qualidade', group:'Rações', produces:'1', children:[{name:'Cenoura de Alta Qualidade',qty:1}, {name:'Farinha de Trigo',qty:3}, {name:'Açúcar',qty:3}, {name:'Água Mineral',qty:4, alternatives:[{name:'Água Purificada',qty:2}]}], note:'Produção: 1 unidade.'},
  {name:'Licor de Mel', group:'Culinária', children:[{name:'Mel',qty:3}, {name:'Essência do Liquor',qty:2}, {name:'Açúcar',qty:2}, {name:'Água Mineral',qty:6}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Biscoito de Colmeia', group:'Culinária', children:[{name:'Mel de Cozinha',qty:6, alternatives:[{name:'Colmeia Selvagem',qty:6},{name:'Mel para Cozinha de Alta Qualidade',qty:3},{name:'Mel de Qualidade Superior',qty:1}]}, {name:'Massa de Trigo',qty:4}, {name:'Ovo',qty:2}, {name:'Leite',qty:4}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Salada de Caçador', group:'Culinária', children:[{name:'Carne de Baleia Macia',qty:1, alternatives:[{name:'Carne de Crocodilo',qty:1}]}, {name:'Vinagre',qty:2}, {name:'Molho',qty:2}, {name:'Alho',qty:5}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Chá de Jujuba', group:'Culinária', children:[{name:'Jujuba',qty:5}, {name:'Água Mineral',qty:1}, {name:'Mel de Cozinha',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Refeição de Kamasylvia', group:'Culinária', children:[{name:'Sanduíche de Cogumelo Arco-Íris',qty:1, alternatives:[{name:'Sanduíche de Cogumelo Arco-Íris Doce',qty:1}]}, {name:'Macarrão de Coco',qty:1}, {name:'Torta de Figo',qty:1}, {name:'Vinho de Fruta',qty:2}, {name:'Grelhado de Cogumelo Arco-Íris com Queijo',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Vinho Fermentado de Khalk', group:'Culinária', children:[{name:'Chifre de Khalk Fujão',qty:1}, {name:'Licor de Mel',qty:5}, {name:'Tâmara',qty:6}, {name:'Fermento',qty:6}, {name:'Açúcar',qty:6}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Hambúrguer do Rei da Selva', group:'Culinária', children:[{name:'Carne de Leão',qty:4}, {name:'Pão de Teff',qty:4}, {name:'Legumes em Conserva',qty:2}, {name:'Noz-Moscada',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Ração de Combate do Cavaleiro', group:'Culinária', children:[{name:'Pudim Escuro',qty:1}, {name:'Sanduíche de Presunto',qty:1}, {name:'Croquete de Carne',qty:1}, {name:'Vinho de Fruta',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Salada de Carne Magra', group:'Culinária', children:[{name:'Carne',qty:8}, {name:'Vinagre',qty:2}, {name:'Pimenta',qty:3}, {name:'Tempero',qty:4}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Kebab de Lagarto', group:'Culinária', children:[{name:'Carne de Lagarto',qty:6}, {name:'Molho Vermelho',qty:2}, {name:'Cebola',qty:3}, {name:'Trigo',qty:7}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Makgeolli', group:'Culinária', children:[{name:'Massa de Trigo',qty:3}, {name:'Essência do Liquor',qty:1}, {name:'Água Mineral',qty:5}, {name:'Fermento',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Salada de Camarão Jumbo', group:'Culinária', children:[{name:'Camarão',qty:2}, {name:'Azeite de Oliva',qty:3}, {name:'Sal',qty:2}, {name:'Ovo',qty:3}, {name:'Salada de Frutas e Legumes',qty:2}], note:'Culinária — Hábil 1+. Produz 1–4 Saladas de Camarão Jumbo.'},
  {name:'Camarão Jumbo Cozido a Vapor', group:'Culinária', children:[{name:'Camarão',qty:4}, {name:'Pimenta',qty:2}, {name:'Repolho',qty:3}, {name:'Vinho para Cozinha',qty:3}, {name:'Água Mineral',qty:4}], note:'Culinária — Hábil 1+. Produz 1–4 Camarões Jumbo Cozidos a Vapor.'},
  {name:'Panqueca de Ostra', group:'Culinária', children:[{name:'Ostra',qty:3}, {name:'Ovo',qty:2}, {name:'Farinha de Trigo',qty:5}, {name:'Vinagre',qty:2}, {name:'Azeite de Oliva',qty:3}], note:'Culinária — Hábil 1+. Produz 1–4 Panquecas de Ostra.'},
  {name:'Prato Especial de Frutos do Mar de Margoria', group:'Culinária', routes:[
    {label:'Receita 1 — Artesão', children:[{name:'Salada de Camarão Jumbo',qty:1},{name:'Camarão Jumbo Cozido a Vapor',qty:1},{name:'Panqueca de Ostra',qty:1},{name:'Lagosta Assada em Manteiga',qty:1},{name:'Vinho de Fruta',qty:2}]},
    {label:'Receita 2 — Novato', children:[{name:'Salada de Camarão Jumbo',qty:1},{name:'Camarão Jumbo Cozido a Vapor',qty:1},{name:'Panqueca de Ostra',qty:1},{name:'Lagosta Dourada Grelhada na Manteiga',qty:1},{name:'Vinho de Fruta',qty:2}]}
  ], note:'Receita confirmada no BDO Codex: duas receitas de produção para o mesmo item, nos níveis Novato 1 e Artesão 1.'},
  {name:'Croquete de Carne', group:'Culinária', children:[{name:'Carne',qty:8}, {name:'Farinha',qty:5}, {name:'Ovo',qty:2}, {name:'Queijo',qty:2}, {name:'Óleo para Fritura',qty:4}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Macarrão com Carne', group:'Culinária', children:[{name:'Carne',qty:5}, {name:'Massa de Trigo',qty:4}, {name:'Pimenta-do-Reino',qty:3}, {name:'Alho',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Torta de Carne', group:'Culinária', children:[{name:'Carne de Porco',qty:4}, {name:'Massa de Trigo',qty:6}, {name:'Açúcar',qty:2, alternatives:[{name:'Açúcar Mascavo',qty:1}]}, {name:'Azeite de Oliva',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Sanduíche de Carne', group:'Culinária', children:[{name:'Pão Macio',qty:1}, {name:'Carne',qty:7}, {name:'Legume',qty:6}, {name:'Queijo',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Sopa de Carne', group:'Culinária', children:[{name:'Carne de Porco',qty:5}, {name:'Pimenta-do-Reino',qty:1}, {name:'Creme',qty:2}, {name:'Água Mineral',qty:4,alternatives:[{name:'Água Purificada',qty:2}]}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Ensopado de Carne', group:'Culinária', children:[{name:'Carne',qty:5}, {name:'Farinha',qty:2}, {name:'Água Mineral',qty:3}, {name:'Vinho para Cozinha',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Refeição de Mediah', group:'Culinária', children:[{name:'Pudim Escuro',qty:1, alternatives:[{name:'Pudim Escuro Sangrento',qty:1}]}, {name:'Aveia',qty:1}, {name:'Salsicha Grelhada',qty:2}, {name:'Salada de Carne Magra',qty:1}, {name:'Makgeolli',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Canja de Galinha de Cogumelo Sanghwang', group:'Culinária', children:[{name:'Mesima',qty:3}, {name:'Água Mineral',qty:2}, {name:'Alho',qty:1}, {name:'Tâmara',qty:1}, {name:'Carne de Frango',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Makgeolli de Cogumelo Sanghwang', group:'Culinária', children:[{name:'Mesima',qty:2}, {name:'Água Mineral',qty:3}, {name:'Fermento',qty:3}, {name:'Trigo',qty:5}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Chá com Leite', group:'Culinária', children:[{name:'Chá com Aroma Fino',qty:2,alternatives:[{name:'Chá com Cheiro Forte',qty:1}]}, {name:'Farinha de Trigo',qty:2}, {name:'Leite',qty:3}, {name:'Mel de Cozinha',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Nokdujeon', group:'Culinária', children:[{name:'Feijão-Mungo',qty:5}, {name:'Óleo de Perila',qty:1}, {name:'Sal',qty:1}, {name:'Carne de Porco',qty:1}, {name:'Samambaia',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Nurungji', group:'Culinária', children:[{name:'Arroz Cozido',qty:1}, {name:'Óleo de Milho',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:"Refeição de O'dyllita", group:'Culinária', children:[{name:'Pudim de Delotia',qty:1, alternatives:[{name:'Pudim Vermelho de Delotia',qty:1}]}, {name:'Refogado de Carne e Samambaia',qty:1}, {name:'Suco de Delotia',qty:2}, {name:'Salada de Peito de Frango',qty:2}, {name:'Refogado de Carne de Ave',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Aveia', group:'Culinária', children:[{name:'Farinha de Trigo',qty:9}, {name:'Leite',qty:3}, {name:'Mel de Cozinha',qty:2}, {name:'Cebola',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Omelete', group:'Culinária', children:[{name:'Amido',qty:5}, {name:'Ovo',qty:5}, {name:'Azeite de Oliva',qty:2}, {name:'Sal',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Ração Orgânica', group:'Rações', produces:'1–5', children:[{name:'Cantarilho',qty:1}, {name:'Aveia',qty:2}, {name:'Carne de Boi',qty:5}, {name:'Frango',qty:4}], note:'Produção: 1–5 unidades.'},
  {name:'Cebola em Conserva Yuzu', group:'Culinária', children:[{name:'Cebola',qty:2}, {name:'Vinagre de Yuzu',qty:2}, {name:'Açúcar',qty:2}, {name:'Fermento',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Peixe em Conserva', group:'Culinária', children:[{name:'Peixe',qty:1}, {name:'Vinagre',qty:2}, {name:'Fermento',qty:2}, {name:'Sal',qty:4}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Legumes em Conserva', group:'Culinária', children:[{name:'Legume',qty:8}, {name:'Vinagre',qty:4}, {name:'Fermento',qty:2}, {name:'Açúcar',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Arroz Frito com Pistache', group:'Culinária', children:[{name:'Pistache',qty:4}, {name:'Teff',qty:6}, {name:'Canela',qty:2}, {name:'Sal',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Grelhado de Cogumelo Arco-Íris com Queijo', group:'Culinária', children:[{name:'Cogumelo Arco-Íris',qty:1}, {name:'Carne de Porco',qty:2}, {name:'Queijo',qty:2}, {name:'Sal',qty:3}, {name:'Azeite de Oliva',qty:4}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Sanduíche de Cogumelo Arco-Íris', group:'Culinária', children:[{name:'Cogumelo Arco-Íris',qty:1}, {name:'Pão Macio',qty:1}, {name:'Creme',qty:2}, {name:'Cebola',qty:2}, {name:'Azeite de Oliva',qty:4}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Mingau de Feijão Vermelho', group:'Culinária', children:[{name:'Feijão Vermelho',qty:5}, {name:'Farinha de Arroz',qty:5}, {name:'Sal',qty:1}, {name:'Água Mineral',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Tteok de Feijão', group:'Culinária', children:[{name:'Feijão Vermelho',qty:4}, {name:'Farinha de Arroz',qty:3}, {name:'Sal',qty:1}, {name:'Água Mineral',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Molho Vermelho', group:'Culinária', children:[{name:'Carne',qty:1}, {name:'Molho Base',qty:1}, {name:'Açúcar',qty:2}, {name:'Água Mineral',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Churrasco de Marmota', group:'Culinária', children:[{name:'Carne de Marmota',qty:5}, {name:'Pimenta',qty:3}, {name:'Sal',qty:2}, {name:'Molho Vermelho',qty:1}, {name:'Vinho para Cozinha',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Ginkgo Torrado', group:'Culinária', children:[{name:'Ginkgo',qty:4}, {name:'Sal',qty:1}, {name:'Óleo de Perila',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Refeição de Cron Saborosa', group:'Culinária', children:[{name:'Bife Saboroso',qty:1}, {name:'Refeição de Balenos',qty:3}, {name:'Chá Sute',qty:3}, {name:'Tempero de Cron Ancestral',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Bife Saboroso', group:'Culinária', children:[{name:'Carne de Leão',qty:4}, {name:'Figo',qty:5}, {name:'Vinho para Cozinha',qty:2}, {name:'Pimenta-do-Reino',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Refeição de Frutos do Mar de Cron', group:'Culinária', routes:[
    {label:'Receita 1', children:[{name:'Refeição de Balenos',qty:3},{name:'Refeição de Calpheon',qty:3},{name:'Prato Especial de Frutos do Mar de Margoria',qty:1},{name:'Tempero de Cron Ancestral',qty:1}]},
    {label:'Receita 2', children:[{name:'Refeição de Balenos',qty:3},{name:'Bife Saboroso',qty:1},{name:'Chá Sute',qty:3},{name:'Tempero de Cron Ancestral',qty:1}]}
  ], note:'Culinária Simples (Processamento). O Codex confirma duas rotas de produção.'},
  {name:'Marisco Grelhado com Manteiga', group:'Culinária', children:[{name:'Lula',qty:1}, {name:'Manteiga',qty:3}, {name:'Sal',qty:2}, {name:'Azeite de Oliva',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Salada de Frutos do Mar e Cogumelo', group:'Culinária', children:[{name:'Lula',qty:1}, {name:'Cogumelo Corcunda',qty:1}, {name:'Tempero',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Macarrão com Frutos do Mar', group:'Culinária', children:[{name:'Lula',qty:1}, {name:'Massa de Milho',qty:5}, {name:'Alho',qty:3}, {name:'Vinho para Cozinha',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Refeição de Serendia', group:'Culinária', children:[{name:'Sanduíche de Presunto',qty:1}, {name:'Torta de Carne',qty:1}, {name:'Biscoito de Colmeia',qty:1}, {name:'Ovos de Pássaros Cozidos',qty:2}, {name:'Vinho de Fruta',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Chá de Cogumelo Sangjwang fermentada uma única vez', group:'Culinária', children:[{name:'Cogumelo Sanghwang',qty:5}, {name:'Água Mineral',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Espetinho de Queijo de Lhama', group:'Culinária', children:[{name:'Carne de Lhama',qty:5}, {name:'Queijo',qty:4}, {name:'Pimenta Picante',qty:3}, {name:'Pimenta',qty:1}, {name:'Molho Branco',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Filé de Peixe Defumado', group:'Culinária', children:[{name:'Peixe',qty:2}, {name:'Sal',qty:2}, {name:'Azeite de Oliva',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Pão Macio', group:'Culinária', children:[{name:'Massa de Trigo',qty:6}, {name:'Ovo',qty:2}, {name:'Leite',qty:3}, {name:'Fermento',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Ensopado de Pasta de Soja', group:'Culinária', children:[{name:'Pasta de Soja',qty:3}, {name:'Carne de Porco',qty:1}, {name:'Alho',qty:2}, {name:'Molho de Soja',qty:1}, {name:'Água Mineral',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Refeição Especial de Arehaza', group:'Culinária', children:[{name:'Coquetel de Coco',qty:2, alternatives:[{name:'Coquetel de Coco Gelado',qty:1}]}, {name:'Macarrão de Coco',qty:1}, {name:'Peixe Coco Frito',qty:1}, {name:'Ensopado de Carne',qty:1}, {name:'Bife',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Suco de Cenoura Especial', group:'Rações', produces:'5–20', children:[{name:'Cenoura Especial',qty:1}, {name:'Farinha de Milho',qty:3}, {name:'Açúcar',qty:3}, {name:'Água Mineral',qty:4}], note:'Produção: 5–20 unidades.'},
  {name:'Refeição de Drieghan Especial', group:'Culinária', children:[{name:'Espetinho de Queijo de Lhama',qty:1}, {name:'Samambaia Frita',qty:1, alternatives:[{name:'Samambaia Frita Bem Gostosa',qty:1}]}, {name:'Churrasco de Marmota',qty:1}, {name:'Holmick',qty:1}, {name:'Licor de Mel',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Licor de Yuzu', group:'Culinária', children:[{name:'Yuzu',qty:5}, {name:'Essência do Liquor',qty:3}, {name:'Açúcar',qty:1}, {name:'Fermento',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Refeição Especial de Eil', group:'Culinária', children:[{name:'Licor de Yuzu',qty:2, alternatives:[{name:'Licor de Yuzu Azedo',qty:1}]}, {name:'Mingau de Cogumelo Oriole',qty:2}, {name:'Cebola em Conserva Yuzu',qty:1}, {name:'Ensopado de Cogumelo Oriole',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Bife', group:'Culinária', children:[{name:'Carne',qty:8}, {name:'Molho Vermelho',qty:2}, {name:'Alho',qty:2}, {name:'Sal',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Pássaro Cozido', group:'Culinária', children:[{name:'Carne de Ave',qty:5}, {name:'Legume',qty:3}, {name:'Essência do Liquor',qty:2}, {name:'Vinagre',qty:2}, {name:'Sal',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Peixe Cozido', group:'Culinária', children:[{name:'Peixe',qty:1}, {name:'Alho',qty:2}, {name:'Água Mineral',qty:3}, {name:'Sal',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Frutos do Mar Cozidos', group:'Culinária', children:[{name:'Frutos do Mar',qty:2}, {name:'Pimenta Picante',qty:3}, {name:'Água Mineral',qty:6}, {name:'Sal',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Carne de Baleia Cozida', group:'Culinária', children:[{name:'Carne de Baleia Azul',qty:1}, {name:'Licor de Mel',qty:1}, {name:'Alho',qty:4}, {name:'Água Mineral',qty:6}, {name:'Sal',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Refogado de Carne de Ave', group:'Culinária', children:[{name:'Carne de Frango',qty:5}, {name:'Amido',qty:5}, {name:'Cebola',qty:3}, {name:'Óleo para Fritura',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Refogado de Carne e Samambaia', group:'Culinária', children:[{name:'Samambaia',qty:3}, {name:'Carne de Porco',qty:6}, {name:'Alho',qty:3}, {name:'Azeite de Oliva',qty:2}, {name:'Água Mineral',qty:5}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Samambaia Frita', group:'Culinária', children:[{name:'Samambaia',qty:8}, {name:'Alho',qty:5}, {name:'Sal',qty:2}, {name:'Água Mineral',qty:5}, {name:'Azeite de Oliva',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Carne Frita com Cogumelo Oriole', group:'Culinária', children:[{name:'Cogumelo Oriole',qty:3}, {name:'Carne de Porco',qty:5}, {name:'Molho Base',qty:2}, {name:'Pimenta',qty:2}, {name:'Sal',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Carne Frita', group:'Culinária', children:[{name:'Carne',qty:7}, {name:'Cebola',qty:2}, {name:'Pimenta Picante',qty:3}, {name:'Molho Base',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Frutos do Mar Refogados', group:'Culinária', children:[{name:'Frutos do Mar',qty:1}, {name:'Legume',qty:4}, {name:'Molho Branco',qty:2}, {name:'Pimenta Picante',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Legumes Refogados', group:'Culinária', children:[{name:'Repolho',qty:5, alternatives:[{name:'Cebola',qty:7}]}, {name:'Pimenta',qty:2, alternatives:[{name:'Páprica',qty:1}]}, {name:'Azeite de Oliva',qty:2, alternatives:[{name:'Óleo de Milho',qty:2}]}, {name:'Sal',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Sungnyung', group:'Culinária', children:[{name:'Nurungji',qty:2}, {name:'Água Mineral',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Chá Sute', group:'Culinária', children:[{name:'Chá com Aroma Fino',qty:2}, {name:'Manteiga',qty:2}, {name:'Leite',qty:3}, {name:'Sal',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Licor de Mel Doce', group:'Culinária', children:[{name:'Mel de Cozinha de Alta Qualidade',qty:2}, {name:'Makgeolli Encorpado',qty:4}, {name:'Açúcar',qty:10}, {name:'Fruta',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Chá com Aroma Fino', group:'Culinária', children:[{name:'Rosa',qty:4}, {name:'Maçã',qty:4}, {name:'Água Mineral',qty:7,alternatives:[{name:'Água Purificada',qty:3}]}, {name:'Mel de Cozinha',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Pão de Teff', group:'Culinária', children:[{name:'Farinha de Teff',qty:5}, {name:'Água Mineral',qty:3}, {name:'Sal',qty:2}, {name:'Fermento',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Sanduíche Teff', group:'Culinária', children:[{name:'Pão de Teff',qty:1,alternatives:[{name:'Pão de Teff Esponjoso',qty:1}]}, {name:'Escorpião Grelhado',qty:1}, {name:'Ensopado de Cobra Freekeh',qty:1}, {name:'Molho Vermelho',qty:3}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Chá de Cogumelo Sanghwang Coado Duas Vezes', group:'Culinária', children:[{name:'Chá de Cogumelo Sangjwang fermentada uma única vez',qty:1}, {name:'Água Mineral',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Refeição de Valência', group:'Culinária', children:[{name:'Sanduíche Teff',qty:1}, {name:'Hambúrguer do Rei da Selva',qty:1}, {name:'Cuscuz',qty:1, alternatives:[{name:'Cuscuz Clássico',qty:1}]}, {name:'Torta de Figo',qty:2}, {name:'Vinho de Tamareira',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Vinagre', group:'Culinária', children:[{name:'Fruta',qty:1}, {name:'Amido',qty:1}, {name:'Fermento',qty:1}, {name:'Açúcar',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Chá de Cogumelo Sanghwang bem fermentado', group:'Culinária', children:[{name:'Chá de Cogumelo Sanghwang Coado Duas Vezes',qty:1}, {name:'Água Mineral',qty:1}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Salada de Carne de Baleia', group:'Culinária', children:[{name:'Carne de Baleia Azul',qty:1}, {name:'Legume',qty:6}, {name:'Tempero',qty:2}, {name:'Ovo',qty:3}, {name:'Pimenta',qty:4}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Kimchi Branco', group:'Culinária', children:[{name:'Repolho Chinês',qty:5}, {name:'Cebola',qty:1}, {name:'Alho',qty:4}, {name:'Sal',qty:1}, {name:'Água Mineral',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
  {name:'Molho Branco', group:'Culinária', children:[{name:'Fruta',qty:1}, {name:'Leite',qty:1}, {name:'Molho Base',qty:1}, {name:'Vinho para Cozinha',qty:2}], note:'Culinária — receita adicionada à base completa de receitas.'},
];
