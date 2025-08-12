import type { Context } from 'hono';
import { Logger } from '../utils/utils.ts';
import { MP4ConvertService } from '../services/MP4ConvertService.ts';

const log = new Logger();

export async function MP4ConverHandler(c: Context) {
    try {
        const file: Buffer = c.get('decompressedFile');
        const { format } = c.req.param();

        if (format !== 'mp3' && format !== 'webm' && format !== 'flac') {
            c.status(400);
            return c.json({
                error: 'You can only convert an MP4 file to MP3 or WebM',
            });
        }

        const responseBuf: Buffer = await MP4ConvertService(file, format);

        c.header('X-File-Type', format.toUpperCase());
        return c.body(responseBuf);
    } catch (err) {
        log.Error(err);
        c.status(500);
        return c.json({
            error: 'Something went wrong...',
        });
    }
}
