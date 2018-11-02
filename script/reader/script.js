const reader = new FileReader;

function display(image) {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const width = canvas.width, height = canvas.height;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    const scale = Math.min(height / image.height, width / image.width);

    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;

    const x = (width - scaledWidth) / 2;
    const y = (height - scaledHeight) / 2;

    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
}

function process(data) {
    const image = new Image;
    image.addEventListener("load", function () {
        display(image);
    });

    image.src = data;
}

function setImage() {
    const uploader = document.getElementById("upload");
    const fileName = document.getElementById("upload-name");

    const file = uploader.files[0];

    fileName.innerHTML = file.name;

    let reader = new FileReader;
    reader.addEventListener("load", () => process(reader.result));

    if (file) reader.readAsDataURL(file);
}

function init() {
    const uploader = document.getElementById("upload");
    uploader.addEventListener("change", setImage);
}

init();