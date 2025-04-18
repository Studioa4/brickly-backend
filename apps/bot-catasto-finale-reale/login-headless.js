const loginSister = async (page) => {
  await page.goto('https://iampe.agenziaentrate.gov.it/sam/UI/Login?realm=/agenziaentrate', { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('a.nav-link');
  const tabs = await page.$$('a.nav-link');
  for (const tab of tabs) {
    const text = await (await tab.getProperty('innerText')).jsonValue();
    if (text.includes('Fisconline') || text.includes('Entratel')) {
      await tab.click();
      break;
    }
  }

  await page.type('input[name="IDToken1"]', 'T5526696');
  await page.type('input[name="IDToken2"]', 'Matrix2046');
  await page.type('input[name="IDToken3"]', '1245b88b');

  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ]);

  const bottone = await page.$('a[href*="ret2sister"]');
  if (bottone) {
    await page.evaluate(el => el.scrollIntoView(), bottone);
    await Promise.all([
      bottone.click(),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
  }

  await page.click('input[name="submit"][value="Conferma"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  console.log('✅ Login Sister completato (headless).');
};

module.exports = { loginSister };
