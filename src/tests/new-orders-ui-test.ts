import { Browser } from "k6/experimental/browser";
import { LoginPage } from "./LoginPage";

export default async function () {
  const browser = new Browser();
  const page = browser.newPage();

  const loginpage = new LoginPage(page);
  const pickMenu = page.locator("#medportal_pick > span.p-menuitem-text");
  const pickNewOrders = page.locator("#medportal_new_order > span");

  try {
    await loginpage.visit();
    //  await Promise.all([advancedButton.click()])

    //  await Promise.all([page.waitForNavigation(), proceedLink.click()])

    //  await Promise.all([loginLink.click()])

    await Promise.all([loginpage.login("systemadmin", "max")]);

    await Promise.all([pickMenu.isVisible(), pickMenu.click()]);

    await Promise.all([
      pickNewOrders.isVisible(),
      pickNewOrders.click(),
      page.waitForSelector("#medportal_new_order > span"),
    ]);
    const startTime = new Date().getTime();

    page.waitForSelector("#medportal_new_order > span");
    //  await titleText.waitFor({
    //    state: 'visible' })

    //check(titleText, {
    //  'Title is correct': (titleText) => titleText.textContent() === 'Transfer Order',
    //  })

    const endTime = new Date().getTime();
    const duration = endTime - startTime;

    console.log(`Page load time: ${duration} ms`);
  } catch (error) {
    console.log(error);
  } finally {
    page.close();
  }
}
