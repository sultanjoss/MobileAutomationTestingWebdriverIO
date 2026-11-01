
import { $ } from '@wdio/globals';
import { BasePage } from '../../pages/BasePage';
import { ProductsLocators } from '../locators/ProductsLocators';

export class ProductPage extends BasePage {

    // ELEMENTS
    get productTitle() {
        return $(ProductsLocators.productTitle);
    }

    get backpackName() {
        return $(ProductsLocators.backpackName);
    }

    get addToCartButton() {
        return $(ProductsLocators.addToCartButton);
    }

    get cartButton() {
        return $(ProductsLocators.cartButton);
    }

    // ACTIONS
    async verifyHalamanProduk(): Promise<void> {
        await this.productTitle.waitForDisplayed({
            timeout: 15000
        });
    }

    async verifyBackpackAvailable(): Promise<void> {
        await this.backpackName.waitForDisplayed({
            timeout: 15000
        });
    }

    async addBackpackToCart(): Promise<void> {
        await this.addToCartButton.waitForDisplayed({
            timeout: 10000
        });

        await this.addToCartButton.click();
    }

    async openCart(): Promise<void> {
        await this.cartButton.waitForDisplayed({
            timeout: 10000
        });

        await this.cartButton.click();
    }
}
