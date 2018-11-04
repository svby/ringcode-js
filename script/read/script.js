import detectSquare from "./detectSquare.js";
import Utf8Adapter from "../adapter/utf8Adapter.js";
import * as util from '../util.js';

function process(source) {
    display(source);

    let image;

    image = cv.imread(source);

    log();

    log("read", "Loaded image");

    let bgr = new cv.Mat;
    cv.cvtColor(image, bgr, cv.COLOR_BGRA2BGR);

    log("read", "Converted image to BGR color space");

    display(bgr);

    const res = detectSquare(bgr, log, util.config.showSteps ? display : () => {
    });

    log();

    log("read", `result: ${res}`);

    if (res === null) {
        log("read", "Aborted");
    } else if (typeof res === "undefined") {
        log("read", "The tag could not be scanned.")
    } else {
        const data = document.getElementById("data");
        data.value = new Utf8Adapter().decode(res);
    }

    log("read", "Done");

    image.delete();
}

function log(tag, message) {
    const log = document.getElementById("log");
    if (log.value) log.value += "\n";
    log.value += typeof message === "undefined" ? message || "" : `${tag}: ${message}`;
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

function begin() {
    document.getElementById("log").value = "";

    log("config", `Draw steps: ${util.config.showSteps}`);

    const uploader = document.getElementById("upload");
    const fileName = document.getElementById("upload-name");

    const file = uploader.files[0];
    log("read", `Loading image ${file.name}`);

    fileName.innerHTML = file.name;

    let reader = new FileReader();
    reader.addEventListener("load", () => {
        loadImage(reader.result, (image) => process(image))
    });

    if (file) reader.readAsDataURL(file);
}

function init() {
    const uploader = document.getElementById("upload");
    uploader.addEventListener("change", begin);
}

document.getElementById("data").value = document.getElementById("log").value = "";

const cvScript = document.getElementById("cv");
cvScript.addEventListener("load", () => {
    init();
});