import { gzipFile, checkSize, turnToFile } from '../../utils/utils.js';

const formatSelect = document.getElementById('output-format');
const selectFileBtn = document.getElementById('upload-btn');
const downloadFileWrapper = document.getElementById('download-file');
const downloadFileBtn = document.getElementById('download-file-link');
const uploadBtn = document.getElementById('upload-file-btn');
const errorWrapper = document.getElementById('error-wrapper');
const spinner = document.getElementById('upload-spinner');
const uploadTag = document.getElementById('upload-pdf');
const fileSelected = document.getElementById('file-selected-wrapper');
let file;

async function fetchConverted(formData, format) {
    const response = await fetch(`/api/pdf/convert/${format}`, {
        method: 'POST',
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
    const outputFormat = response.headers.get('Content-Type').split('/')[1];
    const mimeType = response.headers.get('Content-Type');
    const fileObj = turnToFile(blob, fileName, mimeType, `.${outputFormat}`);

    return {
        downloadUrl,
        fileName: fileObj.name,
    };
}

function renderConverted(convertedInfo) {
    spinner.style.display = 'none';
    selectFileBtn.style.display = 'inline-block';

    downloadFileBtn.href = convertedInfo.downloadUrl;
    downloadFileBtn.textContent = 'Click here to download';
    downloadFileBtn.download = convertedInfo.fileName;

    document.getElementById('returned-file-info').textContent =
        'Your file has been successfully converted';

    downloadFileBtn.addEventListener('click', () => {
        setTimeout(() => {
            URL.revokeObjectURL(convertedInfo.downloadUrl);
        }, 300);
    });

    downloadFileWrapper.style.display = 'block';
}

uploadTag.addEventListener('change', () => {
    const [fileName] = uploadTag.files[0].name.split('.pdf');
    file = uploadTag.files[0];

    const truncated = fileName.length > 50 ? `${fileName.substring(0, 37)}.....` : fileName;

    fileSelected.style.display = 'block';
    document.getElementById('file-selected').innerHTML =
        `File selected: <b>${truncated}</b><b>.pdf</b>`;
    uploadBtn.style.display = 'inline-block';
});

uploadBtn.addEventListener('click', async () => {
    const selectedFormat = formatSelect.value;

    if (selectedFormat !== 'jpeg' && selectedFormat !== 'png') {
        errorWrapper.style.display = 'block';
        document.getElementById('error').textContent = 'You must select an output format.';
        return;
    }

    const below500 = checkSize(file);
    const { error } = below500;

    if (error) {
        errorWrapper.style.display = 'block';
        document.getElementById('error').textContent = error;

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

        const convertedInfo = await fetchConverted(formData, selectedFormat);
        if (convertedInfo.error) {
            errorWrapper.style.display = 'block';
            spinner.style.display = 'none';
            document.getElementById('error').textContent = 'Something went wrong...';

            return;
        }

        renderConverted(convertedInfo);
    } catch (err) {
        console.error(err);

        errorWrapper.style.display = 'block';
        document.getElementById('error').textContent = 'Something went wrong...';
    }
});
