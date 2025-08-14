import sharp from 'sharp';
import type { SessionID } from '../utils/utils.ts';
import { createSession, cleanSession, checkFormat } from '../utils/utils.ts';

export async function PNGCompressService(file: Buffer) {
    const id: SessionID = await createSession();
    try {
        const sessionPath: string = `./src/backend/sessions/${id}`;
        await Bun.write(`${sessionPath}/input.png`, file);

        const isPNG: Boolean = await checkFormat(sessionPath, 'input.png', 'png');

        const compressedPNG: Buffer = await sharp(file)
            .png({
                quality: 40,
            })
            .toBuffer();

        return compressedPNG;
    } catch (err) {
        throw err;
    } finally {
        cleanSession(id);
    }
}
