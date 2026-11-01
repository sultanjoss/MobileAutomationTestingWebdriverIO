
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { MobileConfig } from './wdio.shared.conf';

import { config as deviceConfig } from './wdio.ios.conf';
import { mochaConfig } from './wdio.mocha.shared.conf';

// ======================================================
// 1. PROJECT DIRECTORY
// ======================================================

const configDir = path.dirname(
    fileURLToPath(import.meta.url)
);

const projectRoot = path.resolve(
    configDir,
    '..'
);

// ======================================================
// 2. IOS TEST SPECIFICATIONS
// ======================================================

const iosSpecs = path.join(
    projectRoot,
    'src/ios/tests/**/*.spec.ts'
);

// ======================================================
// 3. IOS + MOCHA CONFIGURATION
// ======================================================

export const config: MobileConfig = {

    // ==============================================
    // BASE IOS DEVICE CONFIGURATION
    // ==============================================

    ...deviceConfig,

    // ==============================================
    // MOCHA + REPORTPORTAL + GLOBAL EVIDENCE
    // ==============================================

    ...mochaConfig,

    // ==============================================
    // IOS DEVICE CAPABILITIES
    // ==============================================

    capabilities: deviceConfig.capabilities,

    // ==============================================
    // IOS TEST SPECIFICATIONS
    // ==============================================

    specs: [
        process.env.IOS_SPECS || iosSpecs
    ],

    // ==============================================
    // EXECUTION CONFIGURATION
    // ==============================================

    maxInstances: 1
};
