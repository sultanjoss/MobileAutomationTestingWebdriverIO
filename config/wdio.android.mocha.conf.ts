
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { MobileConfig } from './wdio.shared.conf';

import { config as deviceConfig } from './wdio.android.conf';
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
// 2. ANDROID TEST SPECIFICATIONS
// ======================================================

const androidSpecs = path.join(
    projectRoot,
    'src/android/tests/**/*.spec.ts'
);

// ======================================================
// 3. ANDROID + MOCHA CONFIGURATION
// ======================================================

export const config: MobileConfig = {

    // ==============================================
    // BASE ANDROID DEVICE CONFIGURATION
    // ==============================================

    ...deviceConfig,

    // ==============================================
    // MOCHA + REPORTPORTAL + GLOBAL EVIDENCE
    // ==============================================

    ...mochaConfig,

    // ==============================================
    // ANDROID DEVICE CAPABILITIES
    // ==============================================

    capabilities: deviceConfig.capabilities,

    // ==============================================
    // ANDROID TEST SPECIFICATIONS
    // ==============================================

    specs: [
        process.env.ANDROID_SPECS || androidSpecs
    ],

    // ==============================================
    // EXECUTION CONFIGURATION
    // ==============================================

    maxInstances: 1
};
