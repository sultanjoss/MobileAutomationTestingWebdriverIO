
import { $, browser } from '@wdio/globals';
import { BasePage } from '../../pages/BasePage';
import { CheckoutLocators } from '../locators/CheckoutLocators';

export class CheckoutPage extends BasePage {

    // CHECKOUT INFORMATION
    get informationTitle() {
        return $(CheckoutLocators.informationTitle);
    }

    get firstNameInput() {
        return $(CheckoutLocators.firstNameInput);
    }

    get lastNameInput() {
        return $(CheckoutLocators.lastNameInput);
    }

    get postalCodeInput() {
        return $(CheckoutLocators.postalCodeInput);
    }

    get continueButton() {
        return $(CheckoutLocators.continueButton);
    }

    // CHECKOUT OVERVIEW
    get overviewTitle() {
        return $(CheckoutLocators.overviewTitle);
    }

    get backpackName() {
        return $(CheckoutLocators.backpackName);
    }

    get finishButton() {
        return $(CheckoutLocators.finishButton);
    }

    // CHECKOUT COMPLETE
    get completeTitle() {
        return $(CheckoutLocators.completeTitle);
    }

    get backHomeButton() {
        return $(CheckoutLocators.backHomeButton);
    }

    // ==================================================
    // CHECKOUT INFORMATION
    // ==================================================

    async verifyInformationPage(): Promise<void> {
        await this.informationTitle.waitForDisplayed({
            timeout: 15000
        });
    }

    async fillCheckoutInformation(
        firstName: string,
        lastName: string,
        postalCode: string
    ): Promise<void> {

        await this.firstNameInput.setValue(firstName);
        await this.lastNameInput.setValue(lastName);
        await this.postalCodeInput.setValue(postalCode);
    }

    async continueCheckout(): Promise<void> {
        await this.continueButton.waitForDisplayed({
            timeout: 10000
        });

        await this.continueButton.click();
    }

    // ==================================================
    // CHECKOUT OVERVIEW
    // ==================================================

    async verifyOverviewPage(): Promise<void> {
        await this.overviewTitle.waitForDisplayed({
            timeout: 15000
        });
    }

    async verifyBackpackInOverview(): Promise<void> {
        await this.backpackName.waitForDisplayed({
            timeout: 10000
        });
    }

    // ==================================================
    // SCROLL AND FINISH
    // ==================================================

    async scrollToFinishButton(): Promise<void> {

        // Cek apakah tombol sudah terlihat.
        if (await this.finishButton.isDisplayed()) {
            return;
        }

        const screen = await browser.getWindowRect();

        // Gesture di bagian tengah layar.
        const area = {
            left: Math.round(screen.width * 0.10),
            top: Math.round(screen.height * 0.25),
            width: Math.round(screen.width * 0.80),
            height: Math.round(screen.height * 0.55)
        };

        // Batasi jumlah scroll agar tidak infinite loop.
        for (let attempt = 1; attempt <= 5; attempt++) {

            console.log(
                `[CHECKOUT] Scroll menuju FINISH: ${attempt}`
            );

            await browser.execute('mobile: scrollGesture', {
                ...area,
                direction: 'down',
                percent: 0.75
            });

            if (await this.finishButton.isDisplayed()) {
                return;
            }
        }

        throw new Error(
            '[CHECKOUT] Tombol FINISH tidak terlihat setelah scroll.'
        );
    }

    async finishCheckout(): Promise<void> {

        await this.scrollToFinishButton();

        await this.finishButton.waitForDisplayed({
            timeout: 10000
        });

        await this.finishButton.click();
    }

    // ==================================================
    // CHECKOUT COMPLETE
    // ==================================================

    async verifyCheckoutComplete(): Promise<void> {
        await this.completeTitle.waitForDisplayed({
            timeout: 15000
        });
    }

    async backToProducts(): Promise<void> {
        await this.backHomeButton.waitForDisplayed({
            timeout: 10000
        });

        await this.backHomeButton.click();
    }
}
