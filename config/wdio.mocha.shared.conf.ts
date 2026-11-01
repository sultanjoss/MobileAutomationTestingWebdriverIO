
import type { Options } from '@wdio/types';

import { browser } from '@wdio/globals';

import {
    Reporter,
    ReportPortalService
} from '@reportportal/agent-js-webdriverio';

import { rpConfig } from './reportportal.conf';

import {
    captureMochaEvidence
} from '../src/hooks/mocha-evidence.hooks';

import {
    recoverMochaApp
} from '../src/hooks/mocha-recovery.hooks';

import {
    globalEvidenceBeforeTest,
    globalEvidenceAfterCommand,
    globalEvidenceAfterTest
} from '../src/hooks/global-evidence.hooks';

// ======================================================
// 1. GLOBAL EXECUTION STATE
// ======================================================

// Digunakan untuk menentukan status akhir Device Farm.
let hasFailedTest = false;

// Aktif secara default.
// Set GLOBAL_EVIDENCE=false untuk menonaktifkan.
const globalEvidenceEnabled =
    process.env.GLOBAL_EVIDENCE !== 'false';

// ======================================================
// 2. WEBDRIVERIO MOCHA CONFIGURATION
// ======================================================

export const mochaConfig: Partial<Options.Testrunner> = {

    // ==================================================
    // PRIMARY TEST FRAMEWORK
    // ==================================================

    framework: 'mocha',

    // Test specification ditentukan per platform.
    // Android dan iOS tidak boleh tercampur.
    specs: [],

    // ==================================================
    // MOCHA OPTIONS
    // ==================================================

    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },

    // ==================================================
    // REPORTPORTAL REPORTER
    // ==================================================

    reporters: [
        'spec',

        [
            Reporter,
            rpConfig
        ] as unknown as NonNullable<
            Options.Testrunner['reporters']
        >[number]
    ],

    // ==================================================
    // REPORTPORTAL SERVICE
    // ==================================================

    services: [
        [
            ReportPortalService,
            rpConfig
        ] as unknown as NonNullable<
            Options.Testrunner['services']
        >[number]
    ],

    // ==================================================
    // EXECUTION CONFIGURATION
    // ==================================================

    maxInstances: 1,

    // ==================================================
    // BEFORE - INITIALIZE SESSION
    // ==================================================

    before: async () => {

        hasFailedTest = false;

        console.log(
            '[MOCHA] Session test status initialized'
        );

        console.log(
            '[GLOBAL EVIDENCE] ' +
            (
                globalEvidenceEnabled
                    ? 'ENABLED'
                    : 'DISABLED'
            )
        );
    },

    // ==================================================
    // BEFORE TEST
    // ==================================================
    // 1. Jalankan recovery jika [FreshStart].
    // 2. Inisialisasi folder evidence per test case.
    // ==================================================

    beforeTest: async (test) => {

        const testName =
            `${test.parent} ${test.title}`;

        console.log(
            `[MOCHA] Starting test: ${test.title}`
        );

        // ==============================================
        // AUTOMATIC APP RECOVERY
        // ==============================================

        if (testName.includes('[FreshStart]')) {

            console.log(
                `[MOCHA RECOVERY] START: ${test.title}`
            );

            await recoverMochaApp();

            console.log(
                `[MOCHA RECOVERY] COMPLETED`
            );
        }

        // ==============================================
        // GLOBAL EVIDENCE INITIALIZATION
        // ==============================================

        if (globalEvidenceEnabled) {

            await globalEvidenceBeforeTest(test);

            console.log(
                `[GLOBAL EVIDENCE] Recording: ${test.title}`
            );
        }
    },

    // ==================================================
    // AFTER COMMAND - GLOBAL SCREENSHOT
    // ==================================================
    // Screenshot otomatis setelah aksi terpilih:
    //
    // - click
    // - setValue
    // - addValue
    // - clearValue
    // - swipe
    // - dan aksi lain pada global evidence collector.
    //
    // Tidak perlu menambahkan screenshot di setiap TC.
    // ==================================================

    afterCommand: async (
        commandName,
        args,
        result,
        error
    ) => {

        if (!globalEvidenceEnabled) {
            return;
        }

        await globalEvidenceAfterCommand(
            commandName,
            args,
            result,
            error
        );
    },

    // ==================================================
    // AFTER TEST - FINAL EVIDENCE
    // ==================================================
    // 1. Tentukan PASS / FAILED.
    // 2. Ambil screenshot final.
    // 3. Simpan screenshot ke folder per TC.
    // 4. Kirim attachment ke ReportPortal.
    // 5. Jalankan screenshot hook lama.
    // ==================================================

    afterTest: async (test, context, result) => {

        const testName =
            `${test.parent}_${test.title}`;

        const passed = result.passed === true;

        const status = passed
            ? 'PASS'
            : 'FAILED';

        // ==============================================
        // TRACK DEVICE FARM STATUS
        // ==============================================

        if (!passed) {
            hasFailedTest = true;
        }

        console.log(
            `[MOCHA] Test: ${test.title}`
        );

        console.log(
            `[MOCHA] Status: ${status}`
        );

        // ==============================================
        // GLOBAL EVIDENCE
        // ==============================================

        if (globalEvidenceEnabled) {

            try {

                await globalEvidenceAfterTest(
                    test,
                    context,
                    result
                );

            } catch (error) {

                console.warn(
                    '[GLOBAL EVIDENCE] Finalization failed:',
                    error
                );
            }
        }

        // ==============================================
        // EXISTING MOCHA EVIDENCE
        // ==============================================
        // Dipertahankan supaya reporting yang sebelumnya
        // sudah berjalan tidak rusak.
        // ==============================================

        try {

            await captureMochaEvidence(
                testName,
                passed
            );

        } catch (error) {

            console.warn(
                '[MOCHA EVIDENCE] Screenshot failed:',
                error
            );
        }

        // ==============================================
        // LOG TEST FAILURE
        // ==============================================

        if (!passed && result.error) {

            console.error(
                `[MOCHA] Failure: ${result.error.message}`
            );
        }

        console.log(
            `[MOCHA] Finished: ${test.title}`
        );
    },

    // ==================================================
    // AFTER - DEVICE FARM SESSION STATUS
    // ==================================================

    after: async () => {

        const isDeviceFarm =
            process.env.DEVICE_FARM === 'true';

        if (!isDeviceFarm) {
            return;
        }

        const status = hasFailedTest
            ? 'failed'
            : 'passed';

        try {

            await browser.executeScript(
                'devicefarm: setSessionStatus',
                [{ status }]
            );

            console.log(
                `[DEVICE FARM] Session status: ${status.toUpperCase()}`
            );

        } catch (error) {

            console.warn(
                '[DEVICE FARM] Gagal mengirim status session:',
                error
            );
        }
    }
};
