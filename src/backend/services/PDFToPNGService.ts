import type { SessionID } from '../utils/utils.ts';
import { cleanSession, createSession, Logger } from '../utils/utils.ts';
import type { PDFInfo } from './PDFToJPGService.ts';
import AdmZip from 'adm-zip';
import { fromBuffer } from 'pdf2pic';
import { mkdir } from 'node:fs/promises';

const zip = new AdmZip();
const log = new Logger();

async function getPDFInfo(filePath: string) {
    try {
        const pdfInfoProc = Bun.spawn(['pdfinfo', 'input.pdf'], {
            cwd: filePath,
        });

        const pdfInfoStdout = await new Response(pdfInfoProc.stdout).text();
        const pagesLine = pdfInfoStdout
            .split('\n')
            .find((line) => line.startsWith('Pages:'));

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

export async function convertToPNGService(file: Buffer, fileName: string) {
    try {
        const id: SessionID = await createSession();
        Bun.write(`./src/backend/sessions/${id}/input.pdf`, file);

        const filePath: string = `./src/backend/sessions/${id}/`;
        const fileInfo: PDFInfo = await getPDFInfo(filePath);

        const options = {
            density: fileInfo.dpi,
            format: 'png',
            quality: 75,
            saveFilename: fileName,
            savePath: fileInfo.IMGFolder,
        };

        const convert = fromBuffer(file, options);

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

        cleanSession(id);
        return convertedBuf;
    } catch (err) {
        throw err;
    }
}
