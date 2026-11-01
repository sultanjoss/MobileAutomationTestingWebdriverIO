# Mobile Automation Testing — Android & iOS

Cross-platform mobile UI automation using **Appium**, **WebdriverIO**, **TypeScript**, **Mocha**, and the **Page Object Model (POM)** pattern. The project targets Android real devices and iOS Simulators, with Appium Device Farm, ReportPortal, screenshot evidence, and Cucumber-compatible HTML reporting.

> **Project status:** Android regression and iOS Login / Checkout E2E have been executed successfully. Jenkins automation (manual parameters, staging merge trigger, nightly runs) is planned and not yet implemented.

## Technology stack

| Area | Technology |
| --- | --- |
| Automation | Appium + WebdriverIO |
| Language | TypeScript (Node.js) |
| Test runner | Mocha |
| Design pattern | Page Object Model |
| Android | UiAutomator2; USB-connected real device |
| iOS | XCUITest; iPhone Simulator |
| Device management | Appium Device Farm |
| Test dashboard | ReportPortal |
| Evidence | Screenshots captured by test hooks |
| HTML reports | Cucumber JSON conversion + HTML reporter |
| CI/CD (planned) | Jenkins |

## Architecture

```text
Jenkins (planned) / Local CLI
             |
       WebdriverIO + Mocha
             |
       TypeScript Test Specs
             |
         Page Objects
             |
        Appium Server
             |
       Appium Device Farm
             |
       +-----+-----+
       |           |
   Android       iOS
   real device   Simulator
             |
      Evidence + ReportPortal
             |
       Cucumber-compatible JSON/HTML
```

## Project structure

```text
MobileAutomationTesting/
├── apps/                         # Test app assets (APK/IPA; manage large files appropriately)
├── config/                       # Shared / Android / iOS WDIO configuration
├── docker/                       # Docker configuration used by supporting services
├── scripts/                      # Reporting and conversion utilities
├── src/
│   ├── android/                  # Android pages, tests and supporting code
│   ├── ios/                      # iOS pages, tests, locators and test data
│   └── hooks/                     # Screenshot / evidence hooks
├── test-data/                    # Test datasets
├── tests-validation/             # Supporting validation tests
├── reports/                      # Generated reports and screenshots (Git-ignored)
├── .env                          # Local credentials (Git-ignored)
├── .gitignore
├── package.json
├── tsconfig.json
└── Jenkinsfile                   # CI/CD configuration (planned)
```

> The tree describes the framework layout. Individual files or folders may vary as the test suite evolves.

## Prerequisites

- macOS for iOS Simulator execution, with Xcode and an installed iOS Simulator runtime.
- Node.js and npm.
- Java JDK and Android SDK Platform Tools (`adb`) for Android testing.
- Appium with `uiautomator2` and `xcuitest` drivers.
- An Android device with USB debugging enabled and/or an available iOS Simulator.
- ReportPortal only if publishing dashboard results.

Check tool availability:

```bash
node --version
npm --version
java -version
appium --version
adb devices -l
xcrun simctl list devices booted
```

## Install dependencies

```bash
git clone https://github.com/sultanjoss/MobileAutomationTestingWebdriverIO.git
cd MobileAutomationTestingWebdriverIO
npm ci
```

Install Appium drivers if they are not installed on the machine:

```bash
appium driver install uiautomator2
appium driver install xcuitest
appium driver list --installed
```

The actual Appium and plugin versions should be validated against the project's lockfile and the local environment.

## Local environment configuration

Use a local `.env` file for tokens and environment-specific configuration. **Never commit `.env` or credentials.** Configure the necessary keys based on the WDIO configuration and reporting scripts; for example:

```dotenv
RP_URL=http://localhost:8080
RP_PROJECT=mobile_automation_testing
RP_API_KEY=YOUR_REPORTPORTAL_API_KEY
```

These are example values only. Keep real secrets in local environment variables or Jenkins Credentials.

## Start Appium Device Farm

The current local Device Farm setup uses port **4723**:

```bash
appium \
  --address 127.0.0.1 \
  --port 4723 \
  --use-plugins=device-farm,inspector \
  --plugin-device-farm-platform=both \
  --plugin-device-farm-ios-device-type=both \
  --plugin-device-farm-android-device-type=both \
  --plugin-device-farm-booted-simulators \
  --log-level info
```

Device Farm dashboard: `http://127.0.0.1:4723/device-farm`

Ensure the required plugins are installed, the desired simulator is booted, and there are no stale Inspector sessions holding devices.

## Run mobile tests

**Android regression**

```bash
RP_PLATFORM=Android \
RP_TESTING=Mocha \
GLOBAL_EVIDENCE=true \
APPIUM_PORT=4723 \
npx wdio run ./config/wdio.android.mocha.conf.ts
```

**iOS regression**

```bash
RP_PLATFORM=iOS \
RP_TESTING=Mocha \
GLOBAL_EVIDENCE=true \
APPIUM_PORT=4723 \
npx wdio run ./config/wdio.ios.mocha.conf.ts
```

**iOS single spec (Checkout E2E)**

```bash
RP_PLATFORM=iOS \
RP_TESTING=Mocha \
GLOBAL_EVIDENCE=true \
APPIUM_PORT=4723 \
npx wdio run ./config/wdio.ios.mocha.conf.ts \
  --spec ./src/ios/tests/checkout-e2e.spec.ts
```

> Commands assume the matching WDIO config files and connected devices are available. Run Android and iOS sequentially until the CI runner and device allocation are verified for parallel execution.

## Screenshot evidence and reports

The project uses screenshot hooks to record automation actions and final test states. The global-evidence layout is organized by execution, status, suite and test case:

```text
reports/<platform>/mocha/evidence/
└── run-<timestamp>/
    ├── PASS/
    │   └── <suite>/<test-case-id>/
    │       ├── steps.json
    │       └── step_*.png
    └── FAILED/
        └── <suite>/<test-case-id>/
            ├── steps.json
            └── step_*.png
```

An older Android evidence path, `reports/android/mocha/step-evidence/<test-case-id>/`, may also be present. The converter must be configured to match the evidence layout generated by the active hooks.

ReportPortal receives execution results and screenshot attachments. A custom converter produces Cucumber-compatible JSON, followed by an HTML report generator. **Evidence attachment matching for the converted HTML report is still being refined; ReportPortal and local screenshots remain available independently.**

Example conversion (replace `83` with the actual ReportPortal launch ID):

```bash
RP_PLATFORM=iOS \
node --env-file=.env scripts/reportportal-to-cucumber.mjs 83

RP_PLATFORM=iOS REPORT_SOURCE=converted RP_LAUNCH_ID=83 \
node scripts/generate-cucumber-report.mjs
```

Generated output is stored under `reports/` and excluded from Git.

## CI/CD roadmap — Jenkins

The planned pipeline supports three trigger modes:

| Trigger | Intended behavior | Status |
| --- | --- | --- |
| Manual | Build with Parameters: platform, test scope, environment and reporting options | Planned |
| Merge to `staging` | Execute relevant mobile regression after an approved merge | Planned |
| Nightly | Scheduled Android and iOS regression | Planned |

Planned parameters:

- `PLATFORM`: `ANDROID`, `IOS`, `ALL`
- `TEST_SCOPE`: `SMOKE`, `REGRESSION`
- `ENVIRONMENT`: `STAGING`
- `ENABLE_REPORTPORTAL`: `true`, `false`

A macOS Jenkins agent with Xcode/Simulator access is required for iOS; Android requires an accessible USB device or other configured Android execution target. Webhook access and branch-trigger behavior will be configured separately from local manual/nightly execution.

## Git workflow

The intended primary development branches are:

- `main`: stable baseline.
- `staging`: integration branch and future Jenkins merge trigger.
- `feature/*`: short-lived implementation branches, merged through Pull Requests.

Before pushing, verify `.gitignore` excludes local secrets, `node_modules/`, generated reports and logs. Review any APK/IPA files before committing; use Git LFS or external artifact storage for large binaries.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| `ECONNREFUSED 127.0.0.1:4723` | Start the Appium server and verify the configured port. |
| iOS session hangs | Check simulator boot status, Device Farm allocation, WDA and stale Inspector sessions. |
| Android device not found | Run `adb devices -l` and confirm USB debugging/authorization. |
| Screenshots visible in ReportPortal but absent in Cucumber HTML | Validate `steps.json`, evidence folder mapping, launch time and embedded images in generated JSON. |
| Jenkins cannot start iOS tests | Check the macOS agent account, Xcode command-line tools, simulator availability and permissions. |

## Security

- Never commit `.env`, API keys, passwords, provisioning profiles or device-specific secrets.
- Prefer Jenkins Credentials for CI integrations.
- Review screenshots, logs and report artifacts before sharing; they may include test data.
- Keep Appium / Jenkins access restricted to trusted networks unless secured behind appropriate authentication and networking controls.

## License

No license has been declared yet. Add a `LICENSE` file if you want to define reuse and distribution permissions.
