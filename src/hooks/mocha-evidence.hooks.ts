
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { browser } from '@wdio/globals';

// ======================================================
// MOCHA SCREENSHOT EVIDENCE
// ======================================================

export async function captureMochaEvidence(
    testName: string,
    passed: boolean
): Promise<string | null> {

    const platform = (
        process.env.RP_PLATFORM || 'unknown'
    ).toLowerCase();

    const status = passed ? 'PASS' : 'FAIL';

    // Membersihkan karakter yang tidak aman untuk nama file
    const safeName = testName
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 80);

    const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-');

    const evidenceDir = path.resolve(
        process.cwd(),
        'reports',
        platform,
        'mocha',
        'evidence'
    );

    const fileName = [
        timestamp,
        safeName,
        status,
        randomUUID().slice(0, 8)
    ].join('_') + '.png';

    const screenshotPath = path.join(
        evidenceDir,
        fileName
    );

    try {

        // Buat direktori jika belum tersedia
        await fs.mkdir(evidenceDir, {
            recursive: true
        });

        // Screenshot dari Appium Session
        const screenshotBase64 =
            await browser.takeScreenshot();

        // Simpan evidence PNG
        await fs.writeFile(
            screenshotPath,
            Buffer.from(screenshotBase64, 'base64')
        );

        console.log(
            `[MOCHA EVIDENCE] ${status}: ${screenshotPath}`
        );

        return screenshotPath;

    } catch (error) {

        console.warn(
            '[MOCHA EVIDENCE] Screenshot gagal:',
            error
        );

        // Screenshot tidak boleh mengubah hasil test
        return null;
    }
}
