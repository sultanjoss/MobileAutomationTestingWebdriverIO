
import { $, browser, expect } from '@wdio/globals';
import { IOSLocators } from '../locators/IOSLocators';

export class CheckoutPage {

    get informationTitle() {
        return $(IOSLocators.checkout.informationTitle);
    }

    get firstNameInput() {
        return $(IOSLocators.checkout.firstName);
    }

    get lastNameInput() {
        return $(IOSLocators.checkout.lastName);
    }

    get postalCodeInput() {
        return $(IOSLocators.checkout.postalCode);
    }

    get continueButton() {
        return $(IOSLocators.checkout.continueButton);
    }

    get overviewTitle() {
        return $(IOSLocators.checkout.overviewTitle);
    }

    get finishButton() {
        return $(IOSLocators.checkout.finishButton);
    }

    get completeTitle() {
        return $(IOSLocators.checkout.completeTitle);
    }

    get backHomeButton() {
        return $(IOSLocators.checkout.backHomeButton);
    }

    // ==============================================
    // VERIFY INFORMATION PAGE
    // ==============================================

    async verifyInformationPage(): Promise<void> {

        await this.informationTitle.waitForDisplayed({
            timeout: 15000
        });

        await expect(
            this.informationTitle
        ).toBeDisplayed();
    }

    // ==============================================
    // FILL CUSTOMER INFORMATION
    // ==============================================

    async fillCheckoutInformation(
        firstName: string,
        lastName: string,
        postalCode: string
    ): Promise<void> {

        await this.firstNameInput.setValue(firstName);
        await this.lastNameInput.setValue(lastName);
        await this.postalCodeInput.setValue(postalCode);

        // Validate input values.
        await expect(
            this.firstNameInput
        ).toHaveText(firstName);

        await expect(
            this.lastNameInput
        ).toHaveText(lastName);

        await expect(
            this.postalCodeInput
        ).toHaveText(postalCode);
    }

    // ==============================================
    // CONTINUE CHECKOUT
    // ==============================================

    async continueCheckout(): Promise<void> {

        await this.continueButton.click();
    }

    // ==============================================
    // VERIFY OVERVIEW
    // ==============================================

    async verifyOverviewPage(): Promise<void> {

        await this.overviewTitle.waitForDisplayed({
            timeout: 15000
        });

        await expect(
            this.overviewTitle
        ).toBeDisplayed();
    }

    // ==============================================
    // FINISH CHECKOUT
    // ==============================================

    async finishCheckout(): Promise<void> {

        // Tombol FINISH berada di bagian bawah.
        // Scroll hanya dilakukan saat belum tampil.

        for (let attempt = 0; attempt < 5; attempt++) {

            if (await this.finishButton.isDisplayed()) {
                break;
            }

            await browser.execute('mobile: scroll', {
                direction: 'down'
            });
        }

        await this.finishButton.waitForDisplayed({
            timeout: 10000
        });

        await this.finishButton.click();
    }

    // ==============================================
    // VERIFY CHECKOUT COMPLETE
    // ==============================================

    async verifyCheckoutComplete(): Promise<void> {

        await this.completeTitle.waitForDisplayed({
            timeout: 15000
        });

        await expect(
            this.completeTitle
        ).toBeDisplayed();
    }

    // ==============================================
    // BACK HOME
    // ==============================================

    async backToProducts(): Promise<void> {

        await this.backHomeButton.click();
    }
}
