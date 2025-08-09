import type { Context } from 'hono';
import { Logger } from '../utils/utils.ts';
import { PNGCompressService } from '../services/PNGCompressService.ts';

const log = new Logger();

export async function PNGCompressHandler(c: Context) {
    try {
        const file = c.get('decompressedFile');

        const compressedPNG: Buffer = await PNGCompressService(file);

        c.header('X-File-Type', 'PNG');
        return c.body(compressedPNG);
    } catch (err) {
        log.Error(err);
        c.status(500);
        c.json({
            error: 'Something went wrong...',
        });
    }
}
