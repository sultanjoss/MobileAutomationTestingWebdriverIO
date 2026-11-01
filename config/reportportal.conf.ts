
import 'dotenv/config';

// ======================================================
// ENVIRONMENT VALIDATION
// ======================================================

function requiredEnv(name: string): string {
    const value = process.env[name];

    if (!value || value.startsWith('ISI_')) {
        throw new Error(
            `Environment variable ${name} belum dikonfigurasi`
        );
    }

    return value;
}

// ======================================================
// EXECUTION CONFIGURATION
// ======================================================

// Platform: Android / iOS
const platform = process.env.RP_PLATFORM || 'Unknown';

// Device: itel_A6610L / iPhone_16e
const device = process.env.RP_DEVICE || 'Unknown';

// Testing framework: Mocha / Cucumber_BDD
const testingFramework = (
    process.env.RP_TESTING || 'Mocha'
).trim();

// Run type: normal / rerun
const runType = (
    process.env.RP_RUN_TYPE || 'normal'
).toLowerCase();

// ======================================================
// FRAMEWORK VALIDATION
// ======================================================

const supportedFrameworks = [
    'Mocha'
];

if (!supportedFrameworks.includes(testingFramework)) {
    throw new Error(
        `RP_TESTING tidak valid: ${testingFramework}. ` +
        'Gunakan Mocha.'
    );
}

// ======================================================
// LAUNCH CONFIGURATION
// ======================================================

const launchName = runType === 'rerun'
    ? `Mobile_Automation_${platform}_Rerun`
    : `Mobile_Automation_${platform}`;

// ======================================================
// REPORTPORTAL CONFIGURATION
// ======================================================

export const rpConfig = {
    // --------------------------------------------------
    // REPORTPORTAL CONNECTION
    // --------------------------------------------------

    apiKey: requiredEnv('RP_API_KEY'),
    endpoint: requiredEnv('RP_ENDPOINT'),
    project: requiredEnv('RP_PROJECT'),

    // --------------------------------------------------
    // LAUNCH INFORMATION
    // --------------------------------------------------

    launch: launchName,

    description:
        `Mobile Automation Testing - ${platform} - ${device}`,

    // --------------------------------------------------
    // LAUNCH ATTRIBUTES
    // --------------------------------------------------

    attributes: [
        { key: 'framework', value: 'WebdriverIO' },
        { key: 'testing', value: testingFramework },
        { key: 'platform', value: platform },
        { key: 'device', value: device }
    ],

    // --------------------------------------------------
    // REPORTER SETTINGS
    // --------------------------------------------------

    attachPicturesToLogs: true
};
