
import { expect } from '@wdio/globals';

import { LoginPage } from '../pages/LoginPage';

// ======================================================
// ANDROID - NEGATIVE LOGIN TESTING
// ======================================================

describe('@smoke @regression Android - SwagLabs Negative Login', () => {

    const loginPage = new LoginPage();

    // ==================================================
    // TC-LOGIN-002 - EMPTY USERNAME & PASSWORD
    // ==================================================

    it(
        'TC-Login-002 - login username kosong dan password kosong',
        async () => {

            console.log('[TEST START] TC-Login-002');

            // ------------------------------------------
            // STEP 1 - Verify Login Page
            // ------------------------------------------

            await expect(
                loginPage.usernameinput
            ).toBeDisplayed();

            await expect(
                loginPage.passwordinput
            ).toBeDisplayed();

            // ------------------------------------------
            // STEP 2 - Clear Credentials
            // ------------------------------------------

            await loginPage.usernameinput.clearValue();
            await loginPage.passwordinput.clearValue();

            // ------------------------------------------
            // STEP 3 - Submit Empty Login
            // ------------------------------------------

            await loginPage.clickloginbutton();

            // ------------------------------------------
            // STEP 4 - Validate Error Message
            // ------------------------------------------

            const actualError =
                await loginPage.getloginpesaneror();

            expect(actualError).toContain(
                'Username is required'
            );

            // ------------------------------------------
            // STEP 5 - Verify User Remains on Login
            // ------------------------------------------

            await expect(
                loginPage.usernameinput
            ).toBeDisplayed();

            console.log(
                '[TEST PASS] Sistem menolak login dengan data kosong'
            );
        }
    );
});
