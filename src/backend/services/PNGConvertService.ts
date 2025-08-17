import sharp from 'sharp';
import type { SessionID } from '../utils/utils.ts';
import { cleanSession, createSession, checkFormat } from '../utils/utils.ts';
import { PDFDocument } from 'pdf-lib';

async function PNGToPDF(img: Buffer) {
    const pngEmbed: ArrayBuffer = Uint8Array.from(img).buffer;

    const pdfDoc = await PDFDocument.create();

    const pngImage = await pdfDoc.embedPng(pngEmbed);

    const pngDims = pngImage.scale(0.5);

    const page = pdfDoc.addPage();

    const maxWidth = 400;
    const maxHeight = 500;

    let drawWidth = pngDims.width;
    let drawHeight = pngDims.height;

    if (drawWidth > maxWidth || drawHeight > maxHeight) {
        const scaleX = maxWidth / drawWidth;
        const scaleY = maxHeight / drawHeight;
        const scale = Math.min(scaleX, scaleY);

        drawWidth *= scale;
        drawHeight *= scale;
    }

    page.drawImage(pngImage, {
        x: (page.getWidth() - drawWidth) / 2,
        y: (page.getHeight() - drawHeight) / 2,
        width: drawWidth,
        height: drawHeight,
    });

    const pdfBytes: Uint8Array = await pdfDoc.save();
    const pdfBuf: Buffer = Buffer.from(pdfBytes);
    return pdfBuf;
}

async function PNGToJPG(file: Buffer) {
    const jpg: Buffer = await sharp(file).jpeg().toBuffer();
    return jpg;
}

async function PNGToWebP(file: Buffer) {
    const webp: Buffer = await sharp(file).webp().toBuffer();
    return webp;
}

export async function PNGConvertInterface(file: Buffer, format: 'webp' | 'jpeg' | 'pdf') {
    const id: SessionID = await createSession();
    try {
        const sessionPath: string = `./src/backend/sessions/${id}`;
        await Bun.write(`${sessionPath}/input.png`, file);

        const isPNG: Boolean = await checkFormat(sessionPath, 'input.png', 'png');
        if (!isPNG) throw new Error('File is NOT a PNG file');

        if (format === 'webp') {
            const webp: Buffer = await PNGToWebP(file);

            return webp;
        } else if (format === 'pdf') {
            const pdf: Buffer = await PNGToPDF(file);

            return pdf;
        }

        const jpg: Buffer = await PNGToJPG(file);

        return jpg;
    } finally {
        cleanSession(id);
    }
}
