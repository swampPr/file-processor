import sharp from 'sharp';

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

export async function JPGConvertInterface(file: Buffer, format: 'webp' | 'png') {
    try {
        if (format === 'webp') {
            const webp: Buffer = await JPGToWebP(file);

            return webp;
        }

        const png: Buffer = await JPGToPNG(file);

        return png;
    } catch (err) {
        throw err;
    }
}
