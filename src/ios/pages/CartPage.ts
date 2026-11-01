
import { $, expect } from '@wdio/globals';
import { IOSLocators } from '../locators/IOSLocators';

export class CartPage {

    get cartTitle() {
        return $(IOSLocators.cart.title);
    }

    get backpackName() {
        return $(IOSLocators.cart.backpackName);
    }

    get checkoutButton() {
        return $(IOSLocators.cart.checkoutButton);
    }

    // ==============================================
    // VALIDATE CART PAGE
    // ==============================================

    async verifyCartPage(): Promise<void> {

        await this.cartTitle.waitForDisplayed({
            timeout: 15000
        });

        await expect(
            this.cartTitle
        ).toBeDisplayed();
    }

    // ==============================================
    // VALIDATE BACKPACK IN CART
    // ==============================================

    async verifyBackpackInCart(): Promise<void> {

        await expect(
            this.backpackName
        ).toBeDisplayed();
    }

    // ==============================================
    // PROCEED TO CHECKOUT
    // ==============================================

    async proceedToCheckout(): Promise<void> {

        await this.checkoutButton.waitForDisplayed({
            timeout: 15000
        });

        await this.checkoutButton.click();
    }
}