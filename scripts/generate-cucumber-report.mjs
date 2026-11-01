
import fs from 'node:fs';
import path from 'node:path';
import { generate } from 'multiple-cucumber-html-reporter';

// ======================================================
// GENERAL CONFIGURATION
// ======================================================

const root = process.cwd();

const platform = (
    process.env.RP_PLATFORM || 'unknown'
).toLowerCase();

const reportSource = (
    process.env.REPORT_SOURCE || 'bdd'
).toLowerCase();

const launchId = process.env.RP_LAUNCH_ID;

const isConverted = reportSource === 'converted';

// ======================================================
// REPORT DIRECTORIES
// ======================================================

const reportDir = path.join(
    root,
    'reports',
    platform
);

let jsonDir;
let reportPath;

// ======================================================
// CONVERTED MOCHA REPORT
// ======================================================

if (isConverted) {
    if (!launchId) {
        throw new Error(
            'RP_LAUNCH_ID wajib diisi untuk converted report.'
        );
    }

    jsonDir = path.join(
        reportDir,
        'cucumber-json-converted',
        `launch-${launchId}`
    );

    reportPath = path.join(
        reportDir,
        'cucumber-html-converted',
        `launch-${launchId}`
    );
}

// ======================================================
// NATIVE CUCUMBER BDD REPORT
// ======================================================

else {
    jsonDir = path.join(
        reportDir,
        'cucumber-json'
    );

    reportPath = path.join(
        reportDir,
        'cucumber-html'
    );
}

// ======================================================
// VALIDATE JSON DIRECTORY
// ======================================================

if (!fs.existsSync(jsonDir)) {
    throw new Error(
        `Folder Cucumber JSON tidak ditemukan: ${jsonDir}`
    );
}

const jsonFiles = fs.readdirSync(jsonDir)
    .filter(file => file.endsWith('.json'));

if (jsonFiles.length === 0) {
    throw new Error(
        `Tidak ada file Cucumber JSON di: ${jsonDir}`
    );
}

// ======================================================
// VALIDATE JSON CONTENT
// ======================================================

let totalScenarios = 0;

for (const file of jsonFiles) {
    const filePath = path.join(jsonDir, file);

    const content = JSON.parse(
        fs.readFileSync(filePath, 'utf8')
    );

    if (!Array.isArray(content)) {
        throw new Error(
            `Format Cucumber JSON tidak valid: ${file}`
        );
    }

    totalScenarios += content.reduce(
        (total, feature) =>
            total + (feature.elements?.length || 0),
        0
    );
}

if (totalScenarios === 0) {
    throw new Error(
        'Cucumber JSON tidak memiliki scenario.'
    );
}

// ======================================================
// GENERATE CUCUMBER HTML REPORT
// ======================================================

console.log('\n[REPORT] Starting HTML generation...');
console.log(`[PLATFORM] ${platform}`);
console.log(`[SOURCE] ${reportSource}`);
console.log(`[SCENARIOS] ${totalScenarios}`);
console.log(`[JSON DIRECTORY] ${jsonDir}`);

generate({
    jsonDir,
    reportPath,

    pageTitle: isConverted
        ? `Converted Mocha Report - ${platform}`
        : `Mobile Automation - ${platform}`,

    reportName: isConverted
        ? `Mocha to Cucumber Report - ${platform}`
        : `Cucumber Report - ${platform}`,

    displayDuration: true,
    displayReportTime: true,
    failedSummaryReport: true,

    metadata: {
        Platform: platform,
        Framework: isConverted
            ? 'Appium + WebdriverIO + Mocha'
            : 'Appium + WebdriverIO + Cucumber',
        Source: isConverted
            ? 'ReportPortal - Converted'
            : 'Cucumber BDD'
    },

    customData: {
        title: 'Execution Information',
        data: [
            {
                label: 'Report Type',
                value: isConverted
                    ? 'Converted from Mocha'
                    : 'Native Cucumber BDD'
            },
            {
                label: 'Platform',
                value: platform
            },
            {
                label: 'Launch ID',
                value: isConverted
                    ? launchId
                    : 'N/A'
            },
            {
                label: 'BDD Steps',
                value: isConverted
                    ? 'Synthetic execution summaries'
                    : 'Native Given/When/Then'
            }
        ]
    }
});

// ======================================================
// FINAL SUMMARY
// ======================================================

console.log('========== HTML REPORT ==========');
console.log(`[PLATFORM] ${platform}`);
console.log(`[SOURCE] ${reportSource}`);
console.log(`[SCENARIOS] ${totalScenarios}`);
console.log(`[HTML] ${reportPath}`);
console.log('[REPORT] Completed');
console.log('=================================');
