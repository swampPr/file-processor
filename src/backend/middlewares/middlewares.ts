import type { Context, Next } from 'hono';
import { Logger } from '../utils/utils.ts';
import { gzip, ungzip } from 'node-gzip';

const log = new Logger();

export default class Middlewares {
    ParseFile = async (c: Context, next: Next) => {
        try {
            const body = await c.req.parseBody();
            const file = body['file'] as File;

            c.set('file', file);
            c.set('filename', file.name);
            c.set('MIME', file.type);
            c.set('size', file.size);

            await next();
        } catch (err) {
            log.Error(err);
            c.status(500);
            return c.json({
                error: 'Something went wrong...',
            });
        }
    };

    PDFGunzip = async (c: Context, next: Next) => {
        try {
            const file: File = c.get('file');

            const fileBuffer: ArrayBuffer = await file.arrayBuffer();
            const decompressedPDF: Buffer = await ungzip(fileBuffer);
            console.time('Unzip');
            log.Log('PDF has been unzipped');
            console.timeEnd('Unzip');

            c.set('decompressedPDF', decompressedPDF);

            await next();
        } catch (err) {
            log.Error(err);
            c.status(500);
            return c.json({
                error: 'Something went wrong...',
            });
        }
    };

    JPGHeaders = async (c: Context, next: Next) => {
        c.header('Content-Type', 'image/jpeg');
        c.header('X-File-Name', c.get('filename').split('.gz')[0]);

        await next();
    };

    WebPHeaders = async (c: Context, next: Next) => {
        c.header('Content-Type', 'image/webp');
        c.header('X-File-Name', c.get('filename').split('gz')[0]);

        await next();
    };

    PNGHeaders = async (c: Context, next: Next) => {
        c.header('Content-Type', 'image/png');
        c.header('X-File-Name', c.get('filename').split('.gz')[0]);

        await next();
    };

    PDFGzipHeaders = async (c: Context, next: Next) => {
        c.header('Content-Type', 'application/pdf');
        c.header('Content-Encoding', 'application/gzip');
        c.header('X-File-Name', c.get('filename').split('.gz')[0]);

        await next();
    };
}
