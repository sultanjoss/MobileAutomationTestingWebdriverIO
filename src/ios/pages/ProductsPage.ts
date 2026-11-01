
import { $, expect } from '@wdio/globals';
import { IOSLocators } from '../locators/IOSLocators';

export class ProductsPage {

    get productsTitle() {
        return $(IOSLocators.products.title);
    }

    get backpackName() {
        return $(IOSLocators.products.backpackName);
    }

    get addBackpackButton() {
        return $(IOSLocators.products.addBackpackToCart);
    }

    get cartButton() {
        return $(IOSLocators.products.cartWithOneItem);
    }

    // ==============================================
    // VALIDATE PRODUCTS PAGE
    // ==============================================

    async verifyProductsPage(): Promise<void> {

        await this.productsTitle.waitForDisplayed({
            timeout: 20000
        });

        await expect(
            this.productsTitle
        ).toBeDisplayed();
    }

    // ==============================================
    // VALIDATE BACKPACK
    // ==============================================

    async verifyBackpack(): Promise<void> {

        await expect(
            this.backpackName
        ).toBeDisplayed();
    }

    // ==============================================
    // ADD BACKPACK TO CART
    // ==============================================

    async addBackpackToCart(): Promise<void> {

        await this.addBackpackButton.waitForDisplayed({
            timeout: 15000
        });

        await this.addBackpackButton.click();
    }

    // ==============================================
    // OPEN CART
    // ==============================================

    async openCart(): Promise<void> {

        await this.cartButton.waitForDisplayed({
            timeout: 15000
        });

        await this.cartButton.click();
    }
}
