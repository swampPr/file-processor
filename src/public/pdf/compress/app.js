import { gzipFile, checkSize, turnToFile } from '../../utils/utils.js';

const fileSelectedWrapper = document.getElementById('file-selected-wrapper');
const uploadFileBtn = document.getElementById('upload-file-btn');
const selectFileButton = document.getElementById('upload-btn');
const downloadFileBtn = document.getElementById('download-file-link');
const downloadFileWrapper = document.getElementById('download-file');
const downloadFileInfo = document.getElementById('returned-file-info');
const uploadTag = document.getElementById('upload-pdf');
const spinner = document.getElementById('upload-spinner');
const errorWrapper = document.getElementById('error-wrapper');

let file;

async function fetchCompressed(formData, aggressive = false) {
    const response = await fetch('/api/pdf/compress', {
        method: 'POST',
        headers: {
            'X-Aggro': `${aggressive}`,
        },
        body: formData,
    });

    if (response.status === 500) {
        const error = await response.json();
        return error;
    } else if (response.status === 400) {
        console.error(await response.json());
        return {
            error: 'Something went wrong...',
        };
    }

    const blob = await response.blob();

    const downloadUrl = URL.createObjectURL(blob);
    const fileName = response.headers.get('X-File-Name');
    const originalFileSize = response.headers.get('X-File-Size');
    const newFileSize = response.headers.get('Content-Length');

    return {
        downloadUrl,
        fileName,
        originalFileSize,
        newFileSize,
    };
}

function renderCompressed(fileInfo) {
    spinner.style.display = 'none';
    selectFileButton.style.display = 'inline-block';

    downloadFileBtn.href = fileInfo.downloadUrl;
    downloadFileBtn.textContent = 'Click here to download';
    downloadFileBtn.download = fileInfo.fileName;

    const sizeDifference = Math.abs(
        ((fileInfo.newFileSize - fileInfo.originalFileSize) / fileInfo.originalFileSize) * 100
    ).toFixed(0);

    downloadFileInfo.innerHTML = `The file is now <b>${sizeDifference}%</b> smaller!`;

    downloadFileBtn.addEventListener('click', () => {
        setTimeout(() => {
            URL.revokeObjectURL(fileInfo.downloadUrl);
        }, 300);
    });

    downloadFileWrapper.style.display = 'block';
}

uploadTag.addEventListener('change', () => {
    const [fileName] = uploadTag.files[0].name.split('.pdf');
    file = uploadTag.files[0];

    const truncated = fileName.length > 50 ? `${fileName.substring(0, 37)}.....` : fileName;

    fileSelectedWrapper.style.display = 'block';
    document.getElementById('file-selected').innerHTML =
        `File Selected: <b>${truncated}</b><b>.pdf</b>`;
    uploadFileBtn.style.display = 'inline-block';
});

uploadFileBtn.addEventListener('click', async () => {
    const below500mb = checkSize(file);
    const { error } = below500mb;
    if (error) {
        errorWrapper.style.display = 'block';
        document.getElementById('error').textContent = error;

        return;
    }

    downloadFileWrapper.style.display = 'none';
    selectFileButton.style.display = 'none';

    spinner.style.display = 'flex';

    try {
        const gzippedFile = await gzipFile(file);

        const formData = new FormData();
        formData.append('file', gzippedFile);

        const fileInfo = await fetchCompressed(
            formData,
            document.getElementById('aggressive-check').checked ? true : undefined
        );

        const { error } = fileInfo;
        if (error) {
            errorWrapper.style.display = 'block';
            document.getElementById('error').textContent = error;
            spinner.style.display = 'none';

            return;
        }

        renderCompressed(fileInfo);
    } catch (err) {
        console.error(err);

        spinner.style.display = 'none';
        errorWrapper.style.display = 'block';
        document.getElementById('error').textContent = 'Something went wrong...';
    }
});
