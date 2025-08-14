import sharp from 'sharp';
import type { SessionID } from '../utils/utils.ts';
import { cleanSession, createSession, checkFormat } from '../utils/utils.ts';

async function WEBPToPNG(file: Buffer) {
    try {
        const png: Buffer = await sharp(file).png().toBuffer();
        return png;
    } catch (err) {
        throw err;
    }
}

async function WEBPToJPG(file: Buffer) {
    try {
        const jpg: Buffer = await sharp(file).jpeg().toBuffer();
        return jpg;
    } catch (err) {
        throw err;
    }
}

export async function WEBPConvertInterface(file: Buffer, format: 'png' | 'jpeg') {
    const id: SessionID = await createSession();
    try {
        const sessionPath: string = `./src/backend/sessions/${id}`;
        await Bun.write(`${sessionPath}/input.webp`, file);

        const isWEBP: Boolean = await checkFormat(sessionPath, 'input.webp', 'webp');
        if (!isWEBP) throw new Error('File is NOT a WebP file');

        if (format === 'jpeg') {
            const jpg: Buffer = await WEBPToJPG(file);

            return jpg;
        }

        const png: Buffer = await WEBPToPNG(file);

        return png;
    } catch (err) {
        throw err;
    } finally {
        cleanSession(id);
    }
}
