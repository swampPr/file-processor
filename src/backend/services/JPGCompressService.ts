import sharp from 'sharp';

export async function JPGCompressService(file: Buffer) {
    try {
        const compressedJPG: Buffer = await sharp(file)
            .jpeg({
                quality: 40,
            })
            .toBuffer();

        return compressedJPG;
    } catch (err) {
        throw err;
    }
}
