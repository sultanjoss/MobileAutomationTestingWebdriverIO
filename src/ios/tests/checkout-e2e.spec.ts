
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

import { iosTestData } from '../data/iosTestData';

// ======================================================
// IOS - SWAGLABS CHECKOUT END-TO-END TEST
// ======================================================

describe('@regression iOS - SwagLabs Checkout E2E', () => {

    // ==============================================
    // PAGE OBJECT INITIALIZATION
    // ==============================================

    const loginPage = new LoginPage();
    const productsPage = new ProductsPage();
    const cartPage = new CartPage();
    const checkoutPage = new CheckoutPage();

    // ==============================================
    // TEST CASE - SUCCESSFUL CHECKOUT
    // ==============================================

    it(
        'TC-IOS-E2E-001 - Pembelian produk berhasil',
        async () => {

            // ==========================================
            // STEP 1 - LOGIN
            // ==========================================

            await loginPage.openLoginPage();

            await loginPage.login(
                iosTestData.login.username,
                iosTestData.login.password
            );

            await productsPage.verifyProductsPage();

            // ==========================================
            // STEP 2 - ADD PRODUCT TO CART
            // ==========================================

            await productsPage.addBackpackToCart();

            // ==========================================
            // STEP 3 - OPEN AND VERIFY CART
            // ==========================================

            await productsPage.openCart();

            await cartPage.verifyCartPage();

            await cartPage.verifyBackpackInCart();

            // ==========================================
            // STEP 4 - CHECKOUT INFORMATION
            // ==========================================

            await cartPage.proceedToCheckout();

            await checkoutPage.verifyInformationPage();

            await checkoutPage.fillCheckoutInformation(
                iosTestData.customer.firstName,
                iosTestData.customer.lastName,
                iosTestData.customer.postalCode
            );

            // ==========================================
            // STEP 5 - CHECKOUT OVERVIEW
            // ==========================================

            await checkoutPage.continueCheckout();

            await checkoutPage.verifyOverviewPage();

            // ==========================================
            // STEP 6 - FINISH CHECKOUT
            // ==========================================

            await checkoutPage.finishCheckout();

            // ==========================================
            // STEP 7 - VERIFY CHECKOUT COMPLETE
            // ==========================================

            await checkoutPage.verifyCheckoutComplete();

            // ==========================================
            // STEP 8 - BACK TO PRODUCTS
            // ==========================================

            await checkoutPage.backToProducts();

            await productsPage.verifyProductsPage();

            // ==========================================
            // TEST EXECUTION COMPLETED
            // ==========================================

            console.log(
                '[IOS E2E PASS] Checkout berhasil dan kembali ke halaman PRODUCTS'
            );
        }
    );
});
