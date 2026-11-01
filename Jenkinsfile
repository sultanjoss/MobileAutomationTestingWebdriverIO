
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timestamps()
    }

    environment {
        PATH = "/opt/homebrew/bin:/opt/homebrew/sbin:${env.PATH}"

        APPIUM_HOST = '127.0.0.1'
        APPIUM_PORT = '4723'

        ANDROID_UDID = '146957054F004347'
        ANDROID_PACKAGE = 'com.swaglabsmobileapp'

        RP_PLATFORM = 'Android'
        RP_TESTING = 'Mocha'
        RP_ENDPOINT = 'http://127.0.0.1:8080/api/v1'
        RP_URL = 'http://127.0.0.1:8080'
        RP_PROJECT = 'mobile_automation_testing'

        GLOBAL_EVIDENCE = 'true'
    }

    stages {

        // ==========================================
        // STAGE 1 - CHECKOUT GITHUB
        // ==========================================

        stage('Checkout Repository') {
            steps {
                checkout scm

                sh '''
                    echo "=== GIT REVISION ==="
                    git log -1 --oneline
                '''
            }
        }

        // ==========================================
        // STAGE 2 - VALIDATE PARAMETERS
        // ==========================================

        stage('Validate Parameters') {
            steps {
                script {
                    if (params.PLATFORM != 'ANDROID') {
                        error(
                            'Build pertama hanya mendukung PLATFORM=ANDROID.'
                        )
                    }

                    if (params.TEST_SCOPE != 'SMOKE') {
                        error(
                            'Build pertama hanya mendukung TEST_SCOPE=SMOKE.'
                        )
                    }

                    if (params.ENVIRONMENT != 'STAGING') {
                        error(
                            'Environment harus STAGING.'
                        )
                    }

                    if (!params.ENABLE_REPORTPORTAL) {
                        error(
                            'Build pertama membutuhkan ENABLE_REPORTPORTAL=true.'
                        )
                    }
                }

                echo "PLATFORM: ${params.PLATFORM}"
                echo "TEST_SCOPE: ${params.TEST_SCOPE}"
                echo "ENVIRONMENT: ${params.ENVIRONMENT}"
                echo "REPORTPORTAL: ${params.ENABLE_REPORTPORTAL}"
            }
        }

        // ==========================================
        // STAGE 3 - INSTALL DEPENDENCIES
        // ==========================================

        stage('Install Dependencies') {
            steps {
                sh '''
                    echo "=== NODE VERSION ==="
                    node --version

                    echo "=== NPM VERSION ==="
                    npm --version

                    echo "=== INSTALL PROJECT DEPENDENCIES ==="
                    npm ci
                '''
            }
        }

        // ==========================================
        // STAGE 4 - VALIDATE APPIUM DEVICE FARM
        // ==========================================

        stage('Validate Appium Device Farm') {
            steps {
                sh '''
                    echo "=== CHECK APPIUM SERVER ==="

                    curl --fail --silent --show-error \
                      --max-time 10 \
                      "http://${APPIUM_HOST}:${APPIUM_PORT}/status"

                    echo ""
                    echo "Appium endpoint is reachable."
                '''
            }
        }

        // ==========================================
        // STAGE 5 - VALIDATE ANDROID DEVICE
        // ==========================================

        stage('Validate Android Device') {
            steps {
                sh '''
                    echo "=== ANDROID DEVICES ==="
                    adb devices -l

                    echo "=== VALIDATE DEVICE ==="
                    DEVICE_STATE=$(adb -s "$ANDROID_UDID" get-state)

                    if [ "$DEVICE_STATE" != "device" ]; then
                        echo "Android device is not ready."
                        exit 1
                    fi

                    echo "=== VALIDATE INSTALLED APPLICATION ==="

                    adb -s "$ANDROID_UDID" \
                      shell pm path "$ANDROID_PACKAGE" \
                      | grep -q 'package:'

                    echo "Android device and application are ready."
                '''
            }
        }

        // ==========================================
        // STAGE 6 - EXECUTE ANDROID SMOKE TEST
        // ==========================================

        stage('Execute Android Smoke Test') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'reportportal-api-key',
                        variable: 'RP_API_KEY'
                    )
                ]) {
                    sh '''
                        echo "=== ANDROID SMOKE TEST ==="
                        echo "Platform: ${RP_PLATFORM}"
                        echo "Testing: ${RP_TESTING}"
                        echo "Scope: ${TEST_SCOPE}"

                        npx wdio run \
                          ./config/wdio.android.mocha.conf.ts \
                          --mochaOpts.grep "@smoke"
                    '''
                }
            }
        }
    }

    // ==============================================
    // POST EXECUTION
    // ==============================================

    post {

        success {
            echo 'ANDROID SMOKE TEST - SUCCESS'
        }

        failure {
            echo 'ANDROID SMOKE TEST - FAILED'
        }

        always {
            archiveArtifacts(
                artifacts: 'reports/**/*',
                allowEmptyArchive: true,
                fingerprint: false
            )

            echo 'Mobile Automation Jenkins build completed.'
        }
    }
}
