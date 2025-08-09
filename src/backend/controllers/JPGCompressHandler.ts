import type { Context } from 'hono';
import { Logger } from '../utils/utils.ts';
import { JPGCompressService } from '../services/JPGCompressService.ts';

const log = new Logger();

export async function JPGCompressHandler(c: Context) {
    try {
        const file: Buffer = c.get('decompressedFile');

        const compressedJPG: Buffer = await JPGCompressService(file);

        c.header('X-File-Type', 'JPEG');
        return c.body(compressedJPG);
    } catch (err) {
        log.Error(err);
        c.status(500);
        return c.json({
            error: 'Something went wrong...',
        });
    }
}
