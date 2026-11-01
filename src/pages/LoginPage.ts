
import { $ } from '@wdio/globals';
import { BasePage } from './BasePage';

// ======================================================
// LOGIN PAGE OBJECT MODEL
// ======================================================

export class LoginPage extends BasePage {

    // ==================================================
    // LOCATORS - ANDROID & IOS
    // ==================================================

    get usernameinput() {
        return $('~test-Username');
    }
    
    get passwordinput() {
        return $('~test-Password');
    }

    get loginButton() {
        return $('~test-LOGIN');
    }

    get loginpesaneror() {
        return $('~test-Error message');
    }

    // ==================================================
    // LOGIN ACTIONS
    // ==================================================

    async inputUsername(username: string) {
        await this.usernameinput.setValue(username);
    }

    async inputPassword(password: string) {
        await this.passwordinput.setValue(password);
    }

    async clickloginbutton() {
        await this.loginButton.click();
    }

    // ==================================================
    // COMBINED LOGIN ACTION
    // ==================================================

    async login(username: string, password: string) {
        await this.inputUsername(username);
        await this.inputPassword(password);
        await this.clickloginbutton();
    }

    // ==================================================
    // GET LOGIN ERROR MESSAGE - ANDROID & IOS
    // ==================================================

    async getloginpesaneror(): Promise<string> {

        const errorElement = this.loginpesaneror;

        // 1. Tunggu elemen error tampil
        await errorElement.waitForDisplayed({
            timeout: 10000
        });

        // 2. Ambil teks langsung dari elemen error
        const errorText = (await errorElement.getText()).trim();

        if (errorText) {
            return errorText;
        }

        // 3. Fallback: ambil teks dari child element
        const children = await errorElement.$$('.//*');

        for (const child of children) {

            const childText = (await child.getText()).trim();

            if (childText) {

                console.log(
                    `[LOGIN ERROR] ${childText}`
                );

                return childText;
            }
        }

        // 4. Error jika pesan tidak ditemukan
        throw new Error(
            '[LOGIN ERROR] Elemen error ditemukan, ' +
            'tetapi teks pesan error kosong.'
        );
    }
}
