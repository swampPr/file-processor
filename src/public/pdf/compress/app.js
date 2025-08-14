import { gzipFile, checkSize, turnToFile } from '../../utils/utils.js';

const fileSelectedWrapper = document.getElementById('file-selected-wrapper');
const uploadFileBtn = document.getElementById('upload-file-btn');
const selectFileButton = document.getElementById('upload-btn');
const uploadTag = document.getElementById('upload-pdf');
const spinner = document.getElementById('upload-spinner');
const errorWrapper = document.getElementById('error-wrapper');

let file;

async function fetchCompressed(formData) {
    try {
        //TODO: Implement aggressive compression: X-Aggro header
        const response = await fetch('/api/pdf/compress', {
            method: 'POST',
            body: formData,
        });

        if (response.status !== 200) {
            const { error } = await response.json();
            throw error;
        }

        const blob = await response.blob();

        const downloadUrl = URL.createObjectURL(blob);
        const fileName = response.headers.get('X-File-Name');
        const mimeType = response.headers.get('Content-Type');
        const originalFileSize = response.headers.get('X-File-Size');
        const newFileSize = response.headers.get('Content-Length');
        const fileObj = turnToFile(blob, fileName, mimeType);

        return {
            fileObj,
            downloadUrl,
            fileName,
            originalFileSize,
            newFileSize,
        };
    } catch (err) {
        throw err;
    }
}

uploadTag.addEventListener('change', () => {
    const [fileName] = uploadTag.files[0].name.split('.pdf');
    file = uploadTag.files[0];

    const truncated = fileName.length > 40 ? fileName.substring(0, 37) : fileName;

    fileSelectedWrapper.style.display = 'block';
    document.getElementById('file-selected').innerHTML =
        `File Selected: <b>${truncated}</b>.....<b>.pdf</b>`;
    uploadFileBtn.style.display = 'inline-block';
});

uploadFileBtn.addEventListener('click', async () => {
    const below500mb = checkSize(file);
    if (!below500mb) {
        errorWrapper.style.display = 'block';
        document.getElementById('error').textContent = 'File is too large';

        return;
    }

    const gzippedFile = await gzipFile(file);

    const formData = new FormData();
    formData.append('file', gzippedFile);

    const fileInfo = await fetchCompressed(formData);

    //TODO: renderCompressed(fileInfo);
    //INFO: Useful information for creating the download link;
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = 'example.pdf'; // optional: filename
    // document.body.appendChild(a);
    // URL.revokeObjectURL(url); // cleanup
});
