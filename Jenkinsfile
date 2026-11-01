
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timestamps()
    }

    environment {
        PATH = "/opt/homebrew/bin:/opt/homebrew/sbin:${env.PATH}"

        PROJECT_DIR = '/Users/i-3/Projects/MobileAutomationTesting'
        APPIUM_HOST = '127.0.0.1'
        APPIUM_PORT = '4723'
    }

    stages {

        stage('Checkout Repository') {
            steps {
                checkout scm
            }
        }

        stage('Validate Parameters') {
            steps {
                script {
                    if (!(params.PLATFORM in ['ANDROID', 'IOS', 'ALL'])) {
                        error('Invalid PLATFORM parameter')
                    }

                    if (!(params.TEST_SCOPE in ['SMOKE', 'REGRESSION'])) {
                        error('Invalid TEST_SCOPE parameter')
                    }
                }

                echo "Platform: ${params.PLATFORM}"
                echo "Test Scope: ${params.TEST_SCOPE}"
                echo "Environment: ${params.ENVIRONMENT}"
                echo "ReportPortal: ${params.ENABLE_REPORTPORTAL}"
            }
        }

        stage('Validate Tools') {
            steps {
                sh '''
                    echo "=== NODE ==="
                    node --version

                    echo "=== NPM ==="
                    npm --version

                    echo "=== JAVA ==="
                    java -version

                    echo "=== ADB ==="
                    adb version

                    echo "=== XCODE ==="
                    xcodebuild -version
                '''
            }
        }

        stage('Validate Appium Device Farm') {
            steps {
                sh '''
                    echo "=== APPIUM STATUS ==="

                    curl --fail --silent --show-error \
                      --max-time 10 \
                      http://${APPIUM_HOST}:${APPIUM_PORT}/status

                    echo ""
                    echo "=== APPIUM CONNECTED ==="
                '''
            }
        }

        stage('Validate Mobile Devices') {
            steps {
                sh '''
                    echo "=== ANDROID DEVICES ==="
                    adb devices -l

                    echo "=== IOS SIMULATORS ==="
                    xcrun simctl list devices booted
                '''
            }
        }

        stage('Validate Test Project') {
            steps {
                sh '''
                    echo "=== SOURCE CODE ==="
                    test -f package.json
                    test -f config/wdio.android.mocha.conf.ts
                    test -f config/wdio.ios.mocha.conf.ts

                    echo "=== LOCAL APPLICATION FILES ==="
                    ls -lah "${PROJECT_DIR}/apps"

                    echo "=== REPORTPORTAL CONFIG ==="
                    if [ -f "${PROJECT_DIR}/.env" ]; then
                        echo "Local .env exists"
                    else
                        echo "Local .env is missing"
                    fi

                    echo "=== VALIDATION COMPLETED ==="
                '''
            }
        }
    }

    post {
        success {
            echo 'Mobile Automation environment validation PASSED'
        }

        failure {
            echo 'Mobile Automation environment validation FAILED'
        }

        always {
            echo 'Jenkins pipeline finished'
        }
    }
}
