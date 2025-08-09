import sharp from 'sharp';

export async function WEBPCompressService(file: Buffer) {
    try {
        const compressedWEBP: Buffer = await sharp(file)
            .webp({
                quality: 40,
            })
            .toBuffer();

        return compressedWEBP;
    } catch (err) {
        throw err;
    }
}
