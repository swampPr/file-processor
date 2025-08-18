import { checkSize, gzipFile, turnToFile } from '../../utils/utils.js';

const errorWrapper = document.getElementById('error-wrapper');
const selectFormat = document.getElementById('output-format');
const selectFileBtn = document.getElementById('upload-btn');
const uploadTag = document.getElementById('upload-webp');
const uploadBtn = document.getElementById('upload-file-btn');
const fileSelectedWrapper = document.getElementById('file-selected-wrapper');
const spinner = document.getElementById('upload-spinner');
const downloadFileWrapper = document.getElementById('download-file');
let file;

async function fetchConverted(formData, format) {
    const response = await fetch(`/api/webp/convert/${format}`, {
        method: 'POST',
        body: formData,
    });

    if (response.status === 500) {
        const error = await response.json();
    } else if (response.status === 400) {
        console.error(await response.json());

        return {
            error: 'Something went wrong...',
        };
    }

    const blob = await response.blob();

    const downloadUrl = URL.createObjectURL(blob);
    const fileName = response.headers.get('X-File-Name');
    const outputFormat = response.headers.get('Content-Type').split('/')[1];
    const mimeType = response.headers.get('Content-Type');
    const fileObj = turnToFile(blob, fileName, mimeType, `.${outputFormat}`);

    return {
        downloadUrl,
        fileName: fileObj.name,
    };
}

function renderConverted(fileInfo) {
    spinner.style.display = 'none';
    selectFileBtn.style.display = 'inline-block';

    document.getElementById('download-file-link').href = fileInfo.downloadUrl;
    document.getElementById('download-file-link').textContent = 'Click here to download';
    document.getElementById('download-file-link').download = fileInfo.fileName;

    document.getElementById('returned-file-info').textContent =
        `Your file has been successfully converted`;

    document.getElementById('download-file-link').addEventListener('click', () => {
        setTimeout(() => {
            URL.revokeObjectURL(fileInfo.downloadUrl);
        });
    });

    downloadFileWrapper.style.display = 'block';
}

uploadTag.addEventListener('change', () => {
    const [fileName] = uploadTag.files[0].name.split('.webp');
    console.log(fileName);
    file = uploadTag.files[0];

    const truncated = fileName.length > 50 ? `${fileName.substring(0, 37)}.....` : fileName;

    fileSelectedWrapper.style.display = 'block';
    document.getElementById('file-selected').innerHTML =
        `File selected: <b>${truncated}</b><b>.webp</b>`;

    uploadBtn.style.display = 'inline-block';
});

uploadBtn.addEventListener('click', async () => {
    const selectedFormat = selectFormat.value;

    if (selectedFormat !== 'pdf' && selectedFormat !== 'jpeg' && selectedFormat !== 'png') {
        errorWrapper.style.display = 'block';
        document.getElementById('error').textContent = 'You must select an output format. ';

        return;
    }

    const below500mb = checkSize(file);

    if (below500mb.error) {
        spinner.style.display = 'none';
        errorWrapper.style.display = 'block';
        document.getElementById('error').textContent = below500mb.error;

        return;
    }

    downloadFileWrapper.style.display = 'none';
    selectFileBtn.style.display = 'flex';
    spinner.style.display = 'flex';
    errorWrapper.style.display = 'none';

    try {
        const gzippedFile = await gzipFile(file);

        const formData = new FormData();
        formData.append('file', gzippedFile);

        const fileInfo = await fetchConverted(formData, selectedFormat);
        if (fileInfo.error) {
            spinner.style.display = 'none';
            errorWrapper.style.display = 'block';
            document.getElementById('error').textContent = fileInfo.error;

            return;
        }

        renderConverted(fileInfo);
    } catch (err) {
        console.error(err);

        spinner.style.display = 'none';
        errorWrapper.style.display = 'block';
        document.getElementById('error').textContent = 'Something went wrong...';
    }
});
