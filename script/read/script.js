import detectSquare from "./detectSquare.js";
import Utf8Adapter from "../adapter/utf8Adapter.js";
import * as util from '../util.js';

function process(source) {
    display(source);

    let image;

    image = cv.imread(source);

    let bgr = new cv.Mat;
    cv.cvtColor(image, bgr, cv.COLOR_BGRA2BGR);

    display(bgr);

    const res = detectSquare(bgr, log, util.config.showSteps ? display : () => {
    });
    console.log(res);

    const data = document.getElementById("data");
    data.value = new Utf8Adapter().decode(res);

    image.delete();
}

function log(message) {
    const log = document.getElementById("log");
    if (log.value) log.value += "\n";
    log.value += message;
    log.scrollTop = log.scrollHeight;
}

function matToCanvas(mat) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    cv.imshow(canvas, mat);

    return canvas;
}

function display(source) {
    let image;

    if (source instanceof Image) image = source;
    else if (source instanceof ImageData) {
        const temp = document.createElement("canvas");
        temp.width = source.width;
        temp.height = source.height;
        temp.putImageData(source);
        image = temp;
    } else image = matToCanvas(source);

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const width = canvas.width, height = canvas.height;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    const scale = Math.min(height / image.height, width / image.width);

    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;

    const x = (width - scaledWidth) / 2;
    const y = (height - scaledHeight) / 2;

    ctx.drawImage(image, x, y, scaledWidth, scaledHeight)
}

function loadImage(data, callback) {
    const image = new Image;

    image.addEventListener("load", function () {
        callback(image);
    });

    image.src = data;
}

function setImage() {
    const uploader = document.getElementById("upload");
    const fileName = document.getElementById("upload-name");

    const file = uploader.files[0];

    fileName.innerHTML = file.name;

    let reader = new FileReader();
    reader.addEventListener("load", () => {
        loadImage(reader.result, (image) => process(image))
    });

    if (file) reader.readAsDataURL(file);
}

function init() {
    const uploader = document.getElementById("upload");
    uploader.addEventListener("change", setImage);
}

document.getElementById("data").value = null;
document.getElementById("log").value = null;

const cvScript = document.getElementById("cv");
cvScript.addEventListener("load", () => {
    init();
});