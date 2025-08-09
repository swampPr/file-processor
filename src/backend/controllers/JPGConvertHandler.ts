import type { Context } from 'hono';
import { Logger } from '../utils/utils.ts';
import { JPGConvertInterface } from '../services/JPGConvertService.ts';

const log = new Logger();

export async function JPGConvertHandler(c: Context) {
    try {
        const { format } = c.req.param();
        if (format !== 'webp' && format !== 'png') {
            c.status(400);
            return c.json({
                error: 'You can only convert a JPEG to WebP or PNG',
            });
        }

        const file: Buffer = c.get('decompressedFile');

        c.header('X-File-Type', format.toUpperCase());
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
