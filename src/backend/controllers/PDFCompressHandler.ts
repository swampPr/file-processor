import type { Context } from 'hono';
import { Logger } from '../utils/utils.ts';
import { PDFCompressService } from '../services/PDFCompressService.ts';

const log = new Logger();

export async function PDFCompressHandler(c: Context) {
    try {
        const file: Buffer = c.get('decompressedPDF');
        const aggressive: string | undefined = c.req.header('X-Aggro');

        if (aggressive) {
            const aggressiveCompress: Buffer = await PDFCompressService(true, file);

            c.header('X-File-Type', 'PDF');
            return c.body(aggressiveCompress);
        }

        const defaultCompress: Buffer = await PDFCompressService(false, file);

        c.header('X-File-Type', 'PDF');
        return c.body(defaultCompress);
    } catch (err) {
        log.Error(err);
        c.status(500);
        return c.json({
            error: 'Something went wrong',
        });
    }
}
