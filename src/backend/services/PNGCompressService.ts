import sharp from 'sharp';

export async function PNGCompressService(file: Buffer) {
    try {
        const compressedPNG: Buffer = await sharp(file)
            .png({
                quality: 40,
            })
            .toBuffer();

        return compressedPNG;
    } catch (err) {
        throw err;
    }
}
