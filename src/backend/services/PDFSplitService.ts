import type { SessionID } from '../utils/utils.ts';
import { cleanSession, createSession } from '../utils/utils.ts';
import AdmZip from 'adm-zip';
import { mkdir } from 'node:fs/promises';

const zip = new AdmZip();

async function checkFormat(sessionPath: string) {
    const proc = Bun.spawn(['pdfinfo', 'input.pdf'], {
        cwd: sessionPath,
        stderr: 'pipe',
        stdout: 'pipe',
    });
    const output = await proc.stdout.text();

    await proc.exited;

    return output.toLowerCase().includes('pdf version');
}

async function splitPDF(sessionPath: string, fileName: string, pdfOutputFolder: string) {
    await Bun.spawn(
        [
            'gs',
            '-dNOPAUSE',
            '-dBATCH',
            '-sDEVICE=pdfwrite',
            `-sOutputFile=${pdfOutputFolder}/${fileName}-%d.pdf`,
            `${sessionPath}/input.pdf`,
        ],
        {
            stderr: 'ignore',
            stdout: 'ignore',
        }
    ).exited;

    await zip.addLocalFolderPromise(pdfOutputFolder, {});
    const zipBuf: Buffer = await zip.toBufferPromise();

    return zipBuf;
}

export async function splitPDFInterface(file: Buffer, fileName: string) {
    const id: SessionID = await createSession();

    try {
        const sessionPath: string = `./src/backend/sessions/${id}`;
        await Bun.write(`${sessionPath}/input.pdf`, file);
        const isPDF: boolean = await checkFormat(sessionPath);
        if (!isPDF) throw new Error('File is NOT a PDF file');

        const pdfOutputFolder: string = `${sessionPath}/${fileName}`;
        await mkdir(pdfOutputFolder);

        const zipBuf: Buffer = await splitPDF(sessionPath, fileName, pdfOutputFolder);

        return zipBuf;
    } finally {
        cleanSession(id);
    }
}
