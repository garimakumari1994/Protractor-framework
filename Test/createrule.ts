import { browser, logging, element, by, $ } from 'protractor';
import { threadId } from 'worker_threads';
import { protractor } from 'protractor/built/ptor';
import { async } from 'q';
describe('Quick heal rulebulider App', async() => {
    browser.get('http://qh-internal.indexnine.com/');
     await element(by.name('username')).sendKeys('admin');
     await element(by.name('password')).sendKeys('admin');
     await element(by.buttonText('Login')).click();
    
  });
  it('Verify rule is created successfully for Light Theme', async () => {
   
    let sidebar = element(by.xpath("//i[@class='nav-icon nav-img-logo']"));
    let rulebuilderIcon = element(by.linkText('Rule Builder'));
    let EC = protractor.ExpectedConditions;
    let ruleName = element(by.id('ruleName'));
    browser
      .actions()
      .mouseMove(sidebar)
      .mouseMove(rulebuilderIcon)
      .click()
      .perform();
    //browser.sleep(30000);
    await element(by.partialButtonText('Create Rule')).click();
    await ruleName.clear();
    await ruleName.sendKeys("Rule1");
    await element(by.buttonText('Medium')).click();
    await element(by.id('mat-input-0')).sendKeys('Is Process Signed = Signed');
    await element(by.buttonText('Save')).click();
    let msgdiv = await element(by.xpath("//span[@class='noty-msg']")).getText();
    console.log("Validation message:-",msgdiv);
    await expect(msgdiv).toBe("Rule Added Successfully");
    

  });

