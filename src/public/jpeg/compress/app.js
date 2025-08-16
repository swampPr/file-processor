import { checkSize, turnToFile, gzipFile } from '../../utils/utils.js';

const selectFileBtn = document.getElementById('upload-btn');
const uploadTag = document.getElementById('upload-jpeg');
const errorWrapper = document.getElementById('error-wrapper');
const uploadBtn = document.getElementById('upload-file-btn');
const fileSelectedWrapper = document.getElementById('file-selected-wrapper');
const spinner = document.getElementById('upload-spinner');
const downloadFileWrapper = document.getElementById('download-file');
let file;

async function fetchCompressed(formData) {
    try {
        const response = await fetch(`/api/jpeg/compress`, {
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
    } catch (err) {
        throw err;
    }
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
        `The file is now <b>${sizeDifference}%</b> smaller!`;

    document.getElementById('download-file-link').addEventListener('click', () => {
        setTimeout(() => {
            URL.revokeObjectURL(fileInfo.downloadUrl);
        }, 300);
    });

    downloadFileWrapper.style.display = 'block';
}

uploadTag.addEventListener('change', () => {
    const [filename] = uploadTag.files[0].name.split(/\.(?:jpe?g)$/i);
    file = uploadTag.files[0];

    const truncated = filename.length > 50 ? `${filename.substring(0, 37)}.....` : filename;

    fileSelectedWrapper.style.display = 'block';
    document.getElementById('file-selected').innerHTML =
        `File selected: <b>${truncated}</b><b>.jpeg</b>`;

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

        //TODO: FIX ERROR HANDLING
        const fileInfo = await fetchCompressed(formData);
        const { error } = fileInfo;
        if (error) {
            errorWrapper.style.display = 'inline-block';
            document.getElementById('error').textContent = error;
            spinner.style.display = 'none';

            return;
        }

        renderCompressed(fileInfo);
    } catch (err) {
        console.error(err);
        errorWrapper.style.display = 'block';
        document.getElementById('error').textContent = 'Something went wrong...';
    }
});
