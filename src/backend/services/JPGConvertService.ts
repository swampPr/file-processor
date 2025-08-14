import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import type { SessionID } from '../utils/utils.ts';
import { cleanSession, createSession, checkFormat } from '../utils/utils.ts';

async function JPGToPDF(img: Buffer) {
    const jpgEmbed: ArrayBuffer = Uint8Array.from(img).buffer;

    const pdfDoc = await PDFDocument.create();

    const jpgImage = await pdfDoc.embedPng(jpgEmbed);

    const jpgDims = jpgImage.scale(0.5);

    const page = pdfDoc.addPage();

    const maxWidth = 400;
    const maxHeight = 500;

    let drawWidth = jpgDims.width;
    let drawHeight = jpgDims.height;

    if (drawWidth > maxWidth || drawHeight > maxHeight) {
        const scaleX = maxWidth / drawWidth;
        const scaleY = maxHeight / drawHeight;
        const scale = Math.min(scaleX, scaleY);

        drawWidth *= scale;
        drawHeight *= scale;
    }

    page.drawImage(jpgImage, {
        x: (page.getWidth() - drawWidth) / 2,
        y: (page.getHeight() - drawHeight) / 2,
        width: drawWidth,
        height: drawHeight,
    });

    const pdfBytes: Uint8Array = await pdfDoc.save();
    const pdfBuf: Buffer = Buffer.from(pdfBytes);
    return pdfBuf;
}

async function JPGToPNG(file: Buffer) {
    try {
        const png: Buffer = await sharp(file).png().toBuffer();
        return png;
    } catch (err) {
        throw err;
    }
}

async function JPGToWebP(file: Buffer) {
    try {
        const webp: Buffer = await sharp(file).webp().toBuffer();
        return webp;
    } catch (err) {
        throw err;
    }
}

export async function JPGConvertInterface(file: Buffer, format: 'webp' | 'png' | 'pdf') {
    const id: SessionID = await createSession();
    try {
        const sessionPath = `./src/backend/sessions/${id}`;
        await Bun.write(`${sessionPath}/input.jpeg`, file);

        const isJPG: Boolean = await checkFormat(sessionPath, 'input.jpeg', 'jpeg');
        if (!isJPG) throw new Error('File is NOT a JPEG image');

        if (format === 'webp') {
            try {
                const webp: Buffer = await JPGToWebP(file);

                return webp;
            } catch (err) {
                throw err;
            }
        } else if (format === 'pdf') {
            try {
                const pdf: Buffer = await JPGToPDF(file);

                return pdf;
            } catch (err) {
                throw err;
            }
        }

        const png: Buffer = await JPGToPNG(file);

        return png;
    } catch (err) {
        throw err;
    } finally {
        cleanSession(id);
    }
}
