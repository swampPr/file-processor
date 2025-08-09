import sharp from 'sharp';

async function PNGToJPG(file: Buffer) {
    try {
        const jpg: Buffer = await sharp(file).jpeg().toBuffer();
        return jpg;
    } catch (err) {
        throw err;
    }
}

async function PNGToWebP(file: Buffer) {
    try {
        const webp: Buffer = await sharp(file).webp().toBuffer();
        return webp;
    } catch (err) {
        throw err;
    }
}

export async function PNGConvertInterface(file: Buffer, format: 'webp' | 'jpeg') {
    try {
        if (format === 'webp') {
            const webp: Buffer = await PNGToWebP(file);

            return webp;
        }

        const jpg: Buffer = await PNGToJPG(file);

        return jpg;
    } catch (err) {
        throw err;
    }
}
