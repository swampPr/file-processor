import { checkSize, gzipFile } from '../../utils/utils.js';

const selectFileBtn = document.getElementById('upload-btn');
const uploadTag = document.getElementById('upload-mp4');
const errorWrapper = document.getElementById('error-wrapper');
const uploadBtn = document.getElementById('upload-file-btn');
const fileSelectedWrapper = document.getElementById('file-selected-wrapper');
const spinner = document.getElementById('upload-spinner');
const downloadFileWrapper = document.getElementById('download-file');
let file;

async function fetchCompressed(formData, aggressive = false) {
    const response = await fetch('/api/mp4/compress', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Aggro': `${aggressive}`,
        },
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

    document.getElementById('download-file-link').href = fileInfo.downloadUrl;
    document.getElementById('download-file-link').textContent = 'Click here to download';
    document.getElementById('download-file-link').download = fileInfo.fileName;

    const sizeDifference = Math.abs(
        ((fileInfo.newFileSize - fileInfo.originalFileSize) / fileInfo.originalFileSize) * 100
    ).toFixed(0);

    document.getElementById('returned-file-info').innerHTML =
        `The file is <b>${sizeDifference}%</b> smaller!`;

    document.getElementById('download-file-link').addEventListener('click', () => {
        setTimeout(() => {
            URL.revokeObjectURL(fileInfo.downloadUrl);
        });
    });

    downloadFileWrapper.style.display = 'block';
}

uploadTag.addEventListener('change', () => {
    const [fileName] = uploadTag.files[0].name.split('.mp4');
    file = uploadTag.files[0];

    const truncated = fileName.length > 50 ? `${fileName.substring(0, 37)}.....` : fileName;

    fileSelectedWrapper.style.display = 'block';
    document.getElementById('file-selected').innerHTML =
        `File Selected: <b>${truncated}</b><b>.mp4</b>`;

    uploadBtn.style.display = 'inline-block';
});

uploadBtn.addEventListener('click', async () => {
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

        const fileInfo = await fetchCompressed(
            formData,
            document.getElementById('aggressive-check').checked ? true : undefined
        );
        if (fileInfo.error) {
            errorWrapper.style.display = 'block';
            document.getElementById('error').textContent = fileInfo.error;
            spinner.style.display = 'none';

            return;
        }

        renderCompressed(fileInfo);
    } catch (err) {
        console.error(err);

        errorWrapper.style.display = 'block';
        document.getElementById('error').textContent = 'Something went wrong...';
        spinner.style.display = 'none';
    }
});
