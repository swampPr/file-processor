import { checkSize, gzipFile, turnToFile } from '../../utils/utils.js';
const uploadTag = document.getElementById('upload-png');
const selectFileBtn = document.getElementById('upload-btn');
const uploadFileBtn = document.getElementById('upload-file-btn');
const errorWrapper = document.getElementById('error-wrapper');
const fileSelectedWrapper = document.getElementById('file-selected-wrapper');
const spinner = document.getElementById('upload-spinner');
const downloadFileWrapper = document.getElementById('download-file');
let file;

async function fetchCompressed(formData) {
    const response = await fetch('/api/png/compress', {
        method: 'POST',
        body: formData,
    });

    if (response.status === 500) {
        const error = await response.json();
        return error.error;
    } else if (response.status === 400) {
        console.error(await response.json());

        return {
            error: 'Something went wrong...',
        };
    }

    const blob = await response.blob();

    const downloadUrl = URL.createObjectURL(blob);
    const fileName = response.headers.get('X-File-Name');
    const mimeType = response.headers.get('Content-Type');
    const originalFileSize = response.headers.get('X-File-Size');
    const newFileSize = response.headers.get('Content-Length');
    const fileObj = turnToFile(blob, fileName, mimeType);

    return {
        downloadUrl,
        fileObj,
        originalFileSize,
        fileName,
        newFileSize,
    };
}

function renderCompressed(fileInfo) {
    spinner.style.display = 'none';
    selectFileBtn.style.display = 'inline-block';

    document.getElementById('download-file-link').href = fileInfo.downloadUrl;
    document.getElementById('download-file-link').textContent = 'Click here to download';
    document.getElementById('download-file-link').download = fileInfo.fileName;

    const sizeDifference = Math.abs(
        ((fileInfo.newFileSize - fileInfo.originalFileSize) / fileInfo.originalFileSize) * 100
    ).toFixed(0);

    document.getElementById('returned-file-info').innerHTML =
        `The file is not <b>${sizeDifference}%</b> smaller!`;

    document.getElementById('download-file-link').addEventListener('click', () => {
        setTimeout(() => {
            URL.revokeObjectURL(fileInfo.downloadUrl);
        }, 300);
    });

    downloadFileWrapper.style.display = 'block';
}

uploadTag.addEventListener('change', () => {
    const [fileName] = uploadTag.files[0].name.split('.png');
    file = uploadTag.files[0];

    const truncated = fileName.length > 50 ? `${fileName.substring(0, 37)}.....` : fileName;

    fileSelectedWrapper.style.display = 'block';
    document.getElementById('file-selected').innerHTML =
        `File selected: <b>${truncated}</b><b>.png</b>`;

    uploadFileBtn.style.display = 'inline-block';
});

uploadFileBtn.addEventListener('click', async () => {
    const below500mb = checkSize(file);
    if (below500mb.error) {
        errorWrapper.style.display = 'block';
        document.getElementById('error').textContent = below500mb.error;

        return;
    }

    downloadFileWrapper.style.display = 'none';
    selectFileBtn.style.display = 'none';

    spinner.style.display = 'flex';

    try {
        const gzippedFile = await gzipFile(file);

        const formData = new FormData();
        formData.append('file', gzippedFile);

        const fileInfo = await fetchCompressed(formData);
        if (fileInfo.error) {
            spinner.style.display = 'none';
            errorWrapper.style.display = 'block';
            document.getElementById('error').textContent = fileInfo.error;

            return;
        }

        renderCompressed(fileInfo);
    } catch (err) {
        console.error(err);

        errorWrapper.style.display = 'block';
        document.getElementById('error').textContent = 'Something went wrong...';
    }
});
