import { createSession, cleanSession, PDFGzip } from '../utils/utils.ts';
import { rename } from 'node:fs/promises';
import type { SessionID } from '../utils/utils.ts';
import { arrayBuffer } from 'node:stream/consumers';

//TODO: Find a way to add the input file into the sessions/{ID} directory under the name (input.<fileextension>)
export async function PDFCompressService(file: File) {
    try {
        const id: SessionID = await createSession();
        const fileArrBuffer: ArrayBuffer = await file.arrayBuffer();
        const fileName = file.name;
        await Bun.write(`./src/backend/sessions/${id}`, fileArrBuffer);
        await rename(`./src/backend/sessions/${id}/${fileName}`, `./src/backend/sessions/${id}/input.pdf`);
        //NOTE: After this handle the actual compressing using pdfcpu
    } catch (err) {}
}
