import { Logger } from '../utils/utils.ts';
import { WEBPCompressService } from '../services/WebPCompressService.ts';
import type { Context } from 'hono';

const log = new Logger();

export async function WEBPCompressHandler(c: Context) {
    try {
        const file: Buffer = c.get('decompressedFile');

        const compressedWEBP: Buffer = await WEBPCompressService(file);

        c.header('X-File-Type', 'WEBP');
        return c.body(compressedWEBP);
    } catch (err) {
        log.Error(err);
        c.status(500);
        return c.json({
            error: 'Something went wrong...',
        });
    }
}
