const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    headless: false,
  });

  const page = await browser.newPage();

   await page.goto('https://www.linkedin.com/in/even-odd-b9ba0a330/');
    
 await page.locator(".authwall-join-form__form-toggle--bottom").click();
  await page.getByRole('textbox', { name: 'Email or phone' }).click();
  await page.getByRole('textbox', { name: 'Email or phone' }).fill('evenodd13311334@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();

  await page.getByRole('textbox', { name: 'Password' }).fill('Ayush@1334');
await page.locator(
  ".btn-md.btn-primary.flex-shrink-0.cursor-pointer.sign-in-form__submit-btn--full-width"
).click();

  await page.getByLabel('Sidebar').getByRole('link').filter({ hasText: /^$/ }).click();
  
 
  await browser.close();  
})();


 