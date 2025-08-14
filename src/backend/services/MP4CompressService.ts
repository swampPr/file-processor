import type { SessionID } from '../utils/utils.ts';
import { checkFormat } from '../utils/utils.ts';
import { createSession, cleanSession } from '../utils/utils.ts';

async function compressMP4(sessionPath: string) {
    try {
        const proc = Bun.spawn(
            [
                'ffmpeg',
                '-hide_banner',
                '-loglevel',
                'error',
                '-i',
                'input.mp4',
                '-c:v',
                'libx264',
                '-preset',
                'fast',
                '-crf',
                '23',
                '-c:a',
                'aac',
                '-b:a',
                '128k',
                'output.mp4',
            ],
            {
                cwd: sessionPath,
            }
        );

        await proc.exited;

        const outputFile = Bun.file(`${sessionPath}/output.mp4`);
        const compressedBuf: Buffer = Buffer.from(await outputFile.arrayBuffer());

        return compressedBuf;
    } catch (err) {
        throw err;
    }
}

async function compressMP4Aggressive(sessionPath: string) {
    try {
        await Bun.spawn(
            [
                'ffmpeg',
                '-hide_banner',
                '-loglevel',
                'error',
                '-i',
                'input.mp4',
                '-c:v',
                'libx264',
                '-preset',
                'veryfast',
                '-crf',
                '30',
                '-c:a',
                'aac',
                '-b:a',
                '96k',
                'output.mp4',
            ],
            {
                cwd: sessionPath,
            }
        ).exited;

        const outputFile = Bun.file(`${sessionPath}/output.mp4`);
        const compressedBuf: Buffer = Buffer.from(await outputFile.arrayBuffer());

        return compressedBuf;
    } catch (err) {
        throw err;
    }
}

export async function MP4CompressService(file: Buffer, aggro: Boolean) {
    const id: SessionID = await createSession();
    try {
        const sessionPath = `./src/backend/sessions/${id}`;
        await Bun.write(`${sessionPath}/input.mp4`, file);

        const isMP4: Boolean = await checkFormat(sessionPath, 'input.mp4', 'mp4');
        if (!isMP4) throw new Error('File is NOT an MP4 file');

        if (aggro) {
            const compressedBuf: Buffer = await compressMP4Aggressive(sessionPath);
            return compressedBuf;
        }

        const compressedBuf: Buffer = await compressMP4(sessionPath);
        return compressedBuf;
    } catch (err) {
        throw err;
    } finally {
        cleanSession(id);
    }
}
