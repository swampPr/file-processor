import type { Context } from 'hono';
import { Logger } from '../utils/utils.ts';
import { JPGConvertInterface } from '../services/JPGConvertService.ts';

const log = new Logger();

export async function JPGConvertHandler(c: Context) {
    try {
        const format = c.req.header('Accept')!.split('/')[1];
        if (format !== 'webp' && format !== 'png') {
            c.status(400);
            return c.json({
                error: 'You can only convert a JPEG to WebP or PNG',
            });
        }
        format === 'webp' ? c.header('X-File-Type', 'WEBP') : c.header('X-File-Type', 'PNG');

        const file: Buffer = c.get('decompressedFile');

        const imgResponse: Buffer = await JPGConvertInterface(file, format);
        return c.body(imgResponse);
    } catch (err) {
        c.status(500);
        log.Error(err);
        return c.json({
            error: 'Something went wrong...',
        });
    }
}
