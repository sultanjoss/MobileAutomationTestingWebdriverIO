
import { $ } from '@wdio/globals';

import { BasePage } from '../../pages/BasePage';
import { LoginLocators } from '../locators/LoginLocators';

// ======================================================
// ANDROID - LOGIN PAGE OBJECT MODEL
// ======================================================

export class LoginPage extends BasePage {

    // ==================================================
    // 1. ELEMENTS
    // ==================================================

    get usernameinput() {
        return $(LoginLocators.usernameInput);
    }

    get passwordinput() {
        return $(LoginLocators.passwordInput);
    }

    get loginButton() {
        return $(LoginLocators.loginButton);
    }

    get loginpesaneror() {
        return $(LoginLocators.errorMessage);
    }

    // ==================================================
    // 2. LOGIN ACTIONS
    // ==================================================

    async inputUsername(username: string): Promise<void> {
        await this.usernameinput.setValue(username);
    }

    async inputPassword(password: string): Promise<void> {
        await this.passwordinput.setValue(password);
    }

    async clickloginbutton(): Promise<void> {
        await this.loginButton.click();
    }

    // ==================================================
    // 3. COMPLETE LOGIN FLOW
    // ==================================================

    async login(
        username: string,
        password: string
    ): Promise<void> {

        await this.inputUsername(username);
        await this.inputPassword(password);
        await this.clickloginbutton();
    }

    // ==================================================
    // 4. LOGIN ERROR MESSAGE
    // ==================================================

    async getloginpesaneror(): Promise<string> {

        const errorElement = this.loginpesaneror;

        await errorElement.waitForDisplayed({
            timeout: 10000
        });

        // Read error message directly
        const errorText = (
            await errorElement.getText()
        ).trim();

        if (errorText) {
            return errorText;
        }

        // Fallback: read text from child elements
        const children = await errorElement.$$('.//*');

        for (const child of children) {

            const childText = (
                await child.getText()
            ).trim();

            if (childText) {
                console.log(`[LOGIN ERROR] ${childText}`);
                return childText;
            }
        }

        throw new Error(
            '[LOGIN ERROR] Elemen error ditemukan, ' +
            'tetapi teks pesan error kosong.'
        );
    }
}
