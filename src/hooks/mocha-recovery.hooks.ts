
import { browser, expect } from '@wdio/globals';
import { LoginPage } from '../pages/LoginPage';

// ======================================================
// MOCHA MOBILE RECOVERY
// ======================================================

export async function recoverMochaApp(): Promise<void> {

    const platform = String(
        browser.capabilities.platformName ?? ''
    ).toLowerCase();

    let appId: string;

    if (platform === 'android') {

        appId = 'com.swaglabsmobileapp';

    } else if (platform === 'ios') {

        appId = 'com.saucelabs.SwagLabsMobileApp';

    } else {

        throw new Error(
            `[MOCHA RECOVERY] Platform tidak didukung: ${platform}`
        );
    }

    console.log(`[MOCHA RECOVERY] Platform: ${platform}`);
    console.log('[MOCHA RECOVERY] Restart aplikasi');

    // Hentikan aplikasi tanpa menghapus data
    await browser.terminateApp(appId);

    // Jalankan aplikasi kembali
    await browser.activateApp(appId);

    // Pastikan aplikasi kembali ke halaman login
    const loginPage = new LoginPage();

    await expect(loginPage.usernameinput).toBeDisplayed({
        wait: 15000
    });

    await expect(loginPage.passwordinput).toBeDisplayed({
        wait: 15000
    });

    console.log(
        '[MOCHA RECOVERY] Halaman login berhasil divalidasi'
    );
}
