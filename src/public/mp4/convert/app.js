import { checkSize, gzipFile, turnToFile } from '../../utils/utils.js';

const selectFormat = document.getElementById('output-format');
const uploadTag = document.getElementById('upload-mp4');
const errorWrapper = document.getElementById('error-wrapper');
const downloadFileWrapper = document.getElementById('download-file');
const uploadBtn = document.getElementById('upload-file-btn');
const spinner = document.getElementById('upload-spinner');
const selectFileBtn = document.getElementById('upload-btn');
let file;

async function fetchConverted(formData, format) {
    const response = await fetch(`/api/mp4/convert/${format}`, {
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
    const mimeType = response.headers.get('Content-Type');
    const fileObj = turnToFile(blob, fileName, mimeType, `.${format}`);

    return {
        downloadUrl,
        fileName: fileObj.name,
    };
}

function renderConverted(convertedInfo) {
    spinner.style.display = 'none';
    selectFileBtn.style.display = 'inline-block';

    document.getElementById('download-file-link').href = convertedInfo.downloadUrl;
    document.getElementById('download-file-link').textContent = 'Click here to download';
    document.getElementById('download-file-link').download = convertedInfo.fileName;

    document.getElementById('returned-file-info').textContent =
        'Your file has been successfully converted';

    document.getElementById('download-file-link').addEventListener('click', () => {
        setTimeout(() => {
            setTimeout(() => {
                URL.revokeObjectURL(convertedInfo.downloadUrl);
            });
        });
    });

    downloadFileWrapper.style.display = 'block';
}

uploadTag.addEventListener('change', () => {
    const [fileName] = uploadTag.files[0].name.split('.mp4');
    file = uploadTag.files[0];

    const truncated = fileName.length > 50 ? `${fileName.substring(0, 37)}.....` : fileName;

    document.getElementById('file-selected-wrapper').innerHTML =
        `File selected: <b>${truncated}</b><b>.mp4</b>`;

    uploadBtn.style.display = 'inline-block';
});

uploadBtn.addEventListener('click', async () => {
    const selectedFormat = selectFormat.value;

    if (selectedFormat !== 'mp3' && selectedFormat !== 'flac' && selectedFormat !== 'webm') {
        errorWrapper.style.display = 'block';
        document.getElementById('error').textContent = 'You must select an output format.';
        return;
    }

    const below500mb = checkSize(file);
    if (below500mb.error) {
        errorWrapper.style.display = 'block';
        document.getElementById('error').textContent = below500mb.error;

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
            spinner.style.display = 'none';
            errorWrapper.style.display = 'block';
            document.getElementById('error').textContent = 'Something went wrong...';

            return;
        }

        renderConverted(convertedInfo);
    } catch (err) {
        console.error(err);

        spinner.style.display = 'none';
        errorWrapper.style.display = 'block';
        document.getElementById('error').textContent = 'Something went wrong...';
    }
});
