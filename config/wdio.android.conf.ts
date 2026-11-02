
import type { MobileConfig } from './wdio.shared.conf';
import { sharedConfig } from './wdio.shared.conf';

// ======================================================
// ANDROID - WEBDRIVERIO CONFIGURATION
// Appium + UiAutomator2 + Mocha + Device Farm
// ======================================================

export const config: MobileConfig = {
    ...sharedConfig,

    // ==================================================
    // ANDROID DEVICE CAPABILITIES
    // ==================================================

    capabilities: [
        {
            // ==========================================
            // PLATFORM & AUTOMATION DRIVER
            // ==========================================

            platformName: 'Android',

            'appium:automationName': 'UiAutomator2',

            // ==========================================
            // REAL ANDROID DEVICE
            // ==========================================

            'appium:deviceName': 'itel A6610L',

            'appium:udid':
                process.env.ANDROID_UDID ||
                '146957054F004347',

            'appium:platformVersion': '14',

            // ==========================================
            // APPLICATION CONFIGURATION
            // ==========================================

            'appium:appPackage':
                'com.swaglabsmobileapp',

            'appium:appActivity':
                'com.swaglabsmobileapp.SplashActivity',

            // ==========================================
            // APPLICATION SESSION MANAGEMENT
            // ==========================================

            'appium:noReset': false,

            'appium:fullReset': false,

            'appium:forceAppLaunch': true,

            'appium:shouldTerminateApp': true,

            'appium:newCommandTimeout': 120,

            // ==========================================
            // STABILITY & PERFORMANCE
            // ==========================================

            // Nonaktifkan animasi sistem selama sesi.
            'appium:disableWindowAnimation': true,

            // Timeout untuk menjalankan perintah ADB.
            'appium:adbExecTimeout': 30000,

            // ==========================================
            // APPIUM DEVICE FARM
            // ==========================================

            'df:options': {
                runsOn: 'real',

                buildName: 'Android Mocha Regression',

                recordVideo: false
            }
        }
    ]
};
