import { $, browser } from '@wdio/globals';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage{

    // locator halaman product sesuai platfrom
    get productTitle(){
        if(browser.isAndroid){
            return $('android=new UiSelector().text("PRODUCTS")');
        }
        return $('-ios class chain:**/XCUIElementTypeStaticText[`name == "PRODUCTS"`]');
    }
    async verifyHalamanProduk():Promise <void>{
        await this.productTitle.waitForDisplayed({timeout: 15000});
    }



}