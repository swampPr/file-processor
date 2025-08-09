import { Logger } from '../utils/utils.ts';
import type { Context } from 'hono';
import { WEBPConvertInterface } from '../services/WebPConvertService.ts';

const log = new Logger();

export async function WebPConvertHandler(c: Context) {
    try {
        const format = c.req.header('Accept')!.split('/')[1];

        if (format !== 'jpeg' && format !== 'png') {
            c.status(400);
            return c.json({
                error: 'You can only convert a WebP image to PNG or JPEG',
            });
        }

        format === 'jpeg' ? c.header('X-File-Type', 'PNG') : c.header('X-File-Type', 'JPEG');

        const file: Buffer = c.get('decompressedFile');

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
