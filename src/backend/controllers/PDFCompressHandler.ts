import type { Context } from 'hono';
import { Logger } from '../utils/utils.ts';
import { PDFCompressService } from '../services/PDFCompressService.ts';
const log = new Logger();

export async function PDFCompressHandler(c: Context) {
    try {
        const file: Buffer = c.get('decompressedFile');
        const aggressive: string = c.req.header('X-Aggro') as string;

        if (aggressive === 'true') {
            log.Log('Aggressive PDF Compression Enabled');
            const aggressiveCompress: Buffer = await PDFCompressService(true, file);

            c.header('X-File-Type', 'PDF');
            return c.body(aggressiveCompress);
        } else if (aggressive === 'false') {
            const defaultCompress: Buffer = await PDFCompressService(false, file);

            c.header('X-File-Type', 'PDF');
            return c.body(defaultCompress);
        } else {
            c.status(400);
            return c.json({
                error: 'Aggressive compression header must only be "true" or "false"',
            });
        }
    } catch (err) {
        log.Error(err);
        c.status(500);
        return c.json({
            error: 'Something went wrong',
        });
    }
}
