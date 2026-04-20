const axios = require('axios');
const cheerio = require('cheerio');
async function test() {
  const url = 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4';
  console.log('Fetching', url);
  try {
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.google.com/',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });
      const $ = cheerio.load(data);
      
      let title = '';
      let rawPrice = '';
      
      $('script[type="application/ld+json"]').each((i, el) => {
          try {
              const json = JSON.parse($(el).text());
              const items = Array.isArray(json) ? json : [json];
              for (const item of items) {
                  if (item['@type'] === 'Product') {
                      title = item.name;
                      if(item.offers && item.offers.price) rawPrice = item.offers.price.toString();
                  }
              }
          } catch(err) {}
      });
      
      if (!title) {
         title = $('span.VU-ZEz').text().trim() || $('h1 .VU-ZEz').text().trim() || $('span.B_NuCI').text().trim() || $('h1').text().trim();
      }
      if (!rawPrice) {
         rawPrice = $('div.Nx9bqj.CxFj1').first().text().trim() || $('div._30jeq3._16Jk6d').text().trim();
      }
      console.log('Title:', title);
      console.log('Price:', rawPrice);
  } catch (err) {
      console.error('Request failed:', err.response?.status, err.message);
  }
}
test();
