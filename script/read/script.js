import detectSquare from "./detectSquare.js";
import Utf8Adapter from "../adapter/utf8Adapter.js";
import * as util from '../util.js';
import CmyReader from "./readers/cmyReader.js";

const readers = Object.freeze({
    "cmy": new CmyReader()
});

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

    const res = detectSquare(readers["cmy"], bgr, {
        steps: util.config.showSteps,
        display: display,
        displayStep: util.config.showSteps ? display : () => {
        },
        log: log
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
    log.value += typeof message === "undefined" ? tag || "" : `${tag}: ${message}`;
    log.scrollTop = log.scrollHeight;
}

function matToCanvas(mat) {
    const canvas = document.createElement("canvas");

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

function initCapture() {
    const pic = document.getElementById("camera");
    const modal = document.getElementById("cam-modal");
    const closeModal = document.querySelector("#cam-modal .modal-close");
    const bgModal = document.querySelector("#cam-modal .modal-background");
    const cancelModal = document.querySelector("#modal-cancel");
    const takePic = document.querySelector("#modal-takepic");
    closeModal.addEventListener("click", () => modal.classList.remove("is-active"));
    cancelModal.addEventListener("click", () => modal.classList.remove("is-active"));
    bgModal.addEventListener("click", () => modal.classList.remove("is-active"));
    pic.addEventListener("click", () => {
        modal.classList.add("is-active");

        navigator.mediaDevices.getUserMedia({video: true, audio: false})
            .then(stream => {
                video.srcObject = stream;
                video.play();
            });
    });
    const video = document.getElementById("video");
    const canvas = document.createElement("canvas");

    takePic.addEventListener("click", ev => {
        const context = canvas.getContext("2d");

        if (video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const data = canvas.toDataURL("image/png");
            modal.classList.remove("is-active");
            loadImage(data, image => process(image));
        }

        ev.preventDefault();
    })
}

let initialized = false;

function init() {
    if (initialized) return;
    initialized = true;

    log("cv", "Loaded");

    initCapture();

    const uploader = document.getElementById("upload");
    uploader.disabled = false;
    uploader.addEventListener("change", begin);
}

document.getElementById("data").value = document.getElementById("log").value = "";

const cvScript = document.getElementById("cv");
cvScript.addEventListener("load", () => {
    init();
});
if (window.cvLoaded) init();