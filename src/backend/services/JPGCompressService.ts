import sharp from 'sharp';
import { createSession, cleanSession, checkFormat } from '../utils/utils.ts';
import type { SessionID } from '../utils/utils.ts';

export async function JPGCompressService(file: Buffer) {
    const id: SessionID = await createSession();
    try {
        const sessionPath: string = `./src/backend/sessions/${id}`;
        await Bun.write(`${sessionPath}/input.jpeg`, file);

        const isJPG: Boolean = await checkFormat(sessionPath, 'input.jpeg', 'jpeg');
        if (!isJPG) throw new Error('File is NOT a JPEG Image');

        const compressedJPG: Buffer = await sharp(file)
            .jpeg({
                quality: 40,
            })
            .toBuffer();

        return compressedJPG;
    } finally {
        cleanSession(id);
    }
}
