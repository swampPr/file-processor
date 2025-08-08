import { createSession, cleanSession } from '../utils/utils.ts';
import type { SessionID } from '../utils/utils.ts';

export async function PDFCompressService(aggressive: Boolean, file: Buffer) {
    try {
        const id: SessionID = await createSession();
        await Bun.write(`./src/backend/sessions/${id}/input.pdf`, file);

        if (aggressive) {
            const aggressiveCompress: Buffer = await compressAggressive(id);

            cleanSession(id);
            return aggressiveCompress;
        }
        const defaultCompress: Buffer = await compressDefault(id);

        return defaultCompress;
    } catch (err) {
        throw err;
    }
}

async function compressDefault(id: SessionID) {
    try {
        const proc = Bun.spawn(
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
                stdout: 'inherit',
                stderr: 'inherit',
            }
        );
        await proc.exited;
        const outputFile = Bun.file(`./src/backend/sessions/${id}/output.pdf`);
        const outputBuffer: Buffer = Buffer.from(await outputFile.arrayBuffer());
        return outputBuffer;
    } catch (err) {
        throw err;
    }
}

async function compressAggressive(id: SessionID) {
    try {
        const proc = Bun.spawn(
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
                cwd: `./src/backend/sessions/${id}`,
                stdout: 'inherit',
                stderr: 'inherit',
            }
        );
        await proc.exited;
        const outputFile = Bun.file(`./src/backend/sessions/${id}/output.pdf`);
        const outputBuffer: Buffer = Buffer.from(await outputFile.arrayBuffer());
        return outputBuffer;
    } catch (err) {
        throw err;
    }
}
