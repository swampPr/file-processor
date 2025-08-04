import type { Context, Next } from 'hono';

//INFO: Some more middlewares still need to be added for file types MP3, and MP4

export default class Middlewares {
    private InfoHelper(c: Context) {
        return {
            name: c.get('filename'),
            MIME: c.get('MIME'),
            size: c.get('size'),
        };
    }
    async ParseFile(c: Context, next: Next) {
        try {
            const body = await c.req.parseBody();
            const file = body['file'] as File;

            c.set('file', file);
            c.set('filename', file.name);
            c.set('MIME', file.type);
            c.set('size', file.size);

            await next();
        } catch (err) {
            c.status(500);
            return c.json({
                error: 'Something went wrong...',
            });
        }
    }

    async PDFGunzip(c: Context, next: Next) {
        try {
            const file: File = c.get('file');

            const fileBuffer: Uint8Array = Buffer.from(await file.arrayBuffer());
            const decompressedPDF: Uint8Array = Bun.gunzipSync(fileBuffer);

            c.set('decompressedPDF', decompressedPDF);

            await next();
        } catch (err) {
            c.status(500);
            return c.json({
                error: 'Something went wrong...',
            });
        }
    }

    async JPGHeaders(c: Context, next: Next) {
        const fileInfo = this.InfoHelper(c);
        c.header('Content-Type', 'image/jpeg');
        c.header('X-File-Name', fileInfo.name);
        c.header('X-File-Type', fileInfo.MIME);
        c.header('X-File-Size', fileInfo.size);

        await next();
    }

    async WebPHeaders(c: Context, next: Next) {
        const fileInfo = this.InfoHelper(c);
        c.header('Content-Type', 'image/webp');
        c.header('X-File-Name', fileInfo.name);
        c.header('X-File-Type', fileInfo.MIME);
        c.header('X-File-Size', fileInfo.size);

        await next();
    }

    async PNGHeaders(c: Context, next: Next) {
        const fileInfo = this.InfoHelper(c);
        c.header('Content-Type', 'image/png');
        c.header('X-File-Name', fileInfo.name);
        c.header('X-File-Type', fileInfo.MIME);
        c.header('X-File-Size', fileInfo.size);

        await next();
    }

    async PDFGzipHeaders(c: Context, next: Next) {
        const fileInfo = this.InfoHelper(c);
        c.header('Content-Type', 'application/pdf');
        c.header('Content-Encoding', 'application/gzip');
        c.header('X-File-Name', fileInfo.name);
        c.header('X-File-Type', fileInfo.MIME);
        c.header('X-File-Size', fileInfo.size);

        await next();
    }
}
