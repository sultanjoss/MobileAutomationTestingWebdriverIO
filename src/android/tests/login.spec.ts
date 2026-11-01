
import { expect } from '@wdio/globals';

import { LoginPage } from '../pages/LoginPage';
import { ProductPage } from '../pages/ProductsPage';

// ======================================================
// ANDROID - SWAG LABS LOGIN TESTING
// ======================================================

describe('@smoke Android - Swag Labs Login Testing', () => {

    const loginPage = new LoginPage();
    const productPage = new ProductPage();

    // ==================================================
    // TC-001 - POSITIVE LOGIN
    // ==================================================

    it('TC-001 Login dengan username dan password benar', async () => {

        console.log('[TC-001] Login Positif');

        // ----------------------------------------------
        // STEP 1 - Verify Login Page
        // ----------------------------------------------

        await expect(
            loginPage.usernameinput
        ).toBeDisplayed();

        await expect(
            loginPage.passwordinput
        ).toBeDisplayed();

        console.log('[STEP 1] Halaman login tampil');

        // ----------------------------------------------
        // STEP 2 - Login with Valid Credentials
        // ----------------------------------------------

        await loginPage.login(
            'standard_user',
            'secret_sauce'
        );

        console.log('[STEP 2] Proses login dijalankan');

        // ----------------------------------------------
        // STEP 3 - Verify Products Page
        // ----------------------------------------------

        await productPage.verifyHalamanProduk();

        await expect(
            productPage.productTitle
        ).toBeDisplayed();

        console.log(
            '[PASS] Halaman Products berhasil ditampilkan'
        );
    });
});
