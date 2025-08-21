import { Logger } from '../utils/utils.ts';
import type { Context } from 'hono';
import { splitPDFInterface } from '../services/PDFSplitService.ts';

const log = new Logger();

export async function PDFSplitHandler(c: Context) {
    try {
        const [fileName]: string = c.get('filename').split('.pdf');
        if (!fileName) throw new Error('Filename is missing');

        const file: Buffer = c.get('decompressedFile');

        const zipBuf: Buffer = await splitPDFInterface(file, fileName);
        c.header('X-File-Type', 'ZIP');
        return c.body(zipBuf);
    } catch (err) {
        log.Error(err);
        c.status(500);
        return c.json({
            error: 'Something went wrong...',
        });
    }
}
