
import fs from 'node:fs';
import path from 'node:path';

// ======================================================
// 1. REPORTPORTAL CONFIGURATION
// ======================================================

const platform = (
    process.env.RP_PLATFORM || 'android'
).toLowerCase();

const rpUrl = (
    process.env.RP_URL || 'http://localhost:8080'
).replace(/\/+$/, '');

const rpProject =
    process.env.RP_PROJECT || 'mobile_automation_testing';

const apiKey = process.env.RP_API_KEY;
const launchInput = process.argv[2];
const projectRoot = process.cwd();

if (!['android', 'ios'].includes(platform)) {
    throw new Error(`RP_PLATFORM tidak valid: ${platform}`);
}

if (!apiKey) {
    throw new Error('RP_API_KEY belum tersedia di environment.');
}

if (!launchInput) {
    throw new Error(
        'Usage: node scripts/reportportal-to-cucumber.mjs <launch-id>'
    );
}

// ======================================================
// 2. OUTPUT AND GLOBAL EVIDENCE CONFIGURATION
// ======================================================

const outputDir = path.resolve(
    projectRoot,
    'reports',
    platform,
    'cucumber-json-converted',
    `launch-${launchInput}`
);

const evidenceRoot = path.resolve(
    projectRoot,
    'reports',
    platform,
    'mocha',
    'evidence'
);

const EXECUTION_TOLERANCE_MS = 2 * 60 * 1000;

// ======================================================
// 3. REPORTPORTAL API
// ======================================================

async function apiGet(endpoint) {

    const url = `${rpUrl}/api/v1/${rpProject}${endpoint}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json'
        }
    });

    if (!response.ok) {

        const responseBody = await response.text();

        throw new Error(
            `ReportPortal API HTTP ${response.status}\n` +
            `Endpoint: ${endpoint}\n` +
            `Response: ${responseBody.slice(0, 500)}`
        );
    }

    return response.json();
}

// ======================================================
// 4. GET REPORTPORTAL LAUNCH
// ======================================================

async function getLaunch() {

    const endpoint = /^\d+$/.test(launchInput)
        ? `/launch/${launchInput}`
        : `/launch/uuid/${encodeURIComponent(launchInput)}`;

    const launch = await apiGet(endpoint);

    if (launch.id == null) {
        throw new Error('Launch ID tidak ditemukan.');
    }

    return launch;
}

// ======================================================
// 5. GET REPORTPORTAL TEST ITEMS
// ======================================================

async function getLaunchItems(launchId) {

    const items = [];
    let page = 0;

    while (true) {

        const params = new URLSearchParams({
            'filter.eq.launchId': String(launchId),
            'page.page': String(page),
            'page.size': '100'
        });

        const response = await apiGet(
            `/item?${params.toString()}`
        );

        const content = response.content || [];

        items.push(...content);

        const totalPages = response.page?.totalPages;

        if (
            content.length === 0 ||
            (
                totalPages !== undefined &&
                page + 1 >= totalPages
            ) ||
            (
                totalPages === undefined &&
                content.length < 100
            )
        ) {
            break;
        }

        page++;
    }

    return items;
}

// ======================================================
// 6. STATUS AND TIME HELPERS
// ======================================================

function mapStatus(status) {

    switch (String(status || '').toUpperCase()) {

        case 'PASSED':
        case 'PASS':
            return 'passed';

        case 'FAILED':
        case 'FAIL':
        case 'INTERRUPTED':
            return 'failed';

        case 'SKIPPED':
        case 'PENDING':
            return 'skipped';

        default:
            return 'skipped';
    }
}

function extractScenarioId(testName) {

    const match = String(testName || '')
        .match(/\bTC-[A-Za-z0-9-]+\b/i);

    return match ? match[0].toUpperCase() : null;
}

function parseTimestamp(value) {

    if (value == null || value === '') {
        return NaN;
    }

    const timestamp = Date.parse(String(value));

    return Number.isFinite(timestamp)
        ? timestamp
        : NaN;
}

function parseRunFolderTimestamp(folderName) {

    // Example:
    // run-2026-11-01T10-59-29-420Z

    const match = String(folderName).match(
        /^run-(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/
    );

    if (!match) {
        return NaN;
    }

    return parseTimestamp(
        `${match[1]}T${match[2]}:${match[3]}:${match[4]}.${match[5]}Z`
    );
}

function itemDurationNs(item) {

    const startedAt = parseTimestamp(item.startTime);
    const endedAt = parseTimestamp(item.endTime);

    if (
        !Number.isFinite(startedAt) ||
        !Number.isFinite(endedAt)
    ) {
        return 0;
    }

    return Math.max(
        0,
        endedAt - startedAt
    ) * 1_000_000;
}

// ======================================================
// 7. FILE SYSTEM HELPERS
// ======================================================

function listDirectories(directory) {

    if (!fs.existsSync(directory)) {
        return [];
    }

    return fs.readdirSync(
        directory,
        { withFileTypes: true }
    )
        .filter(entry =>
            entry.isDirectory() &&
            !entry.isSymbolicLink()
        )
        .map(entry => entry.name);
}

function safeScreenshotPath(scenarioDir, fileName) {

    if (
        typeof fileName !== 'string' ||
        !fileName.trim()
    ) {
        return null;
    }

    const baseDir = fs.realpathSync(scenarioDir);

    const screenshotPath = path.resolve(
        baseDir,
        fileName
    );

    const relativePath = path.relative(
        baseDir,
        screenshotPath
    );

    if (
        !relativePath ||
        relativePath === '..' ||
        relativePath.startsWith(`..${path.sep}`) ||
        path.isAbsolute(relativePath) ||
        !fs.existsSync(screenshotPath)
    ) {
        return null;
    }

    const realPath = fs.realpathSync(screenshotPath);

    const realRelativePath = path.relative(
        baseDir,
        realPath
    );

    if (
        realRelativePath === '..' ||
        realRelativePath.startsWith(`..${path.sep}`) ||
        path.isAbsolute(realRelativePath)
    ) {
        return null;
    }

    if (!fs.statSync(realPath).isFile()) {
        return null;
    }

    return realPath;
}

// ======================================================
// 8. FIND GLOBAL EVIDENCE
// ======================================================

function findGlobalEvidence(item, scenarioId) {

    if (!fs.existsSync(evidenceRoot)) {

        console.warn(
            `[EVIDENCE] Folder tidak ditemukan: ${evidenceRoot}`
        );

        return null;
    }

    const startedAt = parseTimestamp(item.startTime);
    const endedAt = parseTimestamp(item.endTime);

    if (
        !Number.isFinite(startedAt) ||
        !Number.isFinite(endedAt)
    ) {

        console.warn(
            `[EVIDENCE] Timestamp tidak lengkap: ${scenarioId}`
        );

        return null;
    }

    const reportPortalStatus = mapStatus(item.status);

    const expectedStatus =
        reportPortalStatus === 'passed'
            ? 'PASS'
            : reportPortalStatus === 'failed'
                ? 'FAILED'
                : 'SKIPPED';

    const runDirectories = listDirectories(evidenceRoot)
        .filter(name => name.startsWith('run-'));

    const candidates = [];

    for (const runName of runDirectories) {

        const runDir = path.join(
            evidenceRoot,
            runName
        );

        const runStartedAt =
            parseRunFolderTimestamp(runName);

        // ==========================================
        // VALIDATE RUN EXECUTION WINDOW
        // ==========================================

        if (
            Number.isFinite(runStartedAt) &&
            (
                runStartedAt >
                    endedAt + EXECUTION_TOLERANCE_MS ||
                runStartedAt <
                    startedAt - 30 * 60 * 1000
            )
        ) {
            continue;
        }

        for (const statusFolder of [
            'PASS',
            'FAILED',
            'SKIPPED'
        ]) {

            if (statusFolder !== expectedStatus) {
                continue;
            }

            const statusDir = path.join(
                runDir,
                statusFolder
            );

            for (const suiteName of listDirectories(statusDir)) {

                const scenarioDir = path.join(
                    statusDir,
                    suiteName,
                    scenarioId
                );

                const manifestPath = path.join(
                    scenarioDir,
                    'steps.json'
                );

                if (!fs.existsSync(manifestPath)) {
                    continue;
                }

                let manifest;

                // ======================================
                // READ MANIFEST
                // ======================================

                try {

                    manifest = JSON.parse(
                        fs.readFileSync(
                            manifestPath,
                            'utf8'
                        )
                    );

                } catch (error) {

                    console.warn(
                        `[EVIDENCE] Manifest tidak valid: ${manifestPath}`,
                        error.message
                    );

                    continue;
                }

                // ======================================
                // VALIDATE SCENARIO
                // ======================================

                if (
                    String(
                        manifest.scenarioId || ''
                    ).toUpperCase() !== scenarioId ||
                    String(
                        manifest.scenarioName || ''
                    ) !== String(item.name)
                ) {
                    continue;
                }

                if (
                    !Array.isArray(manifest.steps) ||
                    manifest.steps.length === 0
                ) {
                    continue;
                }

                // ======================================
                // VALIDATE EXECUTION TIME
                // ======================================

                const firstStepTime = manifest.steps
                    .map(step =>
                        parseTimestamp(
                            step.capturedAt ||
                            step.timestamp ||
                            step.time
                        )
                    )
                    .find(Number.isFinite);

                const capturedAt = [
                    parseTimestamp(manifest.capturedAt),
                    firstStepTime,
                    runStartedAt
                ].find(Number.isFinite);

                if (!Number.isFinite(capturedAt)) {
                    continue;
                }

                if (
                    capturedAt <
                        startedAt - EXECUTION_TOLERANCE_MS ||
                    capturedAt >
                        endedAt + EXECUTION_TOLERANCE_MS
                ) {
                    continue;
                }

                const distance =
                    capturedAt < startedAt
                        ? startedAt - capturedAt
                        : capturedAt > endedAt
                            ? capturedAt - endedAt
                            : 0;

                candidates.push({
                    scenarioDir,
                    manifest,
                    capturedAt,
                    distance
                });
            }
        }
    }

    // ==============================================
    // SELECT MATCHING EXECUTION
    // ==============================================

    candidates.sort((a, b) =>
        a.distance - b.distance ||
        Math.abs(a.capturedAt - startedAt) -
        Math.abs(b.capturedAt - startedAt)
    );

    if (candidates.length === 0) {

        console.warn(
            `[EVIDENCE] Tidak ditemukan untuk ${scenarioId}`
        );

        return null;
    }

    // Jangan menggunakan evidence jika dua run
    // memiliki tingkat kecocokan yang sama.

    if (candidates.length > 1) {

        const first = candidates[0];
        const second = candidates[1];

        const sameRank =
            first.distance === second.distance &&
            Math.abs(first.capturedAt - startedAt) ===
            Math.abs(second.capturedAt - startedAt);

        if (sameRank) {

            console.warn(
                `[EVIDENCE] Run ambigu: ${scenarioId}`
            );

            return null;
        }
    }

    const selected = candidates[0];

    console.log(
        `[EVIDENCE MATCHED] ${scenarioId} | ` +
        path.relative(
            projectRoot,
            selected.scenarioDir
        )
    );

    return selected;
}

// ======================================================
// 9. DEFAULT MOCHA STEP
// ======================================================

function createFallbackSteps(item, status, duration) {

    return [
        {
            keyword: 'When ',

            name: 'the recorded Mocha test is executed',

            line: 1,

            result: {
                status,
                duration,

                ...(status === 'failed'
                    ? {
                        error_message:
                            'Test failed in ReportPortal. ' +
                            `Test Item ID: ${item.id}`
                    }
                    : {})
            }
        }
    ];
}

// ======================================================
// 10. CREATE SCREENSHOT EMBEDDING
// ======================================================

function createScreenshotEmbedding(step, scenarioDir) {

    const screenshotName =
        step.screenshot ||
        step.screenshotFile ||
        step.file;

    if (!screenshotName) {
        return [];
    }

    let screenshotPath;

    try {

        screenshotPath = safeScreenshotPath(
            scenarioDir,
            screenshotName
        );

    } catch (error) {

        console.warn(
            `[SCREENSHOT] Gagal membaca path: ${error.message}`
        );

        return [];
    }

    if (!screenshotPath) {

        console.warn(
            `[SCREENSHOT MISSING] ${screenshotName}`
        );

        return [];
    }

    const imageBuffer = fs.readFileSync(
        screenshotPath
    );

    // ==============================================
    // VALIDATE PNG
    // ==============================================

    const pngSignature = Buffer.from(
        '89504e470d0a1a0a',
        'hex'
    );

    if (
        imageBuffer.length < pngSignature.length ||
        !imageBuffer.subarray(0, 8).equals(pngSignature)
    ) {

        console.warn(
            `[SCREENSHOT] File bukan PNG valid: ${screenshotName}`
        );

        return [];
    }

    console.log(
        `[SCREENSHOT ATTACHED] ${path.basename(screenshotPath)}`
    );

    return [
        {
            mime_type: 'image/png',
            data: imageBuffer.toString('base64')
        }
    ];
}

// ======================================================
// 11. BUILD CUCUMBER STEPS
// ======================================================

function buildScenarioSteps(item, status, duration) {

    const fallbackSteps = createFallbackSteps(
        item,
        status,
        duration
    );

    const scenarioId = extractScenarioId(
        item.name
    );

    if (
        !scenarioId ||
        status === 'skipped'
    ) {
        return fallbackSteps;
    }

    // ==============================================
    // FIND MATCHING EVIDENCE
    // ==============================================

    const matchedEvidence = findGlobalEvidence(
        item,
        scenarioId
    );

    if (!matchedEvidence) {
        return fallbackSteps;
    }

    const {
        scenarioDir,
        manifest
    } = matchedEvidence;

    console.log(
        `[EVIDENCE] ${scenarioId}: ${manifest.steps.length} steps ditemukan`
    );

    // ==============================================
    // CONVERT RECORDED STEPS
    // ==============================================

    const convertedSteps = manifest.steps.map(
        (step, index) => {

            const rawStatus = String(
                step.status || ''
            ).toUpperCase();

            const stepStatus =
                rawStatus === 'FAILED' ||
                rawStatus === 'FAIL'
                    ? 'failed'
                    : rawStatus === 'SKIPPED'
                        ? 'skipped'
                        : 'passed';

            const embeddings = createScreenshotEmbedding(
                step,
                scenarioDir
            );

            return {
                keyword: index === 0
                    ? 'When '
                    : 'And ',

                name: String(
                    step.name ||
                    step.action ||
                    step.command ||
                    `Step ${index + 1}`
                ),

                line: index + 1,

                result: {
                    status: stepStatus,

                    duration: index === 0
                        ? duration
                        : 0,

                    ...(step.error
                        ? {
                            error_message:
                                String(step.error)
                        }
                        : {})
                },

                ...(embeddings.length > 0
                    ? { embeddings }
                    : {})
            };
        }
    );

    // ==============================================
    // REPORTPORTAL STATUS = SOURCE OF TRUTH
    // ==============================================

    const hasFailedStep = convertedSteps.some(
        step => step.result.status === 'failed'
    );

    if (
        status === 'failed' &&
        !hasFailedStep
    ) {

        convertedSteps.push({
            keyword: 'And ',

            name: 'ReportPortal execution validation',

            line: convertedSteps.length + 1,

            result: {
                status: 'failed',
                duration: 0,

                error_message:
                    'Test failed in ReportPortal. ' +
                    `Test Item ID: ${item.id}`
            }
        });
    }

    if (
        status === 'passed' &&
        hasFailedStep
    ) {

        console.warn(
            `[EVIDENCE] Status bertentangan dengan ReportPortal: ${scenarioId}`
        );

        return fallbackSteps;
    }

    return convertedSteps;
}

// ======================================================
// 12. CONVERT REPORTPORTAL ITEMS TO CUCUMBER JSON
// ======================================================

function convertItems(items, launch) {

    const itemMap = new Map(
        items.map(item => [
            String(item.id),
            item
        ])
    );

    const parentIds = new Set(
        items
            .map(item =>
                item.parent ?? item.parentId
            )
            .filter(id => id != null)
            .map(String)
    );

    const groups = new Map();

    for (const item of items) {

        const type = String(
            item.type || ''
        ).toUpperCase();

        if (
            !['STEP', 'TEST', 'SCENARIO'].includes(type)
        ) {
            continue;
        }

        // ==========================================
        // ONLY LEAF TEST ITEMS
        // ==========================================

        if (
            parentIds.has(String(item.id)) ||
            item.hasChildren === true
        ) {
            continue;
        }

        const parentId =
            item.parent ?? item.parentId;

        const parent = itemMap.get(
            String(parentId)
        );

        if (type === 'STEP') {

            const parentType = String(
                parent?.type || ''
            ).toUpperCase();

            if (
                ![
                    'SUITE',
                    'TEST',
                    'SCENARIO'
                ].includes(parentType)
            ) {
                continue;
            }
        }

        // ==========================================
        // FEATURE MAPPING
        // ==========================================

        const featureName =
            parent?.name ||
            launch.name ||
            'Mocha Test Results';

        if (!groups.has(featureName)) {
            groups.set(featureName, []);
        }

        // ==========================================
        // SCENARIO STATUS & DURATION
        // ==========================================

        const status = mapStatus(
            item.status
        );

        const duration = itemDurationNs(
            item
        );

        // ==========================================
        // BUILD SCENARIO
        // ==========================================

        const scenario = {
            id: String(
                item.uuid || item.id
            ),

            keyword: 'Scenario',

            name: String(
                item.name || 'Unnamed Test'
            ),

            type: 'scenario',

            line: 1,

            steps: buildScenarioSteps(
                item,
                status,
                duration
            )
        };

        groups.get(featureName).push(
            scenario
        );
    }

    // ==============================================
    // BUILD FEATURES
    // ==============================================

    return [...groups.entries()].map(
        ([name, elements], index) => ({
            uri: `converted-${index + 1}.feature`,

            id: `converted-${index + 1}`,

            keyword: 'Feature',

            name,

            description:
                'Converted from ReportPortal Mocha results. ' +
                'Steps are generated from recorded automation evidence.',

            line: 1,

            elements
        })
    );
}

// ======================================================
// 13. SCENARIO RESULT SUMMARY
// ======================================================

function getScenarioStatus(scenario) {

    const statuses = scenario.steps.map(
        step => step.result.status
    );

    if (statuses.includes('failed')) {
        return 'failed';
    }

    if (statuses.includes('skipped')) {
        return 'skipped';
    }

    return 'passed';
}

// ======================================================
// 14. REPORTPORTAL DIAGNOSTIC
// ======================================================

function logItemDiagnostics(items, launch) {

    const typeSummary = {};

    for (const item of items) {

        const type = String(
            item.type || 'UNKNOWN'
        );

        typeSummary[type] =
            (typeSummary[type] || 0) + 1;
    }

    console.log(
        '\n========== REPORTPORTAL DIAGNOSTIC =========='
    );

    console.log('[LAUNCH ID]', launch.id);
    console.log('[LAUNCH NAME]', launch.name);
    console.log('[LAUNCH STATUS]', launch.status);
    console.log('[TOTAL ITEMS]', items.length);
    console.log('[ITEM TYPES]', typeSummary);

    console.log(
        '=============================================\n'
    );
}

// ======================================================
// 15. MAIN EXECUTION
// ======================================================

async function main() {

    console.log(
        '\n[CONVERTER] Starting...'
    );

    console.log(
        `[PLATFORM] ${platform}`
    );

    console.log(
        `[EVIDENCE ROOT] ${evidenceRoot}`
    );

    // ==============================================
    // GET REPORTPORTAL LAUNCH
    // ==============================================

    const launch = await getLaunch();

    // ==============================================
    // GET TEST ITEMS
    // ==============================================

    const items = await getLaunchItems(
        launch.id
    );

    logItemDiagnostics(
        items,
        launch
    );

    // ==============================================
    // CONVERT TO CUCUMBER
    // ==============================================

    const features = convertItems(
        items,
        launch
    );

    const scenarios = features.flatMap(
        feature => feature.elements
    );

    if (scenarios.length === 0) {

        throw new Error(
            'Tidak ada scenario yang ditemukan. ' +
            'Periksa struktur test item ReportPortal.'
        );
    }

    // ==============================================
    // CALCULATE SUMMARY
    // ==============================================

    const summary = {
        passed: 0,
        failed: 0,
        skipped: 0
    };

    for (const scenario of scenarios) {

        const status = getScenarioStatus(
            scenario
        );

        if (status in summary) {
            summary[status]++;
        }
    }

    // ==============================================
    // SAVE CUCUMBER JSON
    // ==============================================

    fs.mkdirSync(outputDir, {
        recursive: true
    });

    const outputFile = path.join(
        outputDir,
        'cucumber-report.json'
    );

    fs.writeFileSync(
        outputFile,
        JSON.stringify(
            features,
            null,
            2
        ),
        'utf8'
    );

    // ==============================================
    // FINAL SUMMARY
    // ==============================================

    console.log(
        '\n========== CONVERSION RESULT =========='
    );

    console.log(
        `[FEATURES] ${features.length}`
    );

    console.log(
        `[SCENARIOS] ${scenarios.length}`
    );

    console.log(
        `[PASSED] ${summary.passed}`
    );

    console.log(
        `[FAILED] ${summary.failed}`
    );

    console.log(
        `[SKIPPED] ${summary.skipped}`
    );

    console.log(
        `[OUTPUT] ${outputFile}`
    );

    console.log(
        '======================================='
    );

    console.log(
        '[CONVERTER] Completed'
    );
}

// ======================================================
// 16. ERROR HANDLING
// ======================================================

main().catch(error => {

    console.error(
        '[CONVERTER ERROR]',
        error.message
    );

    process.exitCode = 1;
});
