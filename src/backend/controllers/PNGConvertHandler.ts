import type { Context } from 'hono';
import { PNGConvertInterface } from '../services/PNGConvertService.ts';
import { Logger } from '../utils/utils.ts';

const log = new Logger();

export async function PNGConvertHandler(c: Context) {
    try {
        const format = c.req.header('Accept')!.split('/')[1];

        if (format !== 'webp' && format !== 'jpeg') {
            c.status(400);
            return c.json({
                error: 'You  can only convert a PNG to WebP or JPEG',
            });
        }

        format === 'webp' ? c.header('X-File-Type', 'WEBP') : c.header('X-File-Type', 'JPEG');

        const file: Buffer = c.get('decompressedFile');

        const imgResponse: Buffer = await PNGConvertInterface(file, format);
        return c.body(imgResponse);
    } catch (err) {
        log.Error(err);
        return c.json({
            error: 'Something went wrong...',
        });
    }
}
