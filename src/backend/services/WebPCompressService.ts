import sharp from 'sharp';
import { checkFormat } from '../utils/utils.ts';
import type { SessionID } from '../utils/utils.ts';
import { createSession, cleanSession } from '../utils/utils.ts';

export async function WEBPCompressService(file: Buffer) {
    const id: SessionID = await createSession();
    try {
        const sessionPath = `./src/backend/sessions/${id}`;
        await Bun.write(`${sessionPath}/input.webp`, file);

        const isWEBP: Boolean = await checkFormat(sessionPath, 'input.webp', 'webp');
        if (!isWEBP) throw new Error('File is NOT a WebP image');

        const compressedWEBP: Buffer = await sharp(file)
            .webp({
                quality: 40,
            })
            .toBuffer();

        return compressedWEBP;
    } finally {
        cleanSession(id);
    }
}
