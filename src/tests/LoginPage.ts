import { Locator, Page } from "k6/experimental/browser";
export class LoginPage {
  page: Page;
  usernameInput: Locator;
  passwordInput: Locator;
  signinButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator("#username");
    this.passwordInput = page.locator("#password");
    this.signinButton = page.locator("#kc-login");
    //this.advancedButton = page.locator("#details-button");
    //this.proceedLink = page.locator("#proceed-link");
  }
  async visit() {
    await this.page.goto("https://pm21x-perf-shva.sl-hc.com/");
  }
  async login(username: string, password: string) {
    this.usernameInput.fill(username);
    this.passwordInput.fill(password);
    await this.signinButton.click();
  }
}
