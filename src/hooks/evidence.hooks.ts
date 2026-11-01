
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { browser } from '@wdio/globals';

export async function captureStepEvidence(
    stepName: string,
    passed: boolean
): Promise<string | null> {

    const platform = (
        process.env.RP_PLATFORM || 'Unknown'
    ).toLowerCase();

    const status = passed ? 'PASS' : 'FAIL';

    const safeName = stepName
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 70);

    const folder = path.resolve(
        process.cwd(),
        'reports',
        platform,
        'evidence'
    );

    await fs.mkdir(folder, { recursive: true });

    const filename = [
        new Date().toISOString().replace(/[:.]/g, '-'),
        safeName,
        status,
        randomUUID().slice(0, 8)
    ].join('_') + '.png';

    const filepath = path.join(folder, filename);

    try {
        const screenshot = await browser.takeScreenshot();

        await fs.writeFile(
            filepath,
            Buffer.from(screenshot, 'base64')
        );

        console.log(
            `[EVIDENCE] ${status}: ${filepath}`
        );

        return filepath;

    } catch (error) {
        console.error(
            '[EVIDENCE] Screenshot gagal:',
            error
        );

        return null;
    }
}
