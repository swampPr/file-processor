import type { Context } from 'hono';
import { PNGConvertInterface } from '../services/PNGConvertService.ts';
import { Logger } from '../utils/utils.ts';

const log = new Logger();

export async function PNGConvertHandler(c: Context) {
    try {
        const { format } = c.req.param();

        if (format !== 'webp' && format !== 'jpeg') {
            c.status(400);
            return c.json({
                error: 'You  can only convert a PNG to WebP or JPEG',
            });
        }

        const file: Buffer = c.get('decompressedFile');

        c.header('X-File-Type', format.toUpperCase());
        const imgResponse: Buffer = await PNGConvertInterface(file, format);
        return c.body(imgResponse);
    } catch (err) {
        log.Error(err);
        return c.json({
            error: 'Something went wrong...',
        });
    }
}
