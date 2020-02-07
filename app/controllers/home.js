/**
 * @author Dwi Setiyadi
 */

import fs from 'fs';
import cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import uuid from 'uuid/v4';

class Home {
  static getPage = async (req, res) => {
    let htmlVar = {
      page: 'home',
      title: 'Price Watch',
    };

    if (req.payload) {
      let validUrl = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ //port
        '(\\?[;&amp;a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i');
      validUrl = validUrl.test(req.payload.url);
      if (!validUrl) htmlVar = { ...htmlVar, error: 'URL Invalid' };

      let validFabelio = new RegExp(/fabelio.com/gm);
      validFabelio = validFabelio.test(req.payload.url);
      if (!validFabelio) htmlVar = { ...htmlVar, error: 'Its not Fabelio' };
        
      if (validUrl && validFabelio) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(req.payload.url, {waitUntil: 'networkidle0'});
        await page.waitForSelector('.fotorama__stage__shaft.fotorama__grab');
        const html = await page.content();
        const $ = cheerio.load(html);

        const objItemSpec = $('ul.prod-dimension-list').toArray().map((v) => $(v).html().trim()).join("\n");

        console.log();

        const obj = {
          id: uuid(),
          title: $('meta[property="og:title"]').attr('content').trim(),
          description: $('#description').html(),
          specification: (objItemSpec !== '') ? `<ul>\n${objItemSpec}\n</ul>` : '',
          image: $('.product.media .fotorama__stage__shaft.fotorama__grab img').toArray().map((v) => $(v).attr('src')),
          price: {
            amount: $('meta[property="product:price:amount"]').attr('content'),
            currency: $('meta[property="product:price:currency"]').attr('content'),
          },
        };

        const data = JSON.parse(fs.readFileSync('data.json'));
        const find = data.find((v) => v.title === obj.title);
        if (find) htmlVar = { ...htmlVar, success: find };

        if (!find) {
          const newData = JSON.stringify([ ...data, obj ]);
          fs.writeFileSync('data.json', newData);
          htmlVar = { ...htmlVar, success: obj };
        }

        await browser.close();
      }
    }

    return res.view('home', htmlVar);
  }

  static viewPage = async (req, res) => {
    const data = JSON.parse(fs.readFileSync('data.json'));
    const find = data.find((v) => v.id === req.params.id);

    let htmlVar = {
      title: 'Page Detail',
    };

    if (find) {
      htmlVar = {
        ...htmlVar,
        title: find.title,
        success: find,
      };
    }

    if (!find) {
      htmlVar = {
        ...htmlVar,
        error: 'Data not found',
      };
    }

    return res.view('detail', htmlVar);
  }

  static viewAll = async (req, res) => {
    const data = JSON.parse(fs.readFileSync('data.json'));

    let htmlVar = {
      title: 'All Data',
      success: data,
    };

    return res.view('list', htmlVar);
  }
}

export default Home;
