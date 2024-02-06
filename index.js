const pup = require('puppeteer');

const url = "https://www.mercadolivre.com.br/";
const searchFor = "macbook";

let c = 1;
const list = [];

(async () => {
  const browser = await pup.launch({
    headless: false
  });
  const page = await browser.newPage();
  console.log('Iniciei')
  
  await page.goto(url);
  console.log('Pesquisei')

  await page.waitForSelector('#cb1-edit')
  
  await page.type('.nav-search-input', searchFor);
  
  await Promise.all([
     page.waitForNavigation(),
     page.click('.nav-search-btn')
  ])
  
  const links = await page.$$eval('.ui-search-item__group > a', element => element.map(link => link.href))
  
  for(const link of links){
    if(c === 10) continue;
    console.log('Página', c);
    await page.goto(link);

    await page.waitForSelector('.ui-pdp-title');

    const title = await page.$eval('.ui-pdp-title', element => element.innerText);
    const price = await page.$eval('.andes-money-amount__fraction', element => element.innerText);

    const seller = await page.evaluate(() => {
      const element = document.querySelector('.ui-pdp-seller__link-trigger');
      if(!element) return null
      return element.innerText
    })

    const obj = {}
    obj.title = title;
    obj.price = price;
    (seller ? obj.seller = seller : '');
    obj.link = link;

    list.push(obj);

    c++;
  }

  console.log(list)
  
  await browser.close();
  console.log('Fechei')
})();