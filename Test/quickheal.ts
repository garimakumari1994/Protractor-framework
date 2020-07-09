import { LoginPage } from "../Pages/LoginPage";
import { jsonread } from "../Utility/jsonread";
import { browser, element, by, protractor, $$, $ } from 'protractor';

describe('workspace-project App', () => {
  // let loginpage: LoginPage;
  let jsonobject = new jsonread();
  let loginPageObject = new LoginPage();
  //let EC = protractor.ExpectedConditions;
  let logindata = jsonobject.read('TestData\\Login_Data.json');

  it('should display login page', async () => {
    await loginPageObject.openApplicationURL(logindata.url);
    let current = await browser.getCurrentUrl();
    expect(current).toEqual(logindata.ExpectedURL);

  });

  it('admin successfully  logged in   ', async () => {

    await loginPageObject.doLogin(logindata.un, logindata.pwd);
    //expect(element(by.name('password')).getText()).toBe('admin');
  });
});
