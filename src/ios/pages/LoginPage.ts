
import { $, expect } from '@wdio/globals';
import { IOSLocators } from '../locators/IOSLocators';

export class LoginPage {

    get menuButton() {
        return $(IOSLocators.navigation.menuButton);
    }

    get loginMenu() {
        return $(IOSLocators.navigation.loginMenu);
    }

    get usernameInput() {
        return $(IOSLocators.login.username);
    }

    get passwordInput() {
        return $(IOSLocators.login.password);
    }

    get loginButton() {
        return $(IOSLocators.login.loginButton);
    }

    // ==============================================
    // OPEN LOGIN PAGE
    // ==============================================

    async openLoginPage(): Promise<void> {

        // Tidak perlu navigasi jika sudah di halaman login.
        if (await this.usernameInput.isDisplayed()) {
            return;
        }

        await this.menuButton.waitForDisplayed({
            timeout: 15000
        });

        await this.menuButton.click();

        await this.loginMenu.waitForDisplayed({
            timeout: 10000
        });

        await this.loginMenu.click();

        await this.usernameInput.waitForDisplayed({
            timeout: 15000
        });
    }

    // ==============================================
    // LOGIN ACTION
    // ==============================================

    async login(
        username: string,
        password: string
    ): Promise<void> {

        await this.usernameInput.setValue(username);

        await this.passwordInput.setValue(password);

        await this.loginButton.click();
    }

    // ==============================================
    // VALIDATE LOGIN PAGE
    // ==============================================

    async verifyLoginPage(): Promise<void> {

        await expect(
            this.usernameInput
        ).toBeDisplayed();

        await expect(
            this.passwordInput
        ).toBeDisplayed();

        await expect(
            this.loginButton
        ).toBeDisplayed();
    }
}
