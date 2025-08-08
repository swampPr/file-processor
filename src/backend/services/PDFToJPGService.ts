import type { SessionID } from '../utils/utils.ts';
import { Logger } from '../utils/utils.ts';
import AdmZip from 'adm-zip';
import { cleanSession, createSession } from '../utils/utils.ts';
import { mkdir } from 'node:fs/promises';
import { fromBuffer } from 'pdf2pic';

const zip = new AdmZip();
const log = new Logger();

interface PDFInfo {
    readonly IMGFolder: string;
    readonly dpi: number;
    readonly numOfPages: number | string | RegExpMatchArray;
}

async function getPDFInfo(filePath: string, id: SessionID) {
    try {
        const pdfInfoProc = Bun.spawn(['pdfinfo', 'input.pdf'], {
            cwd: filePath,
        });

        const pdfInfoStdout = await new Response(pdfInfoProc.stdout).text();
        const pagesLine = pdfInfoStdout
            .split('\n')
            .find((line) => line.startsWith('Pages:'));
        if (!pagesLine) throw new Error('Could not find page count in pdfinfo output');

        const numOfPages = pagesLine.match(/\d+/);
        if (!numOfPages) throw new Error('Failed to parse page count');

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

export async function convertToJPGService(file: Buffer, fileName: string) {
    try {
        const id: SessionID = await createSession();
        Bun.write(`./src/backend/sessions/${id}/input.pdf`, file);

        const filePath: string = `./src/backend/sessions/${id}/`;
        const fileInfo: PDFInfo = await getPDFInfo(filePath, id);

        const options = {
            density: fileInfo.dpi,
            format: 'jpg',
            quality: 75,
            saveFilename: fileName,
            savePath: fileInfo.IMGFolder,
        };

        const convert = fromBuffer(file, options);

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

        cleanSession(id);
        return convertedBuf;
    } catch (err) {
        throw err;
    }
}
