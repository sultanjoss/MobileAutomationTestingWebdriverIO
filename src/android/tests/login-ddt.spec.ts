
import { expect } from '@wdio/globals';

import { LoginPage } from '../pages/LoginPage';
import { negativeLoginData } from '../../../test-data/loginData';

// ======================================================
// ANDROID - DATA DRIVEN NEGATIVE LOGIN TESTING
// ======================================================

describe('@smoke Android - SwagLabs Login DDT', () => {

    const loginPage = new LoginPage();

    // ==================================================
    // GENERATE TEST CASES FROM DATASET
    // ==================================================

    for (const data of negativeLoginData) {

        it(`${data.id} - ${data.description}`, async () => {

            console.log(`[TEST START] ${data.id}`);

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
            // STEP 2 - Enter Dataset Credentials
            // ------------------------------------------

            await loginPage.inputUsername(
                data.username
            );

            await loginPage.inputPassword(
                data.password
            );

            // ------------------------------------------
            // STEP 3 - Submit Login
            // ------------------------------------------

            await loginPage.clickloginbutton();

            // ------------------------------------------
            // STEP 4 - Get Actual Validation Message
            // ------------------------------------------

            const actualError =
                await loginPage.getloginpesaneror();

            console.log(`[ACTUAL ERROR] ${actualError}`);

            // ------------------------------------------
            // STEP 5 - Validate Expected Error
            // ------------------------------------------

            expect(actualError).toContain(
                data.expectedError
            );

            // ------------------------------------------
            // STEP 6 - Verify User Remains on Login
            // ------------------------------------------

            await expect(
                loginPage.usernameinput
            ).toBeDisplayed();

            console.log(`[TEST PASS] ${data.id}`);
        });
    }
});
