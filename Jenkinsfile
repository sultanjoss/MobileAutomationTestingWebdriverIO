
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timestamps()
    }

    stages {
        stage('Checkout Repository') {
            steps {
                checkout scm
            }
        }

        stage('Validate Environment') {
            steps {
                sh '''
                    echo "=== MOBILE AUTOMATION CI ==="
                    echo "Platform: ${PLATFORM}"
                    echo "Test Scope: ${TEST_SCOPE}"
                    echo "Environment: ${ENVIRONMENT}"
                    echo "ReportPortal: ${ENABLE_REPORTPORTAL}"

                    echo "=== TOOL VERSIONS ==="
                    node --version
                    npm --version
                    java -version

                    echo "=== GIT ==="
                    git rev-parse --abbrev-ref HEAD
                    git log -1 --oneline
                '''
            }
        }
    }
}
