import sharp from 'sharp';

async function WEBPToPNG(file: Buffer) {
    try {
        const png: Buffer = await sharp(file).png().toBuffer();
        return png;
    } catch (err) {
        throw err;
    }
}

async function WEBPToJPG(file: Buffer) {
    try {
        const jpg: Buffer = await sharp(file).jpeg().toBuffer();
        return jpg;
    } catch (err) {
        throw err;
    }
}

export async function WEBPConvertInterface(file: Buffer, format: 'png' | 'jpeg') {
    try {
        if (format === 'jpeg') {
            const jpg: Buffer = await WEBPToJPG(file);

            return jpg;
        }

        const png: Buffer = await WEBPToPNG(file);

        return png;
    } catch (err) {
        throw err;
    }
}
