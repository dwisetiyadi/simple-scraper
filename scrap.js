const fs = require('fs'),
      cheerio = require('cheerio'),
      puppeteer = require('puppeteer'),
      uuid = require('uuid/v4');

const url = 'https://fabelio.com/ip/dabi-sofa-bed.html';

// axios(url)
//   .then(response => {
//     const html = response.data;
//     const $ = cheerio.load(html);
//     const obj = {
//       title: $('meta[property="og:title"]').attr('content'),
//       description: $('#description').html(),
//       specification: `<ul>\n${$('ul.prod-dimension-list').toArray().map((v) => $(v).html().trim()).join("\n")}\n</ul>`,
//       image: $('meta[property="og:image"]').attr('content'),
//       price: {
//         amount: $('meta[property="product:price:amount"]').attr('content'),
//         currency: $('meta[property="product:price:currency"]').attr('content'),
//       },
//     };
//     console.log(obj);
//   })
//   .catch(console.error);

puppeteer
  .launch()
  .then(browser => browser.newPage())
  .then(async (page) => {
    await page.goto(url, {waitUntil: 'networkidle0'});
    await page.waitForSelector('.fotorama__stage__shaft.fotorama__grab');
    return page.content();
  })
  .then(html => {
    const $ = cheerio.load(html);
    const obj = {
      id: uuid(),
      title: $('meta[property="og:title"]').attr('content').trim(),
      description: $('#description').html(),
      specification: `<ul>\n${$('ul.prod-dimension-list').toArray().map((v) => $(v).html().trim()).join("\n")}\n</ul>`,
      image: $('.product.media .fotorama__stage__shaft.fotorama__grab img').toArray().map((v) => $(v).attr('src')),
      price: {
        amount: $('meta[property="product:price:amount"]').attr('content'),
        currency: $('meta[property="product:price:currency"]').attr('content'),
      },
    };
    const data = JSON.parse(fs.readFileSync('data.json'));
    const find = data.find((v) => v.title === obj.title);
    if (!find) {
      const newData = JSON.stringify([ ...data, obj ]);
      fs.writeFileSync('data.json', newData);
    }
    process.exit();
  })
  .catch(console.error);