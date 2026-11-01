import { Given } from '@wdio/cucumber-framework';

Given('sistem menjalankan scenario validasi retry',async () => {

        console.log('[RETRY TEST] Scenario dieksekusi');

        throw new Error(
            'Simulasi kegagalan untuk memvalidasi auto retry'
        );
    }
);
