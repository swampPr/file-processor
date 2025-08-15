import type { SessionID } from '../utils/utils.ts';
import { Logger } from '../utils/utils.ts';
import { cleanSession, createSession } from '../utils/utils.ts';
import AdmZip from 'adm-zip';
import { mkdir } from 'node:fs/promises';

const zip = new AdmZip();
const log = new Logger();

type PDFInfo = {
    readonly IMGFolder: string;
    readonly numOfPages: number | 'Failed to parse page count';
};

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

async function getPDFInfo(filePath: string) {
    try {
        const pdfInfoProc = Bun.spawn(['pdfinfo', 'input.pdf'], {
            cwd: filePath,
            stdout: 'pipe',
            stderr: 'pipe',
        });

        const pdfInfoStdout = await new Response(pdfInfoProc.stdout).text();

        const pagesLine = pdfInfoStdout.split('\n').find((line) => line.startsWith('Pages:'));

        //INFO: Get the numbers from the "Pages:" section.
        const match = pagesLine?.match(/\d+/);

        const numOfPages: number | 'Failed to parse page count' = match
            ? Number(match[0])
            : 'Failed to parse page count';

        await pdfInfoProc.exited;

        await mkdir(`${filePath}/images`);

        return {
            IMGFolder: `${filePath}/images`,
            numOfPages,
        };
    } catch (err) {
        throw err;
    }
}

async function convertToJPGService(fileName: string, filePath: string) {
    try {
        const fileInfo: PDFInfo = await getPDFInfo(filePath);

        await Bun.spawn(['convert', `input.pdf`, `./images/${fileName}.jpeg`], {
            cwd: filePath,
        }).exited;

        log.Log('PDF Now converted to JPEG');

        if (
            fileInfo.numOfPages === 'Failed to parse page count' ||
            Number(fileInfo.numOfPages) > 1
        ) {
            await zip.addLocalFolderPromise(`${fileInfo.IMGFolder}`, {});
            const zipToBuffer: Buffer = await zip.toBufferPromise();

            return {
                zipBuffer: zipToBuffer,
                isZip: true,
            };
        }

        const converted = Bun.file(`${filePath}/images/${fileName}.jpeg`);
        const convertedBuf: Buffer = Buffer.from(await converted.arrayBuffer());
        return convertedBuf;
    } catch (err) {
        throw err;
    }
}

async function convertToPNGService(fileName: string, filePath: string) {
    try {
        const fileInfo: PDFInfo = await getPDFInfo(filePath);

        await Bun.spawn(['convert', 'input.pdf', `./images/${fileName}.png`], {
            cwd: filePath,
        }).exited;

        if (
            fileInfo.numOfPages === 'Failed to parse page count' ||
            Number(fileInfo.numOfPages) > 1
        ) {
            await zip.addLocalFolderPromise(`${fileInfo.IMGFolder}`, {});
            const zipToBuffer: Buffer = await zip.toBufferPromise();

            return {
                zipBuffer: zipToBuffer,
                isZip: true,
            };
        }

        const converted = Bun.file(`${filePath}/images/${fileName}.png`);
        const convertedBuf: Buffer = Buffer.from(await converted.arrayBuffer());

        return convertedBuf;
    } catch (err) {
        throw err;
    }
}

export async function PDFConvertInterface(file: Buffer, fileName: string, format: 'png' | 'jpeg') {
    const id: SessionID = await createSession();
    try {
        const sessionPath: string = `./src/backend/sessions/${id}`;
        const baseName = fileName.replace(/\.[^/.]+$/, '');
        await Bun.write(`${sessionPath}/input.pdf`, file);

        const isPDF: Boolean = await checkFormat(sessionPath);
        if (!isPDF) throw new Error('File is NOT a PDF file');

        if (format === 'png') {
            return await convertToPNGService(baseName, sessionPath);
        }

        return await convertToJPGService(baseName, sessionPath);
    } catch (err) {
        throw err;
    } finally {
        cleanSession(id);
    }
}
