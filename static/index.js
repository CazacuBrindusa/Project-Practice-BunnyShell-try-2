document.addEventListener("DOMContentLoaded", () => {
    const dropArea = document.getElementById("drop-area");
    const jsonFileInput = document.getElementById("json-file-input");
    const convertBtn = document.getElementById("convert-btn");
    const resultContainer = document.getElementById("result-container");
    const dropMessage = document.getElementById("drop-message");

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    dropArea.addEventListener('drop', handleDrop, false);
    jsonFileInput.addEventListener('change', () => handleFiles(jsonFileInput.files), false);
    convertBtn.addEventListener('click', convertToYaml, false);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropArea.classList.add('highlight');
    }

    function unhighlight() {
        dropArea.classList.remove('highlight');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        const fileList = [...files];
        const validFile = fileList.find(file => file.type === "application/json");

        if (validFile) {
            dropMessage.style.display = 'none';
            jsonFileInput.files = dt.files; // Set the file input to the dropped file
        } else {
            alert('Please select a JSON file.');
        }
    }

    async function convertToYaml() {
        const formData = new FormData();
        const files = jsonFileInput.files;

        if (files.length === 0) {
            alert('Please select a file to convert.');
            return;
        }

        formData.append('file', files[0]);

        try {
            const response = await fetch('/convert', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Conversion failed');
            }

            const result = await response.json();
            if (result.file) {
                const link = document.createElement('a');
                link.href = result.file;
                link.download = result.file.split('/').pop();
                link.click();
            } else {
                throw new Error('Failed to get download link');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to convert file.');
        }
    }
});
