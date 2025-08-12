import type { SessionID } from '../utils/utils.ts';
import { Logger } from '../utils/utils.ts';
import { cleanSession, createSession } from '../utils/utils.ts';
import AdmZip from 'adm-zip';
import { mkdir } from 'node:fs/promises';
import { fromPath } from 'pdf2pic';

const zip = new AdmZip();
const log = new Logger();

type PDFInfo = {
    readonly IMGFolder: string;
    readonly dpi: number;
    readonly numOfPages: number | 'Failed to parse page count';
};

async function getPDFInfo(filePath: string) {
    try {
        const pdfInfoProc = Bun.spawn(['pdfinfo', 'input.pdf'], {
            cwd: filePath,
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
            dpi: 96,
            numOfPages,
        };
    } catch (err) {
        throw err;
    }
}

async function convertToJPGService(fileName: string, filePath: string) {
    try {
        const fileInfo: PDFInfo = await getPDFInfo(filePath);

        const options = {
            density: fileInfo.dpi,
            format: 'jpeg',
            quality: 75,
            saveFilename: fileName,
            savePath: fileInfo.IMGFolder,
        };

        const convert = fromPath(`${filePath}/input.pdf`, options);

        const convertedInfo = await convert.bulk(-1, { responseType: 'image' });
        log.Log('PDF Now converted to JPEG');

        if (
            fileInfo.numOfPages === 'Failed to parse page count' ||
            Number(fileInfo.numOfPages) > 1
        ) {
            await zip.addLocalFolderPromise(`${fileInfo.IMGFolder}`, {});
            const zipToBuffer: Buffer = await zip.toBufferPromise();

            return zipToBuffer;
        }

        const converted = Bun.file(`${convertedInfo[0]!.path}`);
        const convertedBuf: Buffer = Buffer.from(await converted.arrayBuffer());
        return convertedBuf;
    } catch (err) {
        throw err;
    }
}

async function convertToPNGService(fileName: string, filePath: string) {
    try {
        const fileInfo: PDFInfo = await getPDFInfo(filePath);

        const options = {
            density: fileInfo.dpi,
            format: 'png',
            quality: 75,
            saveFilename: fileName,
            savePath: fileInfo.IMGFolder,
        };

        const convert = fromPath(`${filePath}/input.pdf`, options);

        const convertedInfo = await convert.bulk(-1, { responseType: 'image' });
        log.Log('PDF Now converted to PNG');

        if (
            fileInfo.numOfPages === 'Failed to parse page count' ||
            Number(fileInfo.numOfPages) > 1
        ) {
            await zip.addLocalFolderPromise(`${fileInfo.IMGFolder}`, {});
            const zipToBuffer: Buffer = await zip.toBufferPromise();

            return zipToBuffer;
        }

        const converted = Bun.file(`${convertedInfo[0]!.path}`);
        const convertedBuf: Buffer = Buffer.from(await converted.arrayBuffer());

        return convertedBuf;
    } catch (err) {
        throw err;
    }
}

export async function PDFConvertInterface(file: Buffer, fileName: string, format: 'png' | 'jpeg') {
    const id: SessionID = await createSession();
    try {
        await Bun.write(`./src/backend/sessions/${id}/input.pdf`, file);
        const inputFilePath: string = `./src/backend/sessions/${id}`;

        if (format === 'png') {
            const pngBuf: Buffer = await convertToPNGService(fileName, inputFilePath);

            cleanSession(id);
            return pngBuf;
        }

        const jpgBuf: Buffer = await convertToJPGService(fileName, inputFilePath);
        return jpgBuf;
    } catch (err) {
        throw err;
    } finally {
        cleanSession(id);
    }
}
