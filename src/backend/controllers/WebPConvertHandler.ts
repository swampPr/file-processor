import { Logger } from '../utils/utils.ts';
import type { Context } from 'hono';
import { WEBPConvertInterface } from '../services/WebPConvertService.ts';

const log = new Logger();

export async function WebPConvertHandler(c: Context) {
    try {
        const { format } = c.req.param();

        if (format !== 'jpeg' && format !== 'png') {
            c.status(400);
            return c.json({
                error: 'You can only convert a WebP image to PNG or JPEG',
            });
        }

        const file: Buffer = c.get('decompressedFile');

        c.header('X-File-Type', format.toUpperCase());
        const imgResponse: Buffer = await WEBPConvertInterface(file, format);
        return c.body(imgResponse);
    } catch (err) {
        c.status(500);
        log.Error(err);
        return c.json({
            error: 'Something went wrong...',
        });
    }
}
