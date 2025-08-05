import { createSession, cleanSession, PDFGzip } from '../utils/utils.ts';
import { readdir } from 'node:fs/promises';
import type { SessionID } from '../utils/utils.ts';

async function compressDefault(files: string[], id: SessionID) {
    try {
        for (const page of files) {
            const output = `compressed-${page}`;
            await Bun.spawn(
                [
                    'gs',
                    '-sDEVICE=pdfwrite',
                    '-dCompatibilityLevel=1.4',
                    '-dPDFSETTINGS=/ebook',
                    '-dNOPAUSE',
                    '-dQUIET',
                    '-dBATCH',
                    `-sOutputFile=${output}`,
                    '-c',
                    '30000000',
                    'setvmthreshold',
                    '-f',
                    page,
                ],
                {
                    cwd: `./src/backend/sessions/${id}`,
                }
            ).exited;
        }
        const dirFiles = await readdir(`./src/backend/sessions/${id}`);
        const compressedFiles: string[] = dirFiles.filter((file) => file.startsWith('compressed-'));
        return compressedFiles;
    } catch (err) {
        throw err;
    }
}

async function splitFile(id: SessionID): Promise<string[]> {
    try {
        await Bun.spawn(
            [
                'gs',
                '-dBATCH',
                '-dNOPAUSE',
                '-sDEVICE=pdfwrite',
                '-dSAFER',
                '-sOutputFile=page-%03d.pdf',
                'input.pdf',
            ],
            { cwd: `./src/backend/sessions/${id}` }
        ).exited;
        const files = await readdir(`./src/backend/sessions/${id}`);
        const splitFiles: string[] = files.filter((file) => file.startsWith('page'));

        return splitFiles;
    } catch (err) {
        throw err;
    }
}

async function compressAggressive(files: string[], id: SessionID) {
    try {
        for (const page of files) {
            const output = `compressed-${page}`;
            await Bun.spawn(
                [
                    'gs',
                    '-sDEVICE=pdfwrite',
                    '-dCompatibilityLevel=1.4',
                    '-dPDFSETTINGS=/screen',
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
                    '-dNOPAUSE',
                    '-dQUIET',
                    '-dBATCH',
                    `-sOutputFile=${output}`,
                    '-c',
                    '30000000',
                    'setvmthreshold',
                    '-f',
                    page,
                ],
                {
                    cwd: `./src/backend/sessions/${id}`,
                }
            ).exited;
        }
        const dirFiles = await readdir(`./src/backend/sessions/${id}`);
        const compressedFiles: string[] = dirFiles.filter((file) => file.startsWith('compressed-'));
        return compressedFiles;
    } catch (err) {
        throw err;
    }
}

async function mergeCompressedFiles(compressedFiles: string[], id: SessionID) {
    try {
        await Bun.spawn(
            [
                'gs',
                '-dBATCH',
                '-dNOPAUSE',
                '-q',
                '-sDEVICE=pdfwrite',
                '-sOutputFile=output.pdf',
                ...compressedFiles,
            ],
            {
                cwd: `./src/backend/sessions/${id}`,
            }
        ).exited;
    } catch (err) {
        throw err;
    }
}

export async function PDFCompressService(aggressive: Boolean, file: Buffer) {
    try {
        const id: SessionID = await createSession();
        await Bun.write(`./src/backend/sessions/${id}/input.pdf`, file);
        const splitFiles: string[] = await splitFile(id);

        if (aggressive) {
            const aggressiveCompress: string[] = await compressAggressive(splitFiles, id);

            await mergeCompressedFiles(aggressiveCompress, id);

            const outputFile = Bun.file(`./src/backend/sessions/${id}/output.pdf`);
            const outputBuffer: Buffer = Buffer.from(await outputFile.arrayBuffer());
            const outputGZIP: Buffer = await PDFGzip(outputBuffer);
            cleanSession(id);
            return outputGZIP;
        }
        const defaultCompress: string[] = await compressDefault(splitFiles, id);
        await mergeCompressedFiles(defaultCompress, id);

        const outputFile = Bun.file(`./src/backend/sessions/${id}/output.pdf`);
        const outputBuffer: Buffer = Buffer.from(await outputFile.arrayBuffer());
        const outputGZIP: Buffer = await PDFGzip(outputBuffer);
        cleanSession(id);
        return outputGZIP;
    } catch (err) {
        throw err;
    }
}
