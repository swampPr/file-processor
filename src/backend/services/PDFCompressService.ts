import { createSession, cleanSession } from '../utils/utils.ts';
import type { SessionID } from '../utils/utils.ts';

async function compressDefault(id: SessionID) {
    try {
        await Bun.spawn(
            [
                'gs',
                '-sDEVICE=pdfwrite',
                '-dCompatibilityLevel=1.4',
                '-dPDFSETTINGS=/ebook',
                '-dNOPAUSE',
                '-dQUIET',
                '-dBATCH',
                '-dNOGC',
                '-dNumRenderingThreads=4',
                '-sOutputFile=output.pdf',
                '-f',
                'input.pdf',
            ],
            {
                cwd: `./src/backend/sessions/${id}`,
            }
        ).exited;
        const outputFile = Bun.file(`./src/backend/sessions/${id}/output.pdf`);
        const outputBuffer: Buffer = Buffer.from(await outputFile.arrayBuffer());
        return outputBuffer;
    } catch (err) {
        throw err;
    }
}

async function compressAggressive(sessionPath: string) {
    try {
        await Bun.spawn(
            [
                'gs',
                '-sDEVICE=pdfwrite',
                '-dCompatibilityLevel=1.4',
                '-dColorImageDownsampleType=/Bicubic',
                '-dColorConversionStrategy=/Gray',
                '-dProcessColorModel=/DeviceGray',
                '-dColorImageResolution=72',
                '-dGrayImageResolution=72',
                '-dMonoImageResolution=72',
                '-dDownsampleColorImages=true',
                '-dDownsampleGrayImages=true',
                '-dDownsampleMonoImages=true',
                '-dCompressFonts=true',
                '-dSubsetFonts=true',
                '-dNOGC',
                '-dNumRenderingThreads=4',
                '-dNOPAUSE',
                '-dQUIET',
                '-dBATCH',
                '-sOutputFile=output.pdf',
                '-f',
                'input.pdf',
            ],
            {
                cwd: sessionPath,
            }
        ).exited;
        const outputFile = Bun.file(`${sessionPath}/output.pdf`);
        const outputBuffer: Buffer = Buffer.from(await outputFile.arrayBuffer());
        return outputBuffer;
    } catch (err) {
        throw err;
    }
}

export async function PDFCompressService(aggressive: Boolean, file: Buffer) {
    const id: SessionID = await createSession();
    try {
        const sesssionPath = `./src/backend/sessions/${id}`;
        await Bun.write(`${sesssionPath}/input.pdf`, file);

        if (aggressive) {
            const aggressiveCompress: Buffer = await compressAggressive(sesssionPath);

            cleanSession(id);
            return aggressiveCompress;
        }
        const defaultCompress: Buffer = await compressDefault(sesssionPath);

        return defaultCompress;
    } catch (err) {
        throw err;
    } finally {
        cleanSession(id);
    }
}
