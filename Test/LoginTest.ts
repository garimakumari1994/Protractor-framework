// import { LoginPage } from "../Pages/LoginPage";
// import { jsonread } from "../Utility/jsonread";
// import { browser, element, by, protractor, $$, $ } from 'protractor';


// // Test Case For Application Login and drop down selection
// describe("Open Application", () => {
//     let jsonobject = new jsonread();
//     let loginPageObject = new LoginPage();
//     let EC = protractor.ExpectedConditions;
//     let logindata = jsonobject.read('TestData\\' + browser.params.client + '\\'+ browser.params.environment + '\\Login_Data.json');

//     it("Login To Application and Select Client", async () => {
//         await loginPageObject.openApplicationURL(logindata.url);
//         await loginPageObject.clickRegistration();
   
//        // await browser.waitForAngularEnabled(true);
       
//         await loginPageObject.addDetails(logindata.Un,logindata.PWD,logindata.DESC);
//         //await loginPageObject.clickLogin();
//         //expect(await loginPageObject.loginPageReport.getText()).toEqual(logindata.ExpectedReport);
        
//     });
//     it("Login To Application and Select Client", async () => {
//         await loginPageObject.openApplicationURL(logindata.url);
//         await loginPageObject.clickRegistration();
   
//        // await browser.waitForAngularEnabled(true);
       
//         await loginPageObject.addDetails(logindata.Un,logindata.PWD,logindata.DESC);
//         //await loginPageObject.clickLogin();
//         //expect(await loginPageObject.loginPageReport.getText()).toEqual(logindata.ExpectedReport);
        
//     });
//     it("Login To Application and Select Client", async () => {
     

//         await loginPageObject.openApplicationURL(logindata.url);
//         await loginPageObject.clickRegistration();
   
//        // await browser.waitForAngularEnabled(true);
       
//         await loginPageObject.addDetails(logindata.Un,logindata.PWD,logindata.DESC);
//         //await loginPageObject.clickLogin();
//         //expect(await loginPageObject.loginPageReport.getText()).toEqual(logindata.ExpectedReport);
        
//     });

    
    
// });
