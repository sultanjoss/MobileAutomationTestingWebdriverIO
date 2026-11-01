
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { iosTestData } from '../data/iosTestData';

describe('iOS - SwagLabs Login', () => {

    const loginPage = new LoginPage();
    const productsPage = new ProductsPage();

    it(
        'TC-IOS-LOGIN-001 - Login berhasil dengan kredensial valid',
        async () => {

            // ==========================================
            // STEP 1 - OPEN LOGIN PAGE
            // ==========================================

            await loginPage.openLoginPage();

            await loginPage.verifyLoginPage();

            // ==========================================
            // STEP 2 - INPUT LOGIN CREDENTIALS
            // ==========================================

            await loginPage.login(
                iosTestData.login.username,
                iosTestData.login.password
            );

            // ==========================================
            // STEP 3 - VALIDATE LOGIN SUCCESS
            // ==========================================

            await productsPage.verifyProductsPage();

            console.log(
                '[IOS LOGIN PASS] Halaman PRODUCTS tampil'
            );
        }
    );
});
