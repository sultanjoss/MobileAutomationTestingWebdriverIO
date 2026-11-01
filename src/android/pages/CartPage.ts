
import { $ } from '@wdio/globals';
import { BasePage } from '../../pages/BasePage';
import { CartLocators } from '../locators/CartLocators';

export class CartPage extends BasePage {

    // ELEMENTS
    get cartTitle() {
        return $(CartLocators.cartTitle);
    }

    get backpackName() {
        return $(CartLocators.backpackName);
    }

    get checkoutButton() {
        return $(CartLocators.checkoutButton);
    }

    // ACTIONS
    async verifyCartPage(): Promise<void> {
        await this.cartTitle.waitForDisplayed({
            timeout: 15000
        });
    }

    async verifyBackpackInCart(): Promise<void> {
        await this.backpackName.waitForDisplayed({
            timeout: 10000
        });
    }

    async proceedToCheckout(): Promise<void> {
        await this.checkoutButton.waitForDisplayed({
            timeout: 10000
        });

        await this.checkoutButton.click();
    }
}
