const fetch = require('node-fetch');
const cheerio = require('cheerio');

exports.handler = async function (event, context) {
  const targetUrl = 'https://www.sa.playblackdesert.com/pt-BR/News/Notice?boardType=3';

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na resposta do BDO: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const events = [];

    // Captura os itens da tabela/lista de notícias e eventos do BDO
    $('table.board_list tbody tr, .board_list_wrap ul li').each((_, el) => {
      const $el = $(el);
      
      const titleEl = $el.find('.td_title a, .title, a.line_opt');
      const title = titleEl.text().replace(/\s+/g, ' ').trim();
      let link = titleEl.attr('href') || '';
      
      if (link && !link.startsWith('http')) {
        link = `https://www.sa.playblackdesert.com${link}`;
      }

      const dateText = $el.find('.date, .td_date').text().trim();

      if (title && link) {
        events.push({
          title,
          link,
          date: dateText || new Date().toISOString().split('T')[0]
        });
      }
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=1800'
      },
      body: JSON.stringify({
        success: true,
        count: events.length,
        events
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
