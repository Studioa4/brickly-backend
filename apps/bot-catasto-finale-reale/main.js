const puppeteer = require('puppeteer');
const { loginSister } = require('./login');
const { vaiAiSubalterni } = require('./vaiAiSubalterni');
const { scaricaVisure } = require('./scaricaVisure');
const { importaVisureNelDB } = require('./importaVisureNelDB');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: 1600, height: 1200 }
  });

  const page = await browser.newPage();

  await loginSister(page);
  await vaiAiSubalterni(page);
  await scaricaVisure(page);

  await browser.close();

  await importaVisureNelDB(); // parsing PDF e salvataggio nel DB
})();
