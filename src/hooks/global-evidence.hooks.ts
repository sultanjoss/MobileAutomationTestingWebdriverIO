
import fs from 'node:fs';
import path from 'node:path';

import { browser } from '@wdio/globals';

import {
    ReportingApi
} from '@reportportal/agent-js-webdriverio';

// ======================================================
// 1. GLOBAL CONFIGURATION
// ======================================================

const PLATFORM = (
    process.env.RP_PLATFORM || 'android'
).toLowerCase();

const RUN_ID =
    process.env.EVIDENCE_RUN_ID ||
    new Date().toISOString().replace(/[:.]/g, '-');

const EVIDENCE_ROOT = path.resolve(
    process.cwd(),
    'reports',
    PLATFORM,
    'mocha',
    'evidence',
    `run-${RUN_ID}`
);

const ENABLED =
    process.env.GLOBAL_EVIDENCE !== 'false';

const MAX_SCREENSHOTS = Math.max(
    1,
    Number(process.env.EVIDENCE_MAX_SCREENSHOTS || 100)
);

// ======================================================
// 2. ACTION COMMAND FILTER
// ======================================================

const ACTION_COMMANDS = new Set([
    'click',
    'setValue',
    'addValue',
    'clearValue',
    'doubleClick',
    'touchAction',
    'swipe',
    'dragAndDrop',
    'selectByVisibleText',
    'selectByIndex',
    'selectByAttribute'
]);

// ======================================================
// 3. TYPES
// ======================================================

type EvidenceStatus =
    | 'PASS'
    | 'FAILED'
    | 'SKIPPED';

type StepStatus =
    | 'passed'
    | 'failed';

type EvidenceStep = {
    sequence: number;
    name: string;
    command: string;
    status: StepStatus;
    screenshot: string | null;
    timestamp: string;
    error?: string;
};

type EvidenceTest = {
    testCaseId: string;
    testName: string;
    suiteName: string;
    directory: string;
    startedAt: string;
    steps: EvidenceStep[];
};

// Menggunakan tipe attachment langsung dari
// ReportingApi.log() agar kompatibel dengan
// deklarasi TypeScript agent yang terpasang.

type RPAttachment = NonNullable<
    Parameters<typeof ReportingApi.log>[2]
>;

// ======================================================
// 4. GLOBAL STATE
// ======================================================

let currentTest: EvidenceTest | null = null;

let isCapturing = false;

// ======================================================
// 5. FILE NAME UTILITIES
// ======================================================

function safeName(value: string): string {

    return value
        .replace(/[^a-zA-Z0-9_-]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 100) || 'UNKNOWN_TC';
}

function getTestCaseId(testName: string): string {

    const match = testName.match(
        /\bTC-[A-Za-z0-9-]+\b/i
    );

    return match
        ? safeName(match[0])
        : safeName(testName);
}

// ======================================================
// 6. SAVE EVIDENCE MANIFEST
// ======================================================

function writeManifest(
    test: EvidenceTest,
    finalStatus?: EvidenceStatus
): void {

    const manifest = {
        testCaseId: test.testCaseId,
        testName: test.testName,
        suiteName: test.suiteName,

        runId: RUN_ID,
        platform: PLATFORM,

        startedAt: test.startedAt,
        updatedAt: new Date().toISOString(),

        ...(finalStatus
            ? { status: finalStatus }
            : {}),

        steps: test.steps
    };

    fs.writeFileSync(
        path.join(test.directory, 'steps.json'),
        JSON.stringify(manifest, null, 2),
        'utf8'
    );
}

// ======================================================
// 7. REPORTPORTAL ATTACHMENT
// ======================================================

function sendToReportPortal(
    filename: string,
    base64: string,
    message: string,
    isFailed: boolean
): void {

    try {

        const attachment: RPAttachment = {
            name: filename,

            // MIME type valid untuk PNG.
            // Assertion terbatas karena agent
            // menggunakan enum pada TypeScript.
            type: 'image/png' as RPAttachment['type'],

            content: base64
        };

        ReportingApi.log(
            isFailed ? 'ERROR' : 'INFO',
            message,
            attachment
        );

        console.log(
            `[RP EVIDENCE] Submitted: ${filename}`
        );

    } catch (error) {

        console.warn(
            '[RP EVIDENCE] Attachment submission failed:',
            error instanceof Error
                ? error.message
                : String(error)
        );
    }
}

// ======================================================
// 8. SCREENSHOT CAPTURE
// ======================================================

async function captureEvidence(
    command: string,
    status: StepStatus,
    error?: string,
    isFinal = false
): Promise<void> {

    if (
        !ENABLED ||
        !currentTest ||
        isCapturing
    ) {
        return;
    }

    // Batasi screenshot aksi biasa.
    // Screenshot final selalu tetap dicoba.

    if (
        !isFinal &&
        currentTest.steps.length >= MAX_SCREENSHOTS
    ) {
        return;
    }

    isCapturing = true;

    try {

        const test = currentTest;

        const sequence =
            test.steps.length + 1;

        const filename =
            `step_${String(sequence).padStart(3, '0')}_` +
            `${safeName(command)}.png`;

        const screenshotPath = path.join(
            test.directory,
            filename
        );

        let screenshot: string | null = null;

        // ==============================================
        // CAPTURE SCREENSHOT
        // ==============================================

        try {

            const base64 =
                await browser.takeScreenshot();

            fs.writeFileSync(
                screenshotPath,
                Buffer.from(base64, 'base64')
            );

            screenshot = filename;

            // ==========================================
            // SEND TO REPORTPORTAL
            // ==========================================

            sendToReportPortal(
                filename,
                base64,
                `[GLOBAL EVIDENCE] ` +
                `${test.testCaseId} | ` +
                `Step ${sequence} | ` +
                `${command} | ${status.toUpperCase()}`,
                status === 'failed'
            );

        } catch (captureError) {

            console.warn(
                `[EVIDENCE] Screenshot failed: ${command}`,
                captureError instanceof Error
                    ? captureError.message
                    : String(captureError)
            );
        }

        // ==============================================
        // SAVE STEP METADATA
        // ==============================================

        test.steps.push({
            sequence,
            name: `Step ${sequence} - ${command}`,
            command,
            status,
            screenshot,
            timestamp: new Date().toISOString(),

            ...(error
                ? { error }
                : {})
        });

        writeManifest(test);

        console.log(
            `[EVIDENCE] ${test.testCaseId} | ` +
            `${command} | ${status.toUpperCase()}`
        );

    } finally {

        isCapturing = false;
    }
}

// ======================================================
// 9. BEFORE TEST
// ======================================================

export async function globalEvidenceBeforeTest(
    test: {
        title?: string;
        fullTitle?: string;
        parent?: string;
    }
): Promise<void> {

    if (!ENABLED) {
        return;
    }

    const testName = String(
        test.title ||
        test.fullTitle ||
        'UNKNOWN_TC'
    );

    const testCaseId =
        getTestCaseId(testName);

    const suiteName = String(
        test.parent || 'Mocha'
    );

    // ==============================================
    // CREATE TEMPORARY TEST DIRECTORY
    // ==============================================

    const workDirectory = path.join(
        EVIDENCE_ROOT,
        'RUNNING',
        safeName(suiteName),
        testCaseId
    );

    fs.mkdirSync(workDirectory, {
        recursive: true
    });

    currentTest = {
        testCaseId,
        testName,
        suiteName,
        directory: workDirectory,
        startedAt: new Date().toISOString(),
        steps: []
    };

    writeManifest(currentTest);

    console.log(
        `[EVIDENCE START] ${testCaseId}`
    );
}

// ======================================================
// 10. AFTER COMMAND
// ======================================================

export async function globalEvidenceAfterCommand(
    commandName: string,
    _args: unknown[],
    _result: unknown,
    error?: Error
): Promise<void> {

    if (
        !ENABLED ||
        !currentTest ||
        isCapturing
    ) {
        return;
    }

    // Screenshot hanya setelah aksi terpilih.
    // Command teknis seperti findElement,
    // getText, dan takeScreenshot diabaikan.

    if (!ACTION_COMMANDS.has(commandName)) {
        return;
    }

    await captureEvidence(
        commandName,
        error ? 'failed' : 'passed',
        error?.message
    );
}

// ======================================================
// 11. AFTER TEST
// ======================================================

export async function globalEvidenceAfterTest(
    _test: unknown,
    _context: unknown,
    result: {
        passed?: boolean;
        error?: Error;
    }
): Promise<void> {

    if (!ENABLED || !currentTest) {
        return;
    }

    const test = currentTest;

    // ==============================================
    // DETERMINE FINAL STATUS
    // ==============================================

    const finalStatus: EvidenceStatus =
        result.passed === true
            ? 'PASS'
            : 'FAILED';

    // ==============================================
    // CAPTURE FINAL SCREENSHOT
    // ==============================================

    await captureEvidence(
        finalStatus === 'PASS'
            ? 'FINAL_PASS'
            : 'FINAL_FAILED',

        finalStatus === 'PASS'
            ? 'passed'
            : 'failed',

        result.error?.message,

        true
    );

    // ==============================================
    // DESTINATION DIRECTORY
    // ==============================================

    const destination = path.join(
        EVIDENCE_ROOT,
        finalStatus,
        safeName(test.suiteName),
        test.testCaseId
    );

    fs.mkdirSync(
        path.dirname(destination),
        { recursive: true }
    );

    // ==============================================
    // PREVENT DIRECTORY OVERWRITE
    // ==============================================

    let finalDirectory = destination;
    let attempt = 2;

    while (fs.existsSync(finalDirectory)) {

        finalDirectory =
            `${destination}_attempt_${attempt}`;

        attempt++;
    }

    // ==============================================
    // SAVE FINAL STATUS
    // ==============================================

    writeManifest(
        test,
        finalStatus
    );

    // ==============================================
    // MOVE RUNNING → PASS / FAILED
    // ==============================================

    fs.renameSync(
        test.directory,
        finalDirectory
    );

    currentTest = null;

    console.log(
        `[EVIDENCE FINISH] ` +
        `${test.testCaseId} | ${finalStatus}`
    );

    console.log(
        `[EVIDENCE FOLDER] ${finalDirectory}`
    );
}
