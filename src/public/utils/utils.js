export async function gzipFile(file) {
    const fileStream = file.stream();

    const cs = new CompressionStream('gzip');

    const compressedData = fileStream.pipeThrough(cs);

    const compressedBlob = await new Response(compressedData).blob();

    const compressedFile = new File([compressedBlob], file.name + '.gz', {
        type: compressedBlob.type,
    });

    return compressedFile;
}

export function checkSize(file) {
    //INFO: If file size is larger than 500mb
    if (file.size > 1024 * 1024 * 500) return { error: 'File is too large' };

    return true;
}

export function turnToFile(blob, fileName, mimeType, ext = false) {
    if (ext) {
        const base = fileName.replace(/\.[^/.]+$/, '');
        const name = base + ext;

        return new File([blob], name, { type: mimeType });
    }

    return new File([blob], fileName, { type: mimeType });
}
