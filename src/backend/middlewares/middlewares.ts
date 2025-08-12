import type { Context, Next } from 'hono';
import { Logger } from '../utils/utils.ts';
import { ungzip } from 'node-gzip';

const log = new Logger();

export default class Middlewares {
    ParseFile = async (c: Context, next: Next) => {
        try {
            const body = await c.req.parseBody();
            const file = body['file'] as File;

            c.set('file', file);
            c.set('filename', file.name.split('.gz')[0]);
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

    FileUnzip = async (c: Context, next: Next) => {
        try {
            const file: File = c.get('file');

            const fileBuffer: ArrayBuffer = await file.arrayBuffer();
            const decompressedFile: Buffer = await ungzip(fileBuffer);
            console.time('Unzip');
            log.Log('File has been unzipped');
            console.timeEnd('Unzip');

            c.set('decompressedFile', decompressedFile);

            await next();
        } catch (err) {
            log.Error(err);
            c.status(500);
            return c.json({
                error: 'Something went wrong...',
            });
        }
    };

    CheckForHeader = (header: string) => {
        return async (c: Context, next: Next) => {
            const headerCheck: string = c.req.header(header)!;
            if (!headerCheck) {
                c.status(400);
                return c.json({
                    error: `You must provide the following header: ${header}`,
                });
            }

            await next();
        };
    };

    MP3Headers = async (c: Context, next: Next) => {
        c.header('Content-Type', 'audio/mpeg');
        c.header('X-File-Name', c.get('filename'));

        await next();
    };

    WebMHeaders = async (c: Context, next: Next) => {
        c.header('Content-Type', 'video/webm');
        c.header('X-File-Name', c.get('filename'));

        await next();
    };

    MP4Headers = async (c: Context, next: Next) => {
        c.header('Content-Type', 'video/mp4');
        c.header('X-File-Name', c.get('filename'));

        await next();
    };

    FLACHeaders = async (c: Context, next: Next) => {
        c.header('Content-Type', 'audio/flac');
        c.header('X-File-Name', c.get('filename'));

        await next();
    };

    JPGHeaders = async (c: Context, next: Next) => {
        c.header('Content-Type', 'image/jpeg');
        c.header('X-File-Name', c.get('filename'));

        await next();
    };

    WebPHeaders = async (c: Context, next: Next) => {
        c.header('Content-Type', 'image/webp');
        c.header('X-File-Name', c.get('filename'));

        await next();
    };

    PNGHeaders = async (c: Context, next: Next) => {
        c.header('Content-Type', 'image/png');
        c.header('X-File-Name', c.get('filename'));

        await next();
    };

    PDFHeaders = async (c: Context, next: Next) => {
        c.header('Content-Type', 'application/pdf');
        c.header('X-File-Name', c.get('filename'));

        await next();
    };

    PDFGzipHeaders = async (c: Context, next: Next) => {
        c.header('Content-Type', 'application/pdf');
        c.header('Content-Encoding', 'application/gzip');
        c.header('X-File-Name', c.get('filename'));

        await next();
    };
}
