
import type { MobileConfig } from './wdio.shared.conf';

// ======================================================
// 1. IOS SIMULATOR CONFIGURATION
// ======================================================

const IOS_DEVICE_NAME =
    process.env.IOS_DEVICE_NAME || 'iPhone 16e';

const IOS_PLATFORM_VERSION =
    process.env.IOS_PLATFORM_VERSION || '26.3';

const IOS_DEVICE_UDID =
    process.env.IOS_DEVICE_UDID ||
    '0339E1E4-3925-454F-8AAE-890563DAAE15';

// ======================================================
// 2. IOS APPLICATION CONFIGURATION
// ======================================================

const IOS_BUNDLE_ID =
    process.env.IOS_BUNDLE_ID ||
    'com.saucelabs.SwagLabsMobileApp';

// Optional: path file .app khusus iOS Simulator.
// Jika tidak diisi, Appium menggunakan aplikasi
// yang sudah terinstal berdasarkan Bundle ID.
const IOS_APP_PATH = process.env.IOS_APP_PATH;

// ======================================================
// 3. APPIUM SERVER CONFIGURATION
// ======================================================

const APPIUM_HOST =
    process.env.APPIUM_HOST || '127.0.0.1';

const APPIUM_PORT = Number(
    process.env.APPIUM_PORT || 4723
);

// ======================================================
// 4. IOS WEBDRIVERIO CONFIGURATION
// ======================================================

export const config: MobileConfig = {

    // ==============================================
    // EXECUTION RUNNER
    // ==============================================

    runner: 'local',

    // ==============================================
    // APPIUM SERVER CONNECTION
    // ==============================================

    hostname: APPIUM_HOST,

    port: APPIUM_PORT,

    path: '/',

    // ==============================================
    // IOS SIMULATOR CAPABILITIES
    // ==============================================

    capabilities: [
        {
            // ==========================================
            // PLATFORM
            // ==========================================

            platformName: 'iOS',

            'appium:automationName': 'XCUITest',

            // ==========================================
            // TARGET DEVICE - IPHONE 16E
            // ==========================================

            'appium:deviceName': IOS_DEVICE_NAME,

            'appium:platformVersion':
                IOS_PLATFORM_VERSION,

            'appium:udid': IOS_DEVICE_UDID,

            // ==========================================
            // APPLICATION
            // ==========================================

            'appium:bundleId': IOS_BUNDLE_ID,

            ...(IOS_APP_PATH
                ? { 'appium:app': IOS_APP_PATH }
                : {}),

            // ==========================================
            // SESSION MANAGEMENT
            // ==========================================

            'appium:noReset': false,

            'appium:forceAppLaunch': true,

            'appium:shouldTerminateApp': true,

            'appium:newCommandTimeout': 120,

            // ==========================================
            // XCUITEST / WEBDRIVERAGENT
            // ==========================================

            // Gunakan WDA yang sudah tersedia apabila
            // kompatibel dengan sesi Appium saat ini.
            'appium:useNewWDA': false,

            'appium:wdaLaunchTimeout': 120000,
            'appium:maxTypingFrequency': 30,

            'appium:wdaConnectionTimeout': 120000
        }
    ],

    // ==============================================
    // EXECUTION CONFIGURATION
    // ==============================================

    maxInstances: 1,

    logLevel: 'info',

    waitforTimeout: 10000,

    connectionRetryTimeout: 120000,

    connectionRetryCount: 3
};
