import type { Context } from 'hono';
import { Logger } from '../utils/utils.ts';
import { PDFConvertInterface } from '../services/PDFConvertService.ts';

const log = new Logger();

export async function PDFConvertHandler(c: Context) {
    try {
        const { format } = c.req.param();
        const file: Buffer = c.get('decompressedFile');
        const fileName: string = c.get('filename');

        if (format !== 'png' && format !== 'jpeg') {
            c.status(400);
            return c.json({
                error: 'You can only convert a PDF to PNG or JPEG, please check URL parameters',
            });
        }

        const convertedFile = await PDFConvertInterface(file, fileName, format);

        c.header('X-File-Type', format!.toUpperCase());
        return c.body(convertedFile);
    } catch (err) {
        log.Error(err);
        c.status(500);
        c.json({
            error: 'Something went wrong...',
        });
    }
}
