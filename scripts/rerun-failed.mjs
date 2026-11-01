
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// ======================================================
// PROJECT CONFIGURATION
// ======================================================

const root = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..'
);

const platform = (
    process.env.RP_PLATFORM || ''
).toLowerCase();

const devices = {
    ios: 'wdio.ios.bdd.conf.ts',
    android: 'wdio.android.bdd.conf.ts'
};

if (!Object.hasOwn(devices, platform)) {
    throw new Error(
        'RP_PLATFORM wajib diisi: Android atau iOS'
    );
}

const configPath = path.join(
    root,
    'config',
    devices[platform]
);

const sourceJson = path.join(
    root,
    'reports',
    platform,
    'cucumber-json',
    'login.json'
);

if (!fs.existsSync(sourceJson)) {
    throw new Error(
        `Cucumber JSON tidak ditemukan: ${sourceJson}`
    );
}

// ======================================================
// READ CUCUMBER JSON
// ======================================================

const features = JSON.parse(
    fs.readFileSync(sourceJson, 'utf8')
);

const failedScenarios = [];

const failedStatuses = new Set([
    'failed',
    'undefined',
    'ambiguous',
    'pending'
]);

for (const feature of features) {

    for (const scenario of feature.elements || []) {

        if (scenario.type !== 'scenario') {
            continue;
        }

        const executions = [
            ...(scenario.before || []),
            ...(scenario.steps || []),
            ...(scenario.after || [])
        ];

        const isFailed = executions.some(
            item => failedStatuses.has(
                item.result?.status
            )
        );

        if (isFailed) {
            failedScenarios.push({
                feature: feature.uri,
                name: scenario.name
            });
        }
    }
}

console.log('================================');
console.log('FAILED-ONLY RERUN');
console.log('================================');

console.log(`Platform : ${platform}`);
console.log(`Failed   : ${failedScenarios.length}`);

if (failedScenarios.length === 0) {
    console.log(
        '[RERUN] Tidak ada scenario FAILED.'
    );

    process.exit(0);
}

// ======================================================
// CREATE RERUN DIRECTORY
// ======================================================

const runId = new Date()
    .toISOString()
    .replace(/[:.]/g, '-');

const rerunDir = path.join(
    root,
    'reports',
    platform,
    'rerun',
    runId
);

fs.mkdirSync(rerunDir, { recursive: true });

// Simpan snapshot JSON sumber untuk audit
fs.copyFileSync(
    sourceJson,
    path.join(rerunDir, 'original.json')
);

// ======================================================
// EXECUTE FAILED SCENARIOS
// ======================================================

let failedReruns = 0;

for (let index = 0; index < failedScenarios.length; index++) {

    const scenario = failedScenarios[index];

    console.log(
        `\n[RERUN ${index + 1}/${failedScenarios.length}]`
    );

    console.log(`Scenario: ${scenario.name}`);

    const jsonPath = path.join(
        rerunDir,
        `scenario-${index + 1}.json`
    );

    // Escape karakter regex agar nama cocok persis
    const escapedName = scenario.name.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
    );

    const nameFilter = `^${escapedName}$`;

    let featurePath = scenario.feature;

    if (featurePath.startsWith('file://')) {
        featurePath = fileURLToPath(featurePath);
    }

    if (!path.isAbsolute(featurePath)) {
        featurePath = path.resolve(root, featurePath);
    }

    const allowedDir = path.join(
        root,
        'src',
        'features'
    );

    const relativeFeature = path.relative(
        allowedDir,
        featurePath
    );

    if (
        relativeFeature.startsWith('..') ||
        path.isAbsolute(relativeFeature)
    ) {
        throw new Error(
            `Feature di luar direktori yang diizinkan: ${featurePath}`
        );
    }

    const args = [
        'wdio',
        'run',
        configPath,
        '--spec',
        featurePath,
        `--cucumberOpts.name=${nameFilter}`
    ];

    const result = spawnSync(
        'npx',
        args,
        {
            cwd: root,
            stdio: 'inherit',
            env: {
                ...process.env,

                // Menjalankan scenario berdasarkan nama,
                // bukan membatasi dengan tag lama
                CUCUMBER_TAGS: '',

                // Pisahkan output setiap rerun
                CUCUMBER_JSON_PATH: jsonPath,

                // Identifikasi proses rerun
                RP_RUN_TYPE: 'rerun'
            }
        }
    );

    if (result.status !== 0) {
        failedReruns++;

        console.error(
            `[RERUN] Belum PASS: ${scenario.name}`
        );
    } else {
        console.log(
            `[RERUN] PASS: ${scenario.name}`
        );
    }
}

// ======================================================
// SUMMARY
// ======================================================

console.log('\n================================');
console.log('RERUN SUMMARY');
console.log('================================');

console.log(`Total failed awal : ${failedScenarios.length}`);
console.log(`Rerun PASS        : ${failedScenarios.length - failedReruns}`);
console.log(`Rerun belum PASS  : ${failedReruns}`);
console.log(`Evidence folder   : ${rerunDir}`);

process.exitCode = failedReruns > 0 ? 1 : 0;
