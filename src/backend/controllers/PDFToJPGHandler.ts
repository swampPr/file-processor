import type { Context } from 'hono';
import { Logger } from '../utils/utils.ts';
import { convertToJPGService } from '../services/PDFToJPGService.ts';

const log = new Logger();

export async function convertToJPGHandler(c: Context) {
    try {
        const file: Buffer = c.get('decompressedPDF');
        const fileName: string = c.get('filename').split('.pdf')[0];
        const response = await convertToJPGService(file, fileName);

        return c.body(response);
    } catch (err) {
        log.Error(err);
        c.status(500);
        c.json({
            error: 'Something went wrong...',
        });
    }
}
