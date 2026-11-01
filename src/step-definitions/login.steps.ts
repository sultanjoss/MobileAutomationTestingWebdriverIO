import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';

import { LoginPage } from '../pages/LoginPage';
import { ProductPage } from '../pages/ProductsPage';

const loginPage = new LoginPage();
const productPage = new ProductPage();

// memastikan halaman login tampil
Given('pengguna berada di halaman login', async ()=> {
    await expect(loginPage.usernameinput).toBeDisplayed();
    await expect(loginPage.passwordinput).toBeDisplayed();

    console.log('STEP - Halaman login berhasil tampil');

});
When('pengguna login menggunakan username {string} dan password {string}', async (username: string, password: string)=>{
    await loginPage.login(username,password);
    console.log('WHEN - login di jalankan');
});
Then('sistem menampilkan halaman PRODUCTS', async ()=>{
    await expect(productPage.productTitle).toBeDisplayed();
    console.log('THEN - halaman product tampil');
});