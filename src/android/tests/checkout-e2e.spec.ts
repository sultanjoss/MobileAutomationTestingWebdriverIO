
import { expect } from '@wdio/globals';

import { LoginPage } from '../pages/LoginPage';
import { ProductPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

import { checkoutData } from '../data/checkoutData';

// ======================================================
// ANDROID - SWAGLABS CHECKOUT E2E
// ======================================================

describe('@regression Android - SwagLabs Checkout E2E', () => {

    // ==================================================
    // PAGE OBJECT INITIALIZATION
    // ==================================================

    const loginPage = new LoginPage();
    const productPage = new ProductPage();
    const cartPage = new CartPage();
    const checkoutPage = new CheckoutPage();

    // ==================================================
    // TC-AND-E2E-001 - SUCCESSFUL CHECKOUT
    // ==================================================

    it(
        'TC-AND-E2E-001 - Pembelian Sauce Labs Backpack berhasil',
        async () => {

            // ==========================================
            // STEP 1 - LOGIN
            // ==========================================

            await expect(
                loginPage.usernameinput
            ).toBeDisplayed();

            await loginPage.login(
                checkoutData.login.username,
                checkoutData.login.password
            );

            await productPage.verifyHalamanProduk();

            // ==========================================
            // STEP 2 - VALIDATE PRODUCT
            // ==========================================

            await productPage.verifyBackpackAvailable();

            await expect(
                productPage.backpackName
            ).toHaveText(checkoutData.productName);

            // ==========================================
            // STEP 3 - ADD PRODUCT TO CART
            // ==========================================

            await productPage.addBackpackToCart();

            // ==========================================
            // STEP 4 - VALIDATE CART
            // ==========================================

            await productPage.openCart();

            await cartPage.verifyCartPage();
            await cartPage.verifyBackpackInCart();

            await expect(
                cartPage.backpackName
            ).toHaveText(checkoutData.productName);

            // ==========================================
            // STEP 5 - CHECKOUT INFORMATION
            // ==========================================

            await cartPage.proceedToCheckout();

            await checkoutPage.verifyInformationPage();

            await checkoutPage.fillCheckoutInformation(
                checkoutData.customer.firstName,
                checkoutData.customer.lastName,
                checkoutData.customer.postalCode
            );

            await expect(
                checkoutPage.firstNameInput
            ).toHaveText(checkoutData.customer.firstName);

            await expect(
                checkoutPage.lastNameInput
            ).toHaveText(checkoutData.customer.lastName);

            await expect(
                checkoutPage.postalCodeInput
            ).toHaveText(checkoutData.customer.postalCode);

            // ==========================================
            // STEP 6 - CHECKOUT OVERVIEW
            // ==========================================

            await checkoutPage.continueCheckout();

            await checkoutPage.verifyOverviewPage();
            await checkoutPage.verifyBackpackInOverview();

            await expect(
                checkoutPage.backpackName
            ).toHaveText(checkoutData.productName);

            // ==========================================
            // STEP 7 - FINISH CHECKOUT
            // ==========================================

            await checkoutPage.finishCheckout();

            // ==========================================
            // STEP 8 - CHECKOUT COMPLETE
            // ==========================================

            await checkoutPage.verifyCheckoutComplete();

            await expect(
                checkoutPage.completeTitle
            ).toBeDisplayed();

            // ==========================================
            // STEP 9 - BACK TO PRODUCTS
            // ==========================================

            await checkoutPage.backToProducts();

            await productPage.verifyHalamanProduk();

            await expect(
                productPage.productTitle
            ).toBeDisplayed();

            console.log(
                '[E2E PASS] Semua langkah Checkout selesai'
            );
        }
    );
});
