import type { SessionID } from '../utils/utils.ts';
import { cleanSession, createSession } from '../utils/utils.ts';
import { checkFormat } from '../utils/utils.ts';

async function MP4ToMP3(sessionPath: string) {
    try {
        await Bun.spawn(
            ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', 'input.mp4', 'output.mp3'],
            { cwd: sessionPath }
        ).exited;

        const outputFile = Bun.file(`${sessionPath}/output.mp3`);
        const mp3Buf: Buffer = Buffer.from(await outputFile.arrayBuffer());

        return mp3Buf;
    } catch (err) {
        throw err;
    }
}

async function MP4ToWebM(sessionPath: string) {
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
                'libvpx-vp9',
                '-crf',
                '30',
                '-b:v',
                '0',
                '-c:a',
                'libopus',
                '-b:a',
                '160k',
                'output.webm',
            ],
            {
                cwd: sessionPath,
            }
        ).exited;

        const outputFile = Bun.file(`${sessionPath}/output.webm`);
        const webmBuf: Buffer = Buffer.from(await outputFile.arrayBuffer());

        return webmBuf;
    } catch (err) {
        throw err;
    }
}

async function MP4ToFLAC(sessionPath: string) {
    try {
        await Bun.spawn(
            [
                'ffmpeg',
                '-hide_banner',
                '-loglevel',
                'error',
                '-i',
                'input.mp4',
                '-c:a',
                'flac',
                '-compression_level',
                '3',
                'output.flac',
            ],
            { cwd: sessionPath }
        ).exited;

        const outputFile = Bun.file(`${sessionPath}/output.flac`);
        const flacBuf: Buffer = Buffer.from(await outputFile.arrayBuffer());
        return flacBuf;
    } catch (err) {
        throw err;
    }
}

export async function MP4ConvertService(file: Buffer, format: 'mp3' | 'webm' | 'flac') {
    const id: SessionID = await createSession();
    try {
        const sessionPath: string = `./src/backend/sessions/${id}`;
        await Bun.write(`${sessionPath}/input.mp4`, file);

        const isMP4: Boolean = await checkFormat(sessionPath, 'input.mp4', 'mp4');
        if (!isMP4) throw new Error('File is NOT an MP4 file');

        if (format === 'mp3') {
            const mp3Buf: Buffer = await MP4ToMP3(sessionPath);
            return mp3Buf;
        } else if (format === 'flac') {
            const flacBuf: Buffer = await MP4ToFLAC(sessionPath);
            return flacBuf;
        }
        const webmBuf: Buffer = await MP4ToWebM(sessionPath);
        return webmBuf;
    } catch (err) {
        throw err;
    } finally {
        cleanSession(id);
    }
}
