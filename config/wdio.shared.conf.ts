import type { Options } from '@wdio/types';

// @wdio/types v10 memisahkan properti capability dari Options.Testrunner
// sehingga kita menambahkan typing capability secara eksplisit.
export type MobileConfig = Options.Testrunner & {
    capabilities: Array<Record<string, unknown>>;
};

export const sharedConfig: Options.Testrunner = {
    runner: 'local',
    tsConfigPath: './tsconfig.json',
    hostname: process.env.APPIUM_HOST || '127.0.0.1',
    port: Number(process.env.APPIUM_PORT || 4725),
    path: '/',
    maxInstances: 1,
    logLevel: 'info',
    bail: 0,
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    // Appium server sudah aktif secara terpisah; jangan hidupkan appium service kedua.
    services: [],
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: { ui: 'bdd', timeout: 60000 },
};
