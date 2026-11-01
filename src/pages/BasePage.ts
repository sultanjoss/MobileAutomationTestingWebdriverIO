
import { browser } from '@wdio/globals';

export class BasePage {

    async getPlatformName(): Promise<string> {
        return browser.isAndroid ? 'Android' : 'iOS';
    }

    async isAppRunning(): Promise<boolean> {
        const source = await browser.getPageSource();
        return source.length > 0;
    }
}
