const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    headless: false,
  });

  const page = await browser.newPage();

   await page.goto('https://www.linkedin.com/in/even-odd-b9ba0a330/');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('textbox', { name: 'Email or phone' }).click();
  await page.getByRole('textbox', { name: 'Email or phone' }).fill('evenodd13311334@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();

  await page.getByRole('textbox', { name: 'Password' }).fill('Ayush@1334');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByLabel('Sidebar').getByRole('link').filter({ hasText: /^$/ }).click();
  await page.getByTestId('lazy-column').getByText('Student at Sharda University').click();
  
 
  await browser.close();  
})();


 