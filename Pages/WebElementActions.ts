import { browser, element, by, protractor, $$, $, ElementArrayFinder } from 'protractor';
import { Capabilities, WebElement } from 'selenium-webdriver';
var screenshots = require('protractor-take-screenshots-on-demand');
//import {browser, by, ElementFinder } from "protractor";
import { log4jsconfig } from '../Utility/log4jsconfig';
var EC = protractor.ExpectedConditions;
let logObj = new log4jsconfig();
export class WebElementActions {
  async click(locator: any) {
    try {
     // await browser.wait(EC.elementToBeClickable(locator), 20000);
     await console.log("Inside click")
       locator.click();
      // let loc = await locator.locator();
      // let logreturn = await logObj.Log();
      // await logreturn.info('Clicked element  is:', loc.value);
    } catch (errormessage) {
      // log4jsconfig.Log().error('Clicked element  is:', errormessage);
    }
  }

  async inputtext(locator: any, value: string) {
    try {
      // await browser.wait(EC.elementToBeClickable(locator), 20000);
      // await locator.clear();
      await locator.sendKeys(value);
      
      // let logreturn = await logObj.Log();
      // await logreturn.info('Input Element is:', value);
      
    } catch (errormessage) {
      //log4jsconfig.Log().error('Entred input is:', errormessage);
    }
  }
  async dropdownselect(locator: any, text: string) {
    try {
      await locator.$(text).click();
      // log4jsconfig.Log().info('Selected dropdown  is:', locator);
    } catch (errormessage) {
      //log4jsconfig.Log().error('Selected dropdown is:', errormessage);
    }
  }
  
  //var selectOrgFromDropDown = element.all(by.css('li[tabindex="-1"]'));
  async clickAlert() {
    await browser.wait(protractor.ExpectedConditions.alertIsPresent(), 10000);
    let alertDialog = await browser.switchTo().alert();
    let expected = await alertDialog.getText();
    console.log("Message on pop up for upload document :", expected);
    await alertDialog.accept();
  }
}