import type { MobileConfig } from './wdio.shared.conf';
import { sharedConfig } from './wdio.shared.conf';

export const config: MobileConfig = {
    ...sharedConfig,
    capabilities: [{
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': 'itel A6610L',
        'appium:udid': process.env.ANDROID_UDID || '146957054F004347',
        'appium:platformVersion': '14',
        'appium:appPackage': 'com.swaglabsmobileapp',
        // Activity perlu diverifikasi dengan APK terinstal jika launch gagal.
        'appium:appActivity': 'com.swaglabsmobileapp.SplashActivity',
        'appium:noReset': false,
        'appium:fullReset': false,
        'appium:forceAppLaunch': true,
        'appium:shouldTerminateApp': true,
        'appium:newCommandTimeout': 120,
        'df:options': {
            runsOn: 'real',
            buildName: 'Android Mocha Regression',
            recordVideo: false,
        },
    }],
};
