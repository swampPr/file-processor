import { createSession, cleanSession, PDFGzip } from '../utils/utils.ts';
import type { SessionID } from '../utils/utils.ts';

export async function PDFCompressService(aggressive: Boolean, file: Buffer) {
    try {
        const id: SessionID = await createSession();

        if (aggressive) {
            const aggressiveCompress: Buffer = await compressAggressive(file, id);

            cleanSession(id);
            return aggressiveCompress;
        }
        const defaultCompress: Buffer = await compressDefault(file, id);

        cleanSession(id);
        return defaultCompress;
    } catch (err) {
        throw err;
    }
}

async function compressDefault(file: Buffer, id: SessionID) {
    try {
        await Bun.write(`./src/backend/sessions/${id}/input.pdf`, file);
        //NOTE: After this handle the actual compressing using pdfcpu
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
                '-c',
                '30000000',
                'setvmthreshold',
                '-f',
                'input.pdf',
            ],
            {
                cwd: `./src/backend/sessions/${id}`,
            }
        );
        await proc.exited;
        const outputFile = Bun.file(`./src/backend/sessions/${id}/output.pdf`);
        const outputBuffer: Buffer = Buffer.from(await outputFile.arrayBuffer());
        const gzippedResponse: Buffer = await PDFGzip(outputBuffer);
        //INFO: Clean in the background, responding to the user is priority
        return gzippedResponse;
    } catch (err) {
        throw err;
    }
}

async function compressAggressive(file: Buffer, id: SessionID) {
    try {
        await Bun.write(`./src/backend/sessions/${id}/input.pdf`, file);
        //NOTE: After this handle the actual compressing using pdfcpu
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
                '-c',
                '30000000',
                'setvmthreshold',
                '-f',
                'input.pdf',
            ],
            {
                cwd: `./src/backend/sessions/${id}`,
            }
        );
        await proc.exited;
        const outputFile = Bun.file(`./src/backend/sessions/${id}/output.pdf`);
        const outputBuffer: Buffer = Buffer.from(await outputFile.arrayBuffer());
        console.time('GZIP');
        const gzippedResponse: Buffer = await PDFGzip(outputBuffer);
        console.timeEnd('GZIP');
        return gzippedResponse;
    } catch (err) {
        throw err;
    }
}
