import { browser, element, by, protractor, $$, $ } from 'protractor';
import { WebElementActions } from "./WebElementActions";
import { BasePage } from "../Pages/BasePage";

let webElementActions = new WebElementActions();
var EC = protractor.ExpectedConditions;
export class LoginPage extends BasePage {
    // Login Page Locators
    username = element(by.xpath("//input[@name='username']"));
    password = element(by.xpath("//input[@name='password']"));
    login = element(by.xpath("//button[@type='button']"));


    async openApplicationURL(URL: any) {

        await browser.manage().window().maximize();
        await browser.get(URL);

    }

    async doLogin(UsernameData: string, PasswordData: string) {


        await webElementActions.inputtext(this.username, UsernameData);
        await webElementActions.inputtext(this.password, PasswordData);
        await webElementActions.click(this.login);

    }


}