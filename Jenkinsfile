
pipeline {

    // ==================================================
    // JENKINS EXECUTION AGENT
    // ==================================================

    agent any

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timestamps()
    }

    // ==================================================
    // ENVIRONMENT CONFIGURATION
    // ==================================================

    environment {
        PATH = "/opt/homebrew/bin:/opt/homebrew/sbin:${env.PATH}"

        // Appium Device Farm
        APPIUM_HOST = '127.0.0.1'
        APPIUM_PORT = '4723'

        // Android Real Device
        ANDROID_UDID = '146957054F004347'
        ANDROID_PACKAGE = 'com.swaglabsmobileapp'

        // iOS Simulator
        IOS_UDID = '0339E1E4-3925-454F-8AAE-890563DAAE15'
        IOS_BUNDLE_ID = 'com.saucelabs.SwagLabsMobileApp'

        // ReportPortal
        RP_ENDPOINT = 'http://127.0.0.1:8080/api/v1'
        RP_URL = 'http://127.0.0.1:8080'
        RP_PROJECT = 'mobile_automation_testing'
        RP_TESTING = 'Mocha'

        // Evidence
        GLOBAL_EVIDENCE = 'true'
    }

    // ==================================================
    // PIPELINE STAGES
    // ==================================================

    stages {

        // ==============================================
        // STAGE 1 - CHECKOUT REPOSITORY
        // ==============================================

        stage('Checkout Repository') {
            steps {
                checkout scm

                sh '''
                    echo "=== GIT REVISION ==="
                    git log -1 --oneline
                '''
            }
        }

        // ==============================================
        // STAGE 2 - VALIDATE PARAMETERS
        // ==============================================

        stage('Validate Parameters') {
            steps {
                script {
                    if (!(params.PLATFORM in [
                        'ANDROID',
                        'IOS',
                        'ALL'
                    ])) {
                        error('Invalid PLATFORM parameter.')
                    }

                    if (!(params.TEST_SCOPE in [
                        'SMOKE',
                        'REGRESSION'
                    ])) {
                        error('Invalid TEST_SCOPE parameter.')
                    }

                    if (params.ENVIRONMENT != 'STAGING') {
                        error('Only STAGING is configured.')
                    }

                    // Reporter masih wajib aktif dalam
                    // konfigurasi WebdriverIO saat ini.
                    if (!params.ENABLE_REPORTPORTAL) {
                        error(
                            'Disabling ReportPortal is not yet ' +
                            'supported by the current WDIO configuration.'
                        )
                    }
                }

                echo "PLATFORM: ${params.PLATFORM}"
                echo "TEST_SCOPE: ${params.TEST_SCOPE}"
                echo "ENVIRONMENT: ${params.ENVIRONMENT}"
                echo "ENABLE_REPORTPORTAL: ${params.ENABLE_REPORTPORTAL}"
            }
        }

        // ==============================================
        // STAGE 3 - INSTALL DEPENDENCIES
        // ==============================================

        stage('Install Dependencies') {
            steps {
                sh '''
                    set -eu

                    echo "=== NODE VERSION ==="
                    node --version

                    echo "=== NPM VERSION ==="
                    npm --version

                    echo "=== INSTALL DEPENDENCIES ==="
                    npm ci
                '''
            }
        }

        // ==============================================
        // STAGE 4 - VALIDATE APPIUM DEVICE FARM
        // ==============================================

        stage('Validate Appium Device Farm') {
            steps {
                sh '''
                    set -eu

                    echo "=== APPIUM DEVICE FARM ==="

                    curl --fail --silent --show-error \
                        --max-time 10 \
                        "http://${APPIUM_HOST}:${APPIUM_PORT}/status"

                    echo ""
                    echo "Appium Device Farm is reachable."
                '''
            }
        }

        // ==============================================
        // STAGE 5 - ANDROID REGRESSION
        // RESOURCE: android-itel-a6610l
        // ==============================================

        stage('Android Automation') {
            when {
                expression {
                    params.PLATFORM in ['ANDROID', 'ALL']
                }
            }

            steps {
                lock(resource: 'android-itel-a6610l') {

                    // ----------------------------------
                    // VALIDATE ANDROID DEVICE
                    // ----------------------------------

                    sh '''
                        set -eu

                        echo "=== ANDROID DEVICE VALIDATION ==="

                        adb devices -l

                        DEVICE_STATE=$(
                            adb -s "$ANDROID_UDID" get-state
                        )

                        if [ "$DEVICE_STATE" != "device" ]; then
                            echo "Android device is not ready."
                            exit 1
                        fi

                        adb -s "$ANDROID_UDID" \
                            shell pm path "$ANDROID_PACKAGE" \
                            | grep -q 'package:'

                        echo "Android device and SwagLabs are ready."
                    '''

                    // ----------------------------------
                    // EXECUTE ANDROID TESTS
                    // ----------------------------------

                    withCredentials([
                        string(
                            credentialsId: 'reportportal-api-key',
                            variable: 'RP_API_KEY'
                        )
                    ]) {
                        sh '''
                            set -eu

                            export RP_PLATFORM=Android
                            export RP_TESTING=Mocha
                            export GLOBAL_EVIDENCE=true

                            if [ "$TEST_SCOPE" = "SMOKE" ]; then
                                TEST_TAG="@smoke"
                            else
                                TEST_TAG="@regression"
                            fi

                            echo "=== ANDROID AUTOMATION ==="
                            echo "Platform: Android"
                            echo "Scope: $TEST_SCOPE"
                            echo "Filter: $TEST_TAG"

                            npx wdio run \
                                ./config/wdio.android.mocha.conf.ts \
                                --mochaOpts.grep "$TEST_TAG"
                        '''
                    }
                }
            }
        }

        // ==============================================
        // STAGE 6 - IOS REGRESSION
        // RESOURCE: ios-iphone-16e
        // ==============================================

        stage('iOS Automation') {
            when {
                expression {
                    params.PLATFORM in ['IOS', 'ALL']
                }
            }

            steps {
                lock(resource: 'ios-iphone-16e') {

                    // ----------------------------------
                    // VALIDATE IOS SIMULATOR
                    // ----------------------------------

                    sh '''
                        set -eu

                        echo "=== IOS SIMULATOR VALIDATION ==="

                        xcrun simctl list devices booted

                        SIMULATOR_STATE=$(
                            xcrun simctl list devices booted |
                            grep -F "$IOS_UDID" || true
                        )

                        if [ -z "$SIMULATOR_STATE" ]; then
                            echo "Required iOS Simulator is not booted."
                            exit 1
                        fi

                        echo "=== VALIDATE IOS APPLICATION ==="

                        xcrun simctl get_app_container \
                            "$IOS_UDID" \
                            "$IOS_BUNDLE_ID" \
                            app

                        echo "iOS Simulator and SwagLabs are ready."
                    '''

                    // ----------------------------------
                    // EXECUTE IOS TESTS
                    // ----------------------------------

                    withCredentials([
                        string(
                            credentialsId: 'reportportal-api-key',
                            variable: 'RP_API_KEY'
                        )
                    ]) {
                        sh '''
                            set -eu

                            export RP_PLATFORM=iOS
                            export RP_TESTING=Mocha
                            export GLOBAL_EVIDENCE=true

                            if [ "$TEST_SCOPE" = "SMOKE" ]; then
                                TEST_TAG="@smoke"
                            else
                                TEST_TAG="@regression"
                            fi

                            echo "=== IOS AUTOMATION ==="
                            echo "Platform: iOS"
                            echo "Scope: $TEST_SCOPE"
                            echo "Filter: $TEST_TAG"

                            npx wdio run \
                                ./config/wdio.ios.mocha.conf.ts \
                                --mochaOpts.grep "$TEST_TAG"
                        '''
                    }
                }
            }
        }
    }

    // ==================================================
    // POST EXECUTION
    // ==================================================

    post {

        success {
            echo 'MOBILE AUTOMATION BUILD SUCCESS'
        }

        failure {
            echo 'MOBILE AUTOMATION BUILD FAILED'
        }

        unstable {
            echo 'MOBILE AUTOMATION BUILD UNSTABLE'
        }

        always {
            archiveArtifacts(
                artifacts: 'reports/**/*',
                allowEmptyArchive: true,
                fingerprint: false
            )

            echo 'Mobile Automation pipeline completed.'
        }
    }
}
