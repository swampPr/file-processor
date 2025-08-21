import { checkSize, gzipFile } from '../../utils/utils.js';

const uploadTag = document.getElementById('upload-pdf');
const selectFileBtn = document.getElementById('upload-btn');
const errorWrapper = document.getElementById('error-wrapper');
const uploadBtn = document.getElementById('upload-file-btn');
const fileSelectedWrapper = document.getElementById('file-selected-wrapper');
const spinner = document.getElementById('upload-spinner');
const downloadFileWrapper = document.getElementById('download-file');
let file;

async function fetchSplit(formData) {
    const response = await fetch('/api/pdf/split', {
        body: formData,
        method: 'POST',
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
    const [fileName] = response.headers.get('X-File-Name').split(/\.(?=[^.]*$)/);

    return {
        downloadUrl,
        fileName,
    };
}

function renderZip(fileInfo) {
    spinner.style.display = 'none';
    selectFileBtn.style.display = 'inline-block';

    document.getElementById('download-file-link').href = fileInfo.downloadUrl;
    document.getElementById('download-file-link').download = fileInfo.fileName;
    document.getElementById('download-file-link').textContent = 'Click here to download';

    document.getElementById('returned-file-info').textContent = 'Your file has been split';

    document.getElementById('download-file-link').addEventListener('click', () => {
        setTimeout(() => {
            URL.revokeObjectURL(fileInfo.downloadUrl);
        });
    });

    downloadFileWrapper.style.display = 'block';
}

uploadTag.addEventListener('change', () => {
    const [fileName] = uploadTag.files[0].name.split('.pdf');
    file = uploadTag.files[0];

    const truncated = fileName.length > 50 ? `${fileName.substring(0, 37)}.....` : fileName;

    fileSelectedWrapper.style.display = 'block';
    document.getElementById('file-selected').innerHTML =
        `File selected: <b>${truncated}</b><b>.pdf</b>`;
    uploadBtn.style.display = 'inline-block';
});

uploadBtn.addEventListener('click', async () => {
    const below500 = checkSize(file);
    if (below500.error) {
        errorWrapper.style.display = 'block';
        document.getElementById('error').textContent = below500.error;

        return;
    }

    downloadFileWrapper.style.display = 'none';
    selectFileBtn.style.display = 'none';
    spinner.style.display = 'flex';
    errorWrapper.style.display = 'none';

    try {
        const gzippedFile = await gzipFile(file);

        const formData = new FormData();
        formData.append('file', gzippedFile);

        const splitZipInfo = await fetchSplit(formData);
        if (splitZipInfo.error) {
            errorWrapper.style.display = 'block';
            document.getElementById('error').textContent = splitZipInfo.error;
            spinner.style.display = 'none';

            return;
        }

        renderZip(splitZipInfo);
    } catch (err) {
        console.error(err);

        errorWrapper.style.display = 'block';
        document.getElementById('error').textContent = 'Something went wrong...';
    }
});
