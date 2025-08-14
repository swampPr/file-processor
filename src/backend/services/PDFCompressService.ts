import { createSession, cleanSession } from '../utils/utils.ts';
import type { SessionID } from '../utils/utils.ts';

async function checkFormat(sessionPath: string) {
    try {
        const proc = Bun.spawn(['pdfinfo', 'input.pdf'], {
            cwd: sessionPath,
            stderr: 'pipe',
            stdout: 'pipe',
        });
        const output = await proc.stdout.text();

        await proc.exited;

        return output.toLowerCase().includes('pdf version');
    } catch (err) {
        throw err;
    }
}

async function compressDefault(sessionPath: string) {
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
                cwd: sessionPath,
            }
        );

        await proc.exited;

        const outputFile = Bun.file(`${sessionPath}/output.pdf`);
        const outputBuffer: Buffer = Buffer.from(await outputFile.arrayBuffer());
        return outputBuffer;
    } catch (err) {
        throw err;
    }
}

async function compressAggressive(sessionPath: string) {
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
                cwd: sessionPath,
            }
        );

        await proc.exited;

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
        const sessionPath = `./src/backend/sessions/${id}`;
        await Bun.write(`${sessionPath}/input.pdf`, file);

        const isPDF: Boolean = await checkFormat(sessionPath);
        if (!isPDF) throw new Error('File is NOT a PDF file');

        if (aggressive) {
            return await compressAggressive(sessionPath);
        }

        return await compressDefault(sessionPath);
    } catch (err) {
        throw err;
    } finally {
        cleanSession(id);
    }
}
