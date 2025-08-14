import type { Context } from 'hono';
import { Logger } from '../utils/utils.ts';
import { MP4CompressService } from '../services/MP4CompressService.ts';

const log = new Logger();

export async function MP4CompressHandler(c: Context) {
    try {
        const file: Buffer = c.get('decompressedFile');
        const aggro: string = c.req.header('X-Aggro') as string;

        if (aggro === 'true') {
            log.Log('Aggressive MP4 Compression Enabled');
            const compressedResponse: Buffer = await MP4CompressService(file, true);

            c.header('X-File-Type', 'MP4');
            return c.body(compressedResponse);
        } else if (aggro === 'false') {
            const compressedResponse: Buffer = await MP4CompressService(file, false);

            c.header('X-File-Type', 'MP4');
            return c.body(compressedResponse);
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
            error: 'Something went wrong...',
        });
    }
}
